import { NextResponse } from "next/server";
import { syncTikTokAds } from "@/lib/tiktok";

export async function GET() {
  try {
    const count = await syncTikTokAds();
    return NextResponse.json({ ok: true, count });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
