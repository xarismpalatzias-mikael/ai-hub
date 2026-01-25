// app/api/tiktok/sync/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Helpers */
const toInt = (v: any) => (v === null || v === undefined || v === "" ? null : Math.round(Number(v)));
const toFloat = (v: any) => (v === null || v === undefined || v === "" ? null : Number(v));

function calcCtr(clicks?: number | null, impressions?: number | null, fallback?: number | null) {
  if (typeof fallback === "number") return fallback;
  if (!clicks || !impressions) return null;
  return impressions > 0 ? clicks / impressions : 0;
}

function calcRoas(revenue?: number | null, spend?: number | null, fallback?: number | null) {
  if (typeof fallback === "number") return fallback;
  if (spend === null || spend === undefined || spend === 0) return null;
  if (revenue === null || revenue === undefined) return null;
  return spend > 0 ? revenue / spend : null;
}

/**
 * Accept TikTok (or any ads) performance rows and upsert into AdPerformance.
 * Body can be: a single object OR {items:[...]} OR an array of objects.
 *
 * Normalized fields we try to read:
 *  adId (ad_id | id), adName (name | adName), impressions, clicks,
 *  spend (spend | cost | spend_amount), revenue (revenue | purchase_value),
 *  ctr, cvr, roas
 */
export async function POST(req: Request) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const rows: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : payload
    ? [payload]
    : [];

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "No rows provided" }, { status: 400 });
  }

  let saved = 0;
  const errors: string[] = [];

  for (const raw of rows) {
    try {
      const adId = String(raw.adId ?? raw.ad_id ?? raw.id ?? "").trim();
      if (!adId) {
        errors.push("Row skipped: missing adId");
        continue;
      }

      const impressions = toInt(raw.impressions);
      const clicks = toInt(raw.clicks);
      const spend = toFloat(raw.spend ?? raw.cost ?? raw.spend_amount);
      const revenue = toFloat(raw.revenue ?? raw.purchase_value);

      // Build the upsert payload
      const data = {
        adId,
        adName: (raw.adName ?? raw.name ?? null) as string | null,
        impressions,
        clicks,
        spend,
        revenue,
        ctr: toFloat(calcCtr(clicks, impressions, toFloat(raw.ctr))),
        cvr: toFloat(raw.cvr ?? null), // optional; leave null if you don't send it
        roas: toFloat(calcRoas(revenue, spend, toFloat(raw.roas))),
        // If you later add a Date field to AdPerformance (e.g., "date"), set it here.
      };

      // Upsert latest snapshot per adId (your schema has adId @unique)
      await prisma.adPerformance.upsert({
        where: { adId },
        update: data,
        create: data,
      });

      // Ensure there is an AIBrain tracker row for this ad
      await prisma.aIBrain.upsert({
        where: { adId },
        update: { updatedAt: new Date() },
        create: { adId, state: "NEW" }, // first sighting -> NEW (brain.ts will progress it)
      });

      saved++;
    } catch (e: any) {
      errors.push(e?.message ?? "Unknown error saving a row");
    }
  }

  return NextResponse.json({ ok: true, saved, errors });
}

/** Optional: quick check endpoint (GET last 20 AdPerformance for sanity) */
export async function GET() {
  const last = await prisma.adPerformance.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ ok: true, count: last.length, rows: last });
}
