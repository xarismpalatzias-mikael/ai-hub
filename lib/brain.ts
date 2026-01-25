// lib/brain.ts
import prisma from "@/lib/prisma";

type BrainState = "NEW" | "TESTING" | "SCALING" | "PAUSED" | "KILLED";
type DesiredStatus = "ACTIVE" | "PAUSED";

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysAgo(d?: Date | null) {
  if (!d) return Number.POSITIVE_INFINITY;
  const diff = Date.now() - d.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

// Score 0–100 (stable)
function calcScore(ad: {
  impressions?: number | null;
  clicks?: number | null;
  spend?: number | null;
  revenue?: number | null;
  roas?: number | null;
  ctr?: number | null;
}) {
  const impressions = num(ad.impressions, 0);
  const clicks = num(ad.clicks, 0);
  const spend = num(ad.spend, 0);
  const revenue = num(ad.revenue, 0);

  const ctr =
    ad.ctr != null
      ? num(ad.ctr, 0)
      : impressions > 0
        ? clicks / impressions
        : 0;

  const roas =
    ad.roas != null
      ? num(ad.roas, 0)
      : spend > 0
        ? revenue / spend
        : 0;

  // CTR: 0%→0, 1%→40, 2%→60, 3%→75, 5%→90, 8%+→100
  const ctrScore = clamp(Math.round((ctr / 0.08) * 100), 0, 100);

  // ROAS: 0→0, 1→35, 2→65, 3→85, 4→95, 5+→100
  const roasScore = clamp(Math.round((roas / 5) * 100), 0, 100);

  // Weighted more to ROAS
  const score = Math.round(0.65 * roasScore + 0.35 * ctrScore);

  return { score, ctr, roas };
}

function decideState(input: {
  score: number;
  ctr: number;
  roas: number;
  currentState?: string | null;
  lastExecutedAt?: Date | null;
  minCtr: number; // e.g. 0.02 means 2%
  minRoas: number; // e.g. 2.5
  cooldownDays: number;
}): BrainState {
  const current = (input.currentState ?? "NEW") as BrainState;
  const inCooldown = daysAgo(input.lastExecutedAt) < input.cooldownDays;

  // Hard fail rules
  if (input.roas <= 0 && input.score < 30) return "PAUSED";

  // If in cooldown, do not downgrade
  if (inCooldown) {
    if (current === "SCALING") return "SCALING";
    if (current === "TESTING") return "TESTING";
    // NEW can still move up in cooldown
  }

  const passCtr = input.ctr >= input.minCtr;
  const passRoas = input.roas >= input.minRoas;

  // Promote rules
  if (passCtr && passRoas && input.score >= 70) return "SCALING";
  if ((passCtr || passRoas) && input.score >= 45) return "TESTING";

  // Otherwise pause
  return "PAUSED";
}

function intentForState(state: BrainState, budget: number): {
  desiredStatus: DesiredStatus;
  desiredBudget: number;
} {
  if (state === "SCALING") return { desiredStatus: "ACTIVE", desiredBudget: budget };
  if (state === "TESTING") return { desiredStatus: "ACTIVE", desiredBudget: budget };
  if (state === "NEW") return { desiredStatus: "ACTIVE", desiredBudget: Math.max(1, budget * 0.5) };
  return { desiredStatus: "PAUSED", desiredBudget: 0 };
}

// Stage 17B: execution (SAFE BY DEFAULT)
// - Default: DRY RUN (no external actions)
// - If BRAIN_EXECUTE=true => we mark lastExecutedAt and write “would execute” rows.
//   Later we can plug real TikTok calls here.
async function executeIntentsSafe(opts: {
  winners: Array<{
    adId: string;
    desiredStatus: DesiredStatus;
    desiredBudget: number;
  }>;
  execute: boolean;
}) {
  const actions: Array<{ adId: string; action: string; desiredBudget: number; desiredStatus: DesiredStatus }> = [];

  for (const w of opts.winners) {
    if (!opts.execute) {
      actions.push({
        adId: w.adId,
        action: "DRY_RUN",
        desiredBudget: w.desiredBudget,
        desiredStatus: w.desiredStatus,
      });
      continue;
    }

    // ✅ LIVE MODE placeholder (no external API calls yet)
    actions.push({
      adId: w.adId,
      action: "EXECUTE_PLACEHOLDER",
      desiredBudget: w.desiredBudget,
      desiredStatus: w.desiredStatus,
    });

    // Mark executed time in DB (this is safe)
    await prisma.aIBrain.update({
      where: { adId: w.adId },
      data: { lastExecutedAt: new Date() },
    });
  }

  return actions;
}

export async function runBrainDaily(params?: { logId?: string; mode?: "cron" | "manual" }) {
  const mode = params?.mode ?? (process.env.VERCEL ? "cron" : "manual");

  // Env knobs
  const DAILY_BUDGET = num(process.env.BRAIN_DAILY_BUDGET, 30);
  const MAX_WINNERS = Math.max(1, Math.floor(num(process.env.BRAIN_MAX_WINNERS, 3)));
  const MIN_CTR = num(process.env.BRAIN_MIN_CTR, 0.02); // 2%
  const MIN_ROAS = num(process.env.BRAIN_MIN_ROAS, 2.5);
  const COOLDOWN_DAYS = num(process.env.BRAIN_COOLOFF_DAYS, 0);
  const EXECUTE = String(process.env.BRAIN_EXECUTE ?? "false").toLowerCase() === "true";

  const started = Date.now();

  // Read ads
  const ads = await prisma.adPerformance.findMany({
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  const totalAds = ads.length;
  const brainsBefore = await prisma.aIBrain.count();

  // Score + upsert brain records
  const scored: Array<{
    adId: string;
    productId: string | null;
    score: number;
    state: BrainState;
    ctr: number;
    roas: number;
    spend: number;
    revenue: number;
    impressions: number;
    clicks: number;
    lastExecutedAt: Date | null;
  }> = [];

  for (const ad of ads) {
    const adId = String(ad.adId);
    const existing = await prisma.aIBrain.findUnique({ where: { adId } });

    const spend = num(ad.spend, 0);
    const revenue = num(ad.revenue, 0);
    const impressions = num(ad.impressions, 0);
    const clicks = num(ad.clicks, 0);

    const { score, ctr, roas } = calcScore({
      impressions,
      clicks,
      spend,
      revenue,
      roas: ad.roas,
      ctr: ad.ctr,
    });

    const state = decideState({
      score,
      ctr,
      roas,
      currentState: existing?.state ?? "NEW",
      lastExecutedAt: existing?.lastExecutedAt ?? null,
      minCtr: MIN_CTR,
      minRoas: MIN_ROAS,
      cooldownDays: COOLDOWN_DAYS,
    });

    // budget split (we decide winners later)
    const baseBudgetPerWinner = DAILY_BUDGET / MAX_WINNERS;
    const { desiredStatus, desiredBudget } = intentForState(state, baseBudgetPerWinner);

    // Upsert AiBrain
    await prisma.aIBrain.upsert({
      where: { adId },
      create: {
        adId,
        productId: null, // (we can connect to Product later when you link them)
        score,
        state,
        desiredBudget,
        desiredStatus,
        lastExecutedAt: null,
      },
      update: {
        score,
        state,
        desiredBudget,
        desiredStatus,
      },
    });

    scored.push({
      adId,
      productId: existing?.productId ?? null,
      score,
      state,
      ctr,
      roas,
      spend,
      revenue,
      impressions,
      clicks,
      lastExecutedAt: existing?.lastExecutedAt ?? null,
    });
  }

  // Pick winners: best score + must be ACTIVE intent (SCALING/TESTING/NEW)
  const candidates = scored
    .filter((x) => x.state === "SCALING" || x.state === "TESTING" || x.state === "NEW")
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_WINNERS);

  const winnersPicked = candidates.length;
  const budgetPerAd = winnersPicked > 0 ? DAILY_BUDGET / winnersPicked : 0;

  // Rewrite winner budgets precisely (so it matches return payload)
  const winners = [];
  for (const w of candidates) {
    const desiredStatus: DesiredStatus = "ACTIVE";
    const desiredBudget = budgetPerAd;

    await prisma.aIBrain.update({
      where: { adId: w.adId },
      data: { desiredStatus, desiredBudget },
    });

    winners.push({
      adId: w.adId,
      productId: w.productId ?? w.adId, // keep your old style payload (safe)
      score: w.score,
      state: w.state,
      ctr: Number((w.ctr * 100).toFixed(2)), // % in payload (like your screenshot)
      roas: Number(w.roas.toFixed(2)),
    });
  }

  // Stage 17B execution (safe default)
  const actions = await executeIntentsSafe({
    winners: winners.map((w) => ({
      adId: w.adId,
      desiredStatus: "ACTIVE",
      desiredBudget: budgetPerAd,
    })),
    execute: EXECUTE,
  });

  const brainsAfter = await prisma.aIBrain.count();

  const tookMs = Date.now() - started;

  // Optional: write/update run log note if logId exists
  if (params?.logId) {
    await prisma.brainRunLog.update({
      where: { id: params.logId },
      data: {
        ok: true,
        note: `Run OK • mode=${mode} minCTR=${MIN_CTR} minROAS=${MIN_ROAS} cooldown=${COOLDOWN_DAYS} execute=${EXECUTE}`,
        finishedAt: new Date(),
        durationMs: tookMs,
        adsSeen: totalAds,
        brainsSeen: brainsAfter,
        winnersPicked,
        budgetTotal: DAILY_BUDGET,
        budgetPerAd,
      },
    });
  }

  return {
    ok: true,
    totalAds,
    brainsTotal: brainsAfter,
    createdBrains: Math.max(0, brainsAfter - brainsBefore),
    updatedBrains: brainsBefore > 0 ? Math.min(brainsBefore, brainsAfter) : brainsAfter,
    minCTR: MIN_CTR,
    minROAS: MIN_ROAS,
    winnersPicked,
    budgetTotal: DAILY_BUDGET,
    budgetPerAd,
    winners,
    actions,
    tookMs,
  };
}
