// app/api/brain/daily/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runBrainDaily } from "@/lib/brain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();

  // create a run log row
  const log = await prisma.brainRunLog.create({
    data: {
      mode: process.env.VERCEL ? "cron" : "manual",
      note: "Daily brain run started",
      ok: false,
    },
  });

  try {
    const result = await runBrainDaily({
      logId: log.id,
      mode: process.env.VERCEL ? "cron" : "manual",
    });

    // result already updates the log with OK
    return NextResponse.json(result);
  } catch (err: any) {
    const finished = Date.now();
    const duration = finished - started;

    await prisma.brainRunLog.update({
      where: { id: log.id },
      data: {
        ok: false,
        finishedAt: new Date(finished),
        durationMs: duration,
        error: String(err?.message ?? err),
      },
    });

    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
