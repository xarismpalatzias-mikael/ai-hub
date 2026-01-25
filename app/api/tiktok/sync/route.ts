import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma"; // when you wire real metrics, use this

export const runtime = "nodejs";
export async function GET() {
  // placeholder – confirm cron + logs without hitting TikTok yet
  return NextResponse.json({ ok: true, synced: 0, mode: "production-stub" });
}
