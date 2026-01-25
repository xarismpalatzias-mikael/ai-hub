// lib/shopify.ts
const store = process.env.SHOPIFY_STORE_DOMAIN!;
const token = process.env.SHOPIFY_ACCESS_TOKEN!;

export type ShopifyProduct = {
  id: number;
  title: string;
  body_html?: string;
  status?: string;
  handle: string;
  image?: { src: string } | null;
  images?: { src: string }[];
  variants: { id: number; price: string; sku?: string }[];
};

export async function fetchShopifyProducts(limit = 50): Promise<ShopifyProduct[]> {
  const url = `https://${store}/admin/api/2024-10/products.json?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.products as ShopifyProduct[];
}
