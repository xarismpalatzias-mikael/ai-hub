"use client";

import { useEffect, useState } from "react";

type Metrics = {
  totalProducts: number;
  totalAds: number;
  totalBrains: number;
  totalRuns: number;
};

export default function MetricsPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/metrics", {
        cache: "no-store",
      });
      const d = await res.json();

      if (!d.ok) {
        setError(d.error || "Failed to load metrics");
        setData(null);
      } else {
        setData(d.metrics as Metrics);
      }
    } catch (e) {
      setError("Failed to load metrics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>AI Hub — Metrics Dashboard</h1>

      <p style={{ marginBottom: 16 }}>
        Quick overview of products, ads and brain activity.
      </p>

      <button
        onClick={load}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #333",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Refresh
      </button>

      {loading && <p>Loading...</p>}

      {error && !loading && (
        <p style={{ color: "red", marginTop: 8 }}>Error: {error}</p>
      )}

      {data && !loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 600,
          }}
        >
          {/* Products card */}
          <div
            style={{
              padding: 12,
              background: "#fafafa",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <h3>Products</h3>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              Total products: {data.totalProducts}
            </p>
            <p style={{ fontSize: 12, color: "#666" }}>
              Go to <a href="/admin/products">Products</a> to see full list.
            </p>
          </div>

          {/* Ads card */}
          <div
            style={{
              padding: 12,
              background: "#fafafa",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <h3>Ad Performance</h3>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              Total ads tracked: {data.totalAds}
            </p>
            <p style={{ fontSize: 12, color: "#666" }}>
              These are rows in the <code>AdPerformance</code> table.
            </p>
          </div>

          {/* Brain card */}
          <div
            style={{
              padding: 12,
              background: "#fafafa",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <h3>AI Brain</h3>
            <p style={{ fontSize: 18, fontWeight: 600 }}>
              Total brain entries: {data.totalBrains}
            </p>
            <p>Total daily runs logged: {data.totalRuns}</p>
            <p style={{ fontSize: 12, color: "#666" }}>
              Daily runs are recorded in <code>BrainRunLog</code>.
            </p>
            <p style={{ fontSize: 12, color: "#666" }}>
              Check detailed history in <a href="/admin/logs">Run Logs</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
