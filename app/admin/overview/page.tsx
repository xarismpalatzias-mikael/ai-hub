'use client';

import { useEffect, useState } from 'react';

type Overview = {
  ads: number;
  brains: number;
  byState: Record<string, number>;
  budgetPerAd: string;
};

type BrainRunLog = {
  id: string;
  startedAt: string;
  finishedAt?: string | null;
  durationMs?: number | null;
  ok: boolean;
  mode?: string | null;
  note?: string | null;
  error?: string | null;
  adsSeen?: number | null;
  brainsSeen?: number | null;
  winnersPicked?: number | null;
  budgetTotal?: number | null;
  budgetPerAd?: number | null;
};

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [logs, setLogs] = useState<BrainRunLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | 'brain' | 'sync'>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const [o, l] = await Promise.all([
        fetch('/api/admin/overview', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/admin/logs', { cache: 'no-store' }).then(r => r.json()),
      ]);
      setData(o);
      setLogs(l.logs ?? []);
    } catch (e:any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function runDailyBrain() {
    try {
      setBusy('brain');
      const r = await fetch('/api/brain/daily', { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.json();
      await load();
    } catch (e:any) {
      alert('Run Daily Brain failed: ' + String(e?.message || e));
    } finally {
      setBusy(null);
    }
  }

  async function syncTikTok() {
    try {
      setBusy('sync');
      const r = await fetch('/api/tiktok/sync', { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.json();
      await load();
    } catch (e:any) {
      alert('TikTok sync failed: ' + String(e?.message || e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>AI Hub — Dashboard</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>KPIs, actions, and latest brain run logs.</p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={runDailyBrain} disabled={busy !== null} style={btn(busy==='brain', true)}>
          {busy === 'brain' ? 'Running…' : 'Run Daily Brain'}
        </button>
        <button onClick={syncTikTok} disabled={busy !== null} style={btn(busy==='sync', false)}>
          {busy === 'sync' ? 'Syncing…' : 'Sync TikTok'}
        </button>
        <button onClick={load} disabled={busy !== null} style={btn(false, false)}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={errBox}>Error: {err}</div>}

      {data && !loading && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 18 }}>
            <Card><Stat label="Total Ads" value={data.ads} /></Card>
            <Card><Stat label="Brains" value={data.brains} /></Card>
            <Card><Stat label="Budget / Ad" value={`£${data.budgetPerAd}`} /></Card>
          </div>

          {/* By State */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>By State</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              {Object.entries(data.byState || {}).map(([state, count]) => (
                <Card key={state}><Stat label={state} value={count} /></Card>
              ))}
              {Object.keys(data.byState || {}).length === 0 && (
                <div style={{ opacity: 0.6 }}>No states yet.</div>
              )}
            </div>
          </div>

          {/* Logs */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Latest Runs</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {logs.map((l) => (
                <div key={l.id} style={{
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 12,
                  background: l.ok ? '#f8fffb' : '#fff5f5'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {new Date(l.startedAt).toLocaleString()} → {l.finishedAt ? new Date(l.finishedAt).toLocaleTimeString() : '…'}
                    &nbsp;· {l.ok ? 'OK' : 'FAILED'} {l.mode ? `· ${l.mode}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
                    <span>ads: {l.adsSeen ?? '—'}</span>
                    <span>brains: {l.brainsSeen ?? '—'}</span>
                    <span>winners: {l.winnersPicked ?? 0}</span>
                    <span>budget: {l.budgetTotal ?? 0} ({l.budgetPerAd ?? 0}/ad)</span>
                    <span>took: {l.durationMs ?? 0}ms</span>
                  </div>
                  {l.note && <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>{l.note}</div>}
                  {l.error && <div style={{ marginTop: 6, fontSize: 13, color: '#b91c1c' }}>{l.error}</div>}
                </div>
              ))}
              {logs.length === 0 && <div style={{ opacity: 0.6 }}>No logs yet.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function btn(active: boolean, primary: boolean) {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: active ? '#f3f4f6' : (primary ? '#111827' : 'white'),
    color: active ? '#111827' : (primary ? 'white' : '#111827'),
    fontWeight: 700,
    cursor: active ? 'not-allowed' : 'pointer'
  } as React.CSSProperties;
}
const errBox: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 12, borderRadius: 10, marginBottom: 16 };

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 14,
      background: 'white',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      {children}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.72 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
