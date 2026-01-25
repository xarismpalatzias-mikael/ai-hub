import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { ok: false, error: "Missing META_APP_ID or META_REDIRECT_URI" },
      { status: 500 }
    );
  }

  // Ads read + insights (ad level)
  const scope = [
    "ads_read",
    "read_insights",
    // optional (sometimes needed depending on account):
    // "business_management",
  ].join(",");

  const state = Math.random().toString(36).slice(2);

  const url =
    "https://www.facebook.com/v21.0/dialog/oauth" +
    `?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(url);
}
