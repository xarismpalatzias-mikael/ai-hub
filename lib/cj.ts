import axios from "axios";

let cachedToken: string | null = null;
let lastFetchTime = 0;

export async function getCJAccessToken() {
  const now = Date.now();
  const baseUrl = process.env.CJ_BASE_URL!;
  const email = process.env.CJ_EMAIL!;
  const apiKey = process.env.CJ_API_KEY!;

  // Reuse token if less than 5 minutes old
  if (cachedToken && now - lastFetchTime < 5 * 60 * 1000) {
    console.log("♻️ Using cached CJ token");
    return cachedToken;
  }

  console.log("🔑 Fetching new CJ Access Token...");
  const res = await axios.post(`${baseUrl}/authentication/getAccessToken`, {
    email,
    apiKey,
  });

  if (res.data?.data?.accessToken) {
    cachedToken = res.data.data.accessToken;
    lastFetchTime = now;
    console.log("✅ CJ Access Token fetched successfully");
    return cachedToken;
  } else {
    throw new Error("CJ access token fetch failed");
  }
}
