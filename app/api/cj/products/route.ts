import { NextResponse } from "next/server";
import { syncCJProducts } from "@/lib/cjProducts";

export async function GET() {
  try {
    const count = await syncCJProducts(20);
    return NextResponse.json({ ok: true, synced: count });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
