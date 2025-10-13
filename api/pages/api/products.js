// pages/api/products.js
const STORE = process.env.SHOPIFY_STORE_DOMAIN;          // e.g. myshop.myshopify.com
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
// Optional: lock down with an internal key
const INTERNAL_KEY = process.env.INTERNAL_API_KEY || null;

export default async function handler(req, res) {
  try {
    // Optional protection: require x-api-key header if INTERNAL_KEY is set
    if (INTERNAL_KEY && req.headers['x-api-key'] !== INTERNAL_KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Allow ?limit=... (default 10, max 50)
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

    if (!STORE || !ADMIN_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN env vars'
      });
    }

    const url = `https://${STORE}/admin/api/2024-10/products.json?limit=${limit}`;
    const r = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      // Next.js API Route: no need for cache here
      method: 'GET'
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, error: text });
    }

    const data = await r.json();
    return res.status(200).json({ ok: true, count: data.products?.length || 0, products: data.products });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
