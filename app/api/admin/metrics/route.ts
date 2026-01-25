import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const totalAds = await prisma.adPerformance.count();
    const totalBrains = await prisma.aIBrain.count();
    const totalRuns = await prisma.brainRunLog.count();

    return NextResponse.json({
      ok: true,
      metrics: {
        totalProducts,
        totalAds,
        totalBrains,
        totalRuns,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to load metrics" },
      { status: 500 }
    );
  }
}
