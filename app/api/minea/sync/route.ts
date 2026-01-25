import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const base = process.env.MINEA_BASE_URL;
  const key  = process.env.MINEA_API_KEY;
  const limit = parseInt(process.env.MINEA_SYNC_LIMIT || "50");

  if (!base || !key) {
    return NextResponse.json({
      ok: true,
      scanned: 0,
      saved: 0,
      hint: "Add MINEA_API_KEY in .env after you buy Minea Business, then rerun."
    });
  }

  const res = await fetch(`${base}/trending-products?limit=${limit}`, {
    headers: { Authorization: `Bearer ${key}` }
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ ok: false, status: res.status, body });
  }

  const data = await res.json(); // shape depends on Minea’s API
  let scanned = 0, saved = 0;

  for (const item of data.products ?? []) {
    scanned++;
    await prisma.spyProduct.upsert({
      where: { source_externalId: { source: "Minea", externalId: String(item.id) } },
      create: {
        source: "Minea",
        externalId: String(item.id),
        title: item.title ?? null,
        adUrl: item.url ?? null,
        storeUrl: item.shop_domain ?? null,
        impressions: item.impressions ?? null,
        likes: item.likes ?? null,
        comments: item.comments ?? null,
        shares: item.shares ?? null,
        thumbnail: item.image ?? null,
        price: item.price ?? null,
        currency: item.currency ?? null,
        firstSeen: item.first_seen ? new Date(item.first_seen) : null,
        lastSeen: item.last_seen ? new Date(item.last_seen) : null,
        raw: item
      },
      update: {
        title: item.title ?? null,
        lastSeen: item.last_seen ? new Date(item.last_seen) : null,
        impressions: item.impressions ?? null,
        likes: item.likes ?? null,
        comments: item.comments ?? null,
        shares: item.shares ?? null,
        price: item.price ?? null,
        currency: item.currency ?? null,
        thumbnail: item.image ?? null,
        raw: item
      }
    });
    saved++;
  }

  return NextResponse.json({ ok: true, scanned, saved });
}
