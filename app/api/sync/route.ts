import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";
const SHOP = process.env.SHOPIFY_SHOP;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Small helper to call Shopify Admin REST
async function shopifyGet(path: string) {
  if (!SHOP || !TOKEN) {
    throw new Error("Missing SHOPIFY_SHOP or SHOPIFY_ACCESS_TOKEN in .env.local");
  }
  const url = `https://${SHOP}/admin/api/${API_VERSION}${path}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    // Never cache API responses in dev
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shopify ${path} -> ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * GET /api/sync?limit=20
 * Fetches live products from your Shopify store.
 */
export async function GET(req: Request) {
  try {
    // Read & clamp limit
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 20;

    // Pull products (add more fields/params as you like)
    const data = await shopifyGet(`/products.json?limit=${limit}`);

    // Normalize a small summary for the UI
    const products = Array.isArray((data as any).products) ? (data as any).products : [];
    const summary = products.map((p: any) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventory_quantity: v.inventory_quantity,
      })),
      images: (p.images || []).slice(0, 1).map((img: any) => img.src),
    }));
// If ?save=true, store Shopify products into the database
if (searchParams.get("save") === "true" && data?.products?.length) {
  for (const p of data.products) {
    await prisma.product.upsert({
      where: { shopifyId: p.id.toString() },
      update: {    
         shop: SHOP, 
        title: p.title,
        price: p.variants?.[0]?.price || "0",
        status: p.status,
      },
      create: {
         shop: SHOP, 
        shopifyId: p.id.toString(),
        title: p.title,
        price: p.variants?.[0]?.price || "0",
        status: p.status,
      },
    });
  }
}

    return NextResponse.json({
      ok: true,
      shop: SHOP,
      count: products.length,
      products: summary,
      note: "Pass ?limit=1..50 to control how many products are returned.",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
