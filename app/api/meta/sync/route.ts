import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID; // format: act_123...

  if (!accessToken) {
    return NextResponse.json(
      { ok: false, error: "Missing META_ACCESS_TOKEN (get it via /api/meta/oauth/start)" },
      { status: 500 }
    );
  }
  if (!adAccountId) {
    return NextResponse.json(
      { ok: false, error: "Missing META_AD_ACCOUNT_ID (example: act_1234567890)" },
      { status: 500 }
    );
  }

  // last 7 days (Meta expects JSON string)
  const time_range = encodeURIComponent(JSON.stringify({ since: "7 days ago", until: "today" }));

  // ad-level insights
  const fields = [
    "ad_id",
    "ad_name",
    "impressions",
    "clicks",
    "spend",
    "actions",
    "action_values",
  ].join(",");

  const url =
    `https://graph.facebook.com/v21.0/${encodeURIComponent(adAccountId)}/insights` +
    `?level=ad` +
    `&time_range=${time_range}` +
    `&fields=${encodeURIComponent(fields)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: "GET" });
  const json = await r.json();

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: "Meta insights fetch failed", details: json },
      { status: 400 }
    );
  }

  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  let upserts = 0;

  for (const row of rows) {
    const adId = String(row.ad_id || "").trim();
    if (!adId) continue;

    const adName = String(row.ad_name || "").trim();
    const impressions = num(row.impressions, 0);
    const clicks = num(row.clicks, 0);
    const spend = num(row.spend, 0);

    // Try to extract purchase value from action_values if present
    // Meta returns arrays like [{action_type:"purchase", value:"123.45"}]
    let revenue = 0;
    const actionValues = Array.isArray(row.action_values) ? row.action_values : [];
    for (const av of actionValues) {
      if (av?.action_type === "purchase" || av?.action_type === "omni_purchase") {
        revenue += num(av?.value, 0);
      }
    }

    const ctr = impressions > 0 ? clicks / impressions : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const roas = spend > 0 ? revenue / spend : 0;

    // NOTE: adjust field names here ONLY if your AdPerformance model differs.
    await prisma.adPerformance.upsert({
      where: { adId }, // assumes adId is @unique in Prisma
      create: {
        adId,
        adName,
        impressions,
        clicks,
        spend,
        revenue,
        ctr,
        cpc,
        roas,
      },
      update: {
        adName,
        impressions,
        clicks,
        spend,
        revenue,
        ctr,
        cpc,
        roas,
      },
    });

    upserts++;
  }

  return NextResponse.json({
    ok: true,
    fetched: rows.length,
    upserts,
    note: "Meta ad-level insights imported into AdPerformance",
  });
}
