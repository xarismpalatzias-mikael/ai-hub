import { NextResponse } from "next/server";

export async function GET() {
  try {
    const store = process.env.SHOPIFY_STORE_DOMAIN;          // e.g. ohsbz7-pz.myshopify.com
    const token = process.env.SHOPIFY_ACCESS_TOKEN;          // shpat_...
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

    const url = `https://${store}/admin/api/${apiVersion}/products.json?limit=5`;
    console.log("🔎 Shopify URL:", url);

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": token!,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("❌ Shopify API Error:", res.status, text);
      return NextResponse.json({ ok: false, status: res.status, error: text }, { status: 500 });
    }

    const data = JSON.parse(text);
    console.log("✅ Synced products:", data.products?.length || 0);
    return NextResponse.json({ ok: true, synced: data.products?.length || 0 });
  } catch (err: any) {
    console.error("Shopify Sync Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
