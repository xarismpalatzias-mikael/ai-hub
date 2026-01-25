import { NextResponse } from "next/server";
import { getCJAccessToken } from "@/lib/cj";

export async function GET() {
  try {
    const token = await getCJAccessToken();
    return NextResponse.json({ ok: true, token });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
