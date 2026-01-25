import { NextResponse } from "next/server";
import { importMinea } from "@/lib/minea";

export async function GET() {
  try {
    const imported = await importMinea(20);
    return NextResponse.json({
      ok: true,
      source: "MINEA",
      imported,
    });
  } catch (error: any) {
    console.error("Minea import error:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
