"use client";

import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  async function load() {
    try {
      setError("");
      setLoading(true);

      const res = await fetch("/api/logs?email=xarismpalatzias@gmail.com");
      const d = await res.json();

      if (d.error) {
        setError(d.error);
        setLogs([]);
      } else {
        setLogs(d.logs || []);
      }
    } catch (e) {
      setError("Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>AI Hub — Run Logs</h1>

      <button
        onClick={load}
        style={{
          marginBottom: 16,
          padding: "6px 12px",
          background: "#111",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Refresh
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && logs.length === 0 && <p>No logs yet.</p>}

      {!loading && logs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {logs.map((log: any) => {
            const started = log.startedAt || log.createdAt;
            return (
              <div
                key={log.id}
                style={{
                  padding: 12,
                  background: "#fafafa",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              >
                <p>
                  <strong>{new Date(started).toLocaleString()}</strong>
                </p>
                <pre>{JSON.stringify(log, null, 2)}</pre>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/admin/metrics">Go to Metrics →</a>
      </div>
    </div>
  );
}
