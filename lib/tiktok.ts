import { prisma } from "@/lib/prisma";

/**
 * MOCK sync — works without TikTok Business API.
 * Controlled by env: TIKTOK_MODE=mock (default)
 */
async function syncMock() {
  const ads = [
    { id: "c1", name: "Test Ad 1", impressions: 1200, clicks: 56, spend: 14.3 },
    { id: "c2", name: "Test Ad 2", impressions: 870,  clicks: 34, spend: 9.7  },
  ];

  for (const a of ads) {
    await prisma.adPerformance.upsert({
      where: { adId: a.id },                // adId must be unique in your Prisma model
      update: {
        adName: a.name,
        impressions: a.impressions,
        clicks: a.clicks,
        spend: a.spend,
      },
      create: {
        adId: a.id,
        adName: a.name,
        impressions: a.impressions,
        clicks: a.clicks,
        spend: a.spend,
      },
    });
  }
  return ads.length;
}

/**
 * REAL sync — fill this when your TikTok Business API is approved.
 * For now it throws a friendly message so you know the mode is wrong.
 */
async function syncReal() {
  throw new Error(
    "Real TikTok API not enabled yet. Set TIKTOK_MODE=mock until your Business API is approved."
  );
}

/**
 * Public entry used by /api/tiktok/sync
 */
export async function syncTikTokAds() {
  const mode = (process.env.TIKTOK_MODE || "mock").toLowerCase();
  if (mode === "real") {
    return syncReal();
  }
  // default
  return syncMock();
}
