// pages/api/products-graphql.js
const STORE = process.env.SHOPIFY_STORE_DOMAIN;          // e.g. myshop.myshopify.com
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const INTERNAL_KEY = process.env.INTERNAL_API_KEY || null;

const query = `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          status
          handle
          tags
          createdAt
          updatedAt
          totalInventory
          images(first: 3) { edges { node { url altText } } }
          variants(first: 5) { edges { node { id title price } } }
        }
      }
    }
  }
`;

export default async function handler(req, res) {
  try {
    // Optional protection
    if (INTERNAL_KEY && req.headers['x-api-key'] !== INTERNAL_KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const first = Math.min(parseInt(req.query.first || '10', 10), 50);

    if (!STORE || !ADMIN_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN env vars'
      });
    }

    const url = `https://${STORE}/admin/api/2024-10/graphql.json`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { first } })
    });

    const data = await r.json();

    if (!r.ok || data.errors) {
      return res.status(r.status || 500).json({ ok: false, error: data.errors || 'GraphQL error' });
    }

    const edges = data?.data?.products?.edges || [];
    const products = edges.map(e => e.node);

    return res.status(200).json({ ok: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
