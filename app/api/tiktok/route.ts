import { NextResponse } from 'next/server';

// Example route to fetch TikTok Ads data
export async function GET() {
  try {
    // This is a placeholder for real TikTok API logic
    // Later we’ll replace with TikTok Business API integration
    const fakeAds = [
      {
        id: '12345',
        name: 'Montessori Wooden Toy Campaign',
        spend: '£45.23',
        impressions: 5600,
        clicks: 198,
      },
      {
        id: '67890',
        name: 'Shape Sorter House Retargeting',
        spend: '£27.85',
        impressions: 3200,
        clicks: 112,
      },
    ];

    return NextResponse.json({ ads: fakeAds });
  } catch (error) {
    console.error('Error fetching TikTok ads:', error);
    return NextResponse.json({ error: 'Failed to load TikTok ads' }, { status: 500 });
  }
}
// lib/tiktok.ts  (add or verify these)

import { prisma } from "@/lib/prisma";

// 1) Get token from your TikTokAuth table (your schema uses id: "primary")
async function getAccessToken() {
  const rec = await prisma.tikTokAuth.findUnique({ where: { id: "primary" } });
  if (!rec?.accessToken) throw new Error("TikTok not connected yet.");
  return rec.accessToken;
}

// 2) Fetch campaigns (name + status)
async function fetchCampaigns(accessToken: string) {
  const resp = await fetch(
    "https://business-api.tiktok.com/open_api/v1.3/campaign/get/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": accessToken },
      body: JSON.stringify({
        page_size: 50,
        page: 1,
        // advertiser_id: "<YOUR_ADVERTISER_ID>" // add if your token requires it
      }),
    }
  );

  const json = await resp.json();
  const list = json?.data?.list ?? [];
  return list.map((c: any) => ({
    adId: String(c.campaign_id ?? c.id ?? ""),
    adName: String(c.campaign_name ?? c.name ?? "Untitled"),
    status: String(c.status ?? ""),
  }));
}

// 3) Fetch basic performance (spend, impressions, clicks…)
async function fetchReport(accessToken: string) {
  const to = new Date();
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const resp = await fetch(
    "https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": accessToken },
      body: JSON.stringify({
        // advertiser_id: "<YOUR_ADVERTISER_ID>",
        service_type: "AUCTION",
        data_level: "AUCTION_CAMPAIGN",
        dimensions: ["campaign_id", "campaign_name"],
        metrics: ["spend", "impressions", "clicks", "ctr", "conversions"],
        start_date: from.toISOString().slice(0, 10),
        end_date: to.toISOString().slice(0, 10),
        page_size: 100,
      }),
    }
  );

  const json = await resp.json();
  const list = json?.data?.list ?? [];

  const byId: Record<string, any> = {};
  for (const r of list) {
    const id = String(r.campaign_id ?? r.campaign?.id ?? "");
    byId[id] = {
      spend: Number(r.spend ?? 0),
      impressions: Number(r.impressions ?? 0),
      clicks: Number(r.clicks ?? 0),
      ctr: Number(r.ctr ?? 0),
      conversions: Number(r.conversions ?? 0),
    };
  }
  return byId;
}

// 4) Exported sync used by /api/tiktok/sync
export async function syncTikTokAds() {
  const token = await getAccessToken();
  const [campaigns, metrics] = await Promise.all([
    fetchCampaigns(token),
    fetchReport(token).catch(() => ({})), // still show campaigns if report not permitted yet
  ]);

  const dateTo = new Date();
  const dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const c of campaigns) {
    const m = (metrics as any)[c.adId] || {};
    await prisma.adPerformance.upsert({
      where: { adId: c.adId },
      update: {
        adName: c.adName,
        status: c.status,
        spend: m.spend ?? 0,
        impressions: m.impressions ?? 0,
        clicks: m.clicks ?? 0,
        ctr: m.ctr ?? 0,
        conversions: m.conversions ?? 0,
        dateFrom,
        dateTo,
      },
      create: {
        adId: c.adId,
        adName: c.adName,
        status: c.status,
        spend: m.spend ?? 0,
        impressions: m.impressions ?? 0,
        clicks: m.clicks ?? 0,
        ctr: m.ctr ?? 0,
        conversions: m.conversions ?? 0,
        dateFrom,
        dateTo,
      },
    });
  }

  return campaigns.length;
}
import { NextResponse } from "next/server";
import { syncTikTokAds } from "@/lib/tiktok";

export async function GET() {
  try {
    const count = await syncTikTokAds();
    return NextResponse.json({ ok: true, count });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
