import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:3000/api/tiktok/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { adId: "tt_ad_123", adName: "UGC Hook v1", impressions: 12000, clicks: 420, spend: 58.3, revenue: 212.0 },
        { adId: "tt_ad_456", adName: "UGC Hook v2", impressions: 8000, clicks: 160, spend: 31.9, revenue: 0 }
      ]),
    });

    const json = await res.json();
    return NextResponse.json({ ok: true, fromSeed: json });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message });
  }
}
