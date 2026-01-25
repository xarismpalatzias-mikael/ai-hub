// /app/api/brain/daily/route.ts
import { NextResponse } from "next/server";
import { runBrainDaily } from "@/lib/brain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await runBrainDaily();
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("brain/daily error:", err);
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
