import axios from "axios";
import { getCJAccessToken } from "./cj";
import { prisma } from "../lib/prisma";

export async function syncCJProducts(limit = 10) {
  try {
    const token = await getCJAccessToken();
    const baseUrl = process.env.CJ_BASE_URL!;
    const res = await axios.post(
      `${baseUrl}/product/query`,
      {
        pageNum: 1,
        pageSize: limit,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "CJ-Access-Token": token,
        },
      }
    );

    if (!res.data?.data?.list || res.data.data.list.length === 0) {
      console.log("⚠️ No CJ products found.");
      return { ok: true, synced: 0 };
    }

    const products = res.data.data.list;

    // Save or update in DB
    for (const p of products) {
      await prisma.product.upsert({
        where: { cjId: p.productId },
        create: {
          cjId: p.productId,
          name: p.productName,
          image: p.productImage,
          price: parseFloat(p.sellPrice) || 0,
          warehouse: p.warehouseName || null,
        },
        update: {
          name: p.productName,
          image: p.productImage,
          price: parseFloat(p.sellPrice) || 0,
        },
      });
    }

    console.log(`✅ Synced ${products.length} CJ products`);
    return { ok: true, synced: products.length };
  } catch (err: any) {
    console.error("❌ CJ product sync error:", err.message);
    return { ok: false, error: "CJ product sync failed" };
  }
}
