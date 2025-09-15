"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

type Props = { id: string; apiBase: string; current: string };

export default function StatusUpdater({ id, apiBase, current }: Props) {
  const router = useRouter();
  const [status, setStatus] = React.useState(current);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onSave() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/incidents/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PATCH failed (${res.status}): ${text}`);
      }
      setMsg('Updated');
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label htmlFor="status" style={{ color: '#6b7280' }}>Update status:</label>
      <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} disabled={busy}
              style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
        {['open','triaged','closed'].map((s) => (
          <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
        ))}
      </select>
      <button type="button" onClick={onSave} disabled={busy}
              style={{ padding: '6px 10px', background: '#dcfce7', color: '#065f46', borderRadius: 6, border: 'none', cursor: busy ? 'not-allowed' : 'pointer' }}>
        {busy ? 'Saving…' : 'Save'}
      </button>
      {msg && <span style={{ fontSize: 12, color: '#6b7280' }}>{msg}</span>}
    </div>
  );
}
