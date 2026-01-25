// lib/minea.ts
import axios from "axios";

const BASE = process.env.MINEA_BASE_URL!;
const COOKIE = process.env.MINEA_COOKIE!;
const LIMIT = Number(process.env.MINEA_SYNC_LIMIT ?? 50);

/**
 * Fetch top Minea products (cookie session method).
 * Adjust URL later if your DevTools shows a different endpoint.
 */
export async function fetchMineaTopProducts(page = 1) {
  if (!BASE || !COOKIE) throw new Error("Minea env not configured");

  // Default “Top Products” JSON endpoint from Minea web app
  const url = `${BASE}/api/v1/discovery/products?sort=top_today&page=${page}&limit=${LIMIT}`;

  const res = await axios.get(url, {
    headers: {
      Cookie: COOKIE,
      Accept: "application/json, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
      Referer: `${BASE}/en`,
    },
    maxRedirects: 5,
    withCredentials: true,
    validateStatus: (s) => s >= 200 && s < 500,
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Minea session expired (401/403). Refresh MINEA_COOKIE.");
  }
  if (res.status >= 400) {
    throw new Error(`Minea fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.data;
}
