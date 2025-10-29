export default function AdminPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "32px", color: "#333" }}>AI Hub Admin Panel</h1>
      <p style={{ marginTop: "10px", color: "#666" }}>
        Welcome to the admin area. Choose a section below:
      </p>

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
        <li><a href="/admin/products" style={{ color: "#0070f3" }}>🛍️ Products</a></li>
        <li><a href="/admin/ads" style={{ color: "#0070f3" }}>📈 TikTok Ads</a></li>
        <li><a href="/admin/settings" style={{ color: "#0070f3" }}>⚙️ Settings</a></li>
      </ul>
    </main>
  );
}
