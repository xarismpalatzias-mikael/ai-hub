// lib/shopifyToPrisma.ts
import { prisma } from "@/lib/prisma";
import type { ShopifyProduct } from "./shopify";

export async function saveShopifyProducts(products: ShopifyProduct[]) {
  let count = 0;

  for (const p of products) {
    const firstVariant = p.variants?.[0];
    const price = firstVariant ? parseFloat(firstVariant.price) : null;
    const sku = firstVariant?.sku ?? undefined;
    const image =
      p.image?.src ?? (p.images && p.images.length ? p.images[0].src : undefined);

    await prisma.product.upsert({
      where: { source_sourceId: { source: "SHOPIFY", sourceId: String(p.id) } },
      create: {
        title: p.title,
        price,
        status: p.status ?? "active",
        source: "SHOPIFY",
        sourceId: String(p.id),
        externalId: sku,
        mediaUrl: image,
        sourceUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${p.handle}`,
      },
      update: {
        title: p.title,
        price,
        status: p.status ?? "active",
        externalId: sku,
        mediaUrl: image,
        sourceUrl: `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${p.handle}`,
        updatedAt: new Date(),
      },
    });
    count++;
  }

  return count;
}
