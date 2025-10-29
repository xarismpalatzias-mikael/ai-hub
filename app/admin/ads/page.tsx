import { prisma } from "@/lib/prisma";

export const revalidate = 0; // always fresh in dev

export default async function AdsPage() {
  const ads = await prisma.adPerformance.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ padding: "2rem", maxWidth: 980, margin: "0 auto" }}>
      <h1>TikTok Ads Overview</h1>

      <p style={{ margin: "12px 0 24px" }}>
        <a href="/api/tiktok/sync">↻ Sync now</a>
      </p>

      {ads.length === 0 ? (
        <p>No TikTok ads found. Click “Sync now”.</p>
      ) : (
        <table cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Ad Name</th>
              <th>Status</th>
              <th>Spend (£)</th>
              <th>Impr.</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>Conv.</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                <td>{a.adName}</td>
                <td>{a.status ?? "-"}</td>
                <td>{(a.spend ?? 0).toFixed(2)}</td>
                <td>{a.impressions ?? 0}</td>
                <td>{a.clicks ?? 0}</td>
                <td>{a.ctr ? `${a.ctr.toFixed(2)}%` : "-"}</td>
                <td>{a.conversions ?? 0}</td>
                <td>{new Date(a.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
