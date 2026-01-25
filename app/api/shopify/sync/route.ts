import { NextResponse } from "next/server";

export async function GET() {
  const store = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2025-01";

  if (!store || !token) {
    return NextResponse.json(
      { ok: false, error: "Missing SHOPIFY env vars" },
      { status: 500 }
    );
  }

  const url = `https://${store}/admin/api/${version}/products.json?limit=5`;
  console.log("🛍️ Shopify URL:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    const body = await res.text();
    console.log("Shopify Status:", res.status, body);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Shopify API Error", status: res.status, body },
        { status: res.status }
      );
    }

    const data = JSON.parse(body);
    return NextResponse.json({ ok: true, synced: data.products?.length || 0 });
  } catch (err: any) {
    console.error("Shopify Sync Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
