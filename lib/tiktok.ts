// lib/tiktok.ts
import { prisma } from "@/lib/prisma";

type SyncOpts = {
  /** how many ads to fetch (for mock mode or future API paging) */
  limit?: number;
  /** force mock regardless of env */
  mock?: boolean;
};

type TikTokAd = {
  id: string;          // required (used as PK in AdPerformance)
  name?: string;
  impressions?: number;
  spend?: number;
};

const isMock = () =>
  (process.env.INTEGRATIONS_MODE || process.env.TIKTOK_MODE || "mock")
    .toLowerCase() === "mock";

/**
 * Fetch ads from TikTok (mock for now).
 * When you have real API tokens, replace this with a real fetch().
 */
async function fetchTikTokAds(opts: SyncOpts = {}): Promise<TikTokAd[]> {
  const useMock = opts.mock ?? isMock();
  const limit = Math.max(1, Math.min(opts.limit ?? 10, 200));

  if (useMock) {
    // Generate mock ads
    const items: TikTokAd[] = Array.from({ length: limit }, (_, i) => ({
      id: `tt_ad_${i + 1}`,
      name: `Mock TikTok Ad #${i + 1}`,
      impressions: Math.floor(Math.random() * 10_000),
      spend: Number((Math.random() * 50).toFixed(2)),
    }));
    return items;
  }

  // TODO: replace with real TikTok Marketing API call
  // Example shape (pseudo):
  // const res = await fetch("https://business-api.tiktok.com/.../ads", { headers: { Authorization: `Bearer ${token}` }});
  // const json = await res.json();
  // return json.data.map((a: any) => ({ id: a.id, name: a.name, impressions: a.stats.impressions, spend: a.stats.spend }));
  return [];
}

/**
 * Sync TikTok ads into AdPerformance table.
 * Only guarantees the row exists (by id). We don't write any non-existent fields.
 */
export async function syncTikTokAds(opts: SyncOpts = {}): Promise<number> {
  const ads = await fetchTikTokAds(opts);

  for (const a of ads) {
    // Your AdPerformance model has: id (PK), status?, createdAt, updatedAt
    // We only write fields that definitely exist. No 'status' here.
    await prisma.adPerformance.upsert({
  where: { adId: a.id },   // <- matches your schema's unique field
  create: { adId: a.id },  // <- required in AdPerformanceCreateInput
  update: {},              // nothing to update for now
});
  }

  return ads.length;
}
