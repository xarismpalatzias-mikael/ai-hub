import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = [
      {
        adId: "ad_001",
        adName: "Sample TikTok Ad #1",
        impressions: 1200,
        clicks: 100,
        spend: 25.5,
        revenue: 75.3,
        roas: 2.95,
        ctr: 8.3,
        cpc: 0.26,
        cpm: 21.3,
      },
      {
        adId: "ad_002",
        adName: "Sample TikTok Ad #2",
        impressions: 900,
        clicks: 70,
        spend: 18.2,
        revenue: 42.1,
        roas: 2.31,
        ctr: 7.7,
        cpc: 0.26,
        cpm: 20.2,
      },
      {
        adId: "ad_003",
        adName: "Sample TikTok Ad #3",
        impressions: 1500,
        clicks: 130,
        spend: 30.7,
        revenue: 101.2,
        roas: 3.29,
        ctr: 8.6,
        cpc: 0.24,
        cpm: 20.5,
      },
    ];

    let inserted = 0;
    let updated = 0;

    for (const r of data) {
      const before = await prisma.adPerformance.findUnique({ where: { adId: r.adId } });

      await prisma.adPerformance.upsert({
        where: { adId: r.adId },
        create: r,
        update: {
          adName: r.adName,
          impressions: r.impressions,
          clicks: r.clicks,
          spend: r.spend,
          revenue: r.revenue,
          roas: r.roas,
          ctr: r.ctr,
          cpc: r.cpc,
          cpm: r.cpm,
          updatedAt: new Date(),
        },
      });

      if (before) updated++; else inserted++;
    }

    return NextResponse.json({ ok: true, inserted, updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
