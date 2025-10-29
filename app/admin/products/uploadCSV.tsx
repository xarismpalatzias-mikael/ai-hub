"use client";
import { useState } from "react";

export default function UploadCSV() {
  const [msg, setMsg] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch("/api/tiktok/import", {
      method: "POST",
      body: text,
    });
    const json = await res.json();
    setMsg(json.ok ? `✅ Imported ${json.count} rows` : `❌ Error: ${json.error}`);
    location.reload();
  }

  return (
    <div style={{ margin: "1rem 0" }}>
      <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
        Upload TikTok CSV:
      </label>
      <input type="file" accept=".csv" onChange={onChange} />
      {msg && <div style={{ marginTop: "8px" }}>{msg}</div>}
    </div>
  );
}
