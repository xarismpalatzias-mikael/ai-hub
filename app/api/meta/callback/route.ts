import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  if (error) {
    return NextResponse.json(
      { ok: false, error, errorDesc },
      { status: 400 }
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.json(
      { ok: false, error: "Missing META_APP_ID / META_APP_SECRET / META_REDIRECT_URI" },
      { status: 500 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing ?code in callback" },
      { status: 400 }
    );
  }

  // Exchange code -> short-lived access token
  const tokenUrl =
    "https://graph.facebook.com/v21.0/oauth/access_token" +
    `?client_id=${encodeURIComponent(appId)}` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${encodeURIComponent(code)}`;

  const r = await fetch(tokenUrl, { method: "GET" });
  const data = await r.json();

  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: "Token exchange failed", details: data },
      { status: 400 }
    );
  }

  // (Stage 17A) Return token so you can paste into .env as META_ACCESS_TOKEN
  // Next stage we can store it in DB automatically.
  return NextResponse.json({
    ok: true,
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    note: "Copy access_token into META_ACCESS_TOKEN in .env, then restart dev server",
  });
}
