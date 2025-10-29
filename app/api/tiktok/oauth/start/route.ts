import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const redirectUri = encodeURIComponent(process.env.TIKTOK_REDIRECT_URI!);
  const state = 'aihub-connect';

  // PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // Sandbox Login Kit: start with ONLY this scope
  const scopes = ['user.info.basic'].join(',');

  const authUrl =
    `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${clientKey}` +
    `&scope=${scopes}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;

  console.log('TikTok AUTH URL:', authUrl);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set('tiktok_code_verifier', codeVerifier, { httpOnly: true, sameSite: 'lax' });
  return res;
}
