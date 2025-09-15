"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  apiBase: string;
  id: string;
  current?: string;
};

export default function UpdateIncidentStatus({ apiBase, id, current }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const update = async (newStatus: string) => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${apiBase}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed with ${res.status}`);
      }
      setOk('Updated');
      setTimeout(() => setOk(null), 1200);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>Update status:</span>
      {['open','triaged','closed'].map((s) => (
        <button
          key={s}
          onClick={() => update(s)}
          disabled={saving || s === current}
          title={`Set status to ${s}`}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: s === current ? '#e5e7eb' : '#ffffff',
            color: '#111827',
            cursor: saving || s === current ? 'default' : 'pointer'
          }}
        >
          {s}
        </button>
      ))}
      {error && <span style={{ color: '#b91c1c', fontSize: 12 }}>{error}</span>}
      {ok && <span style={{ color: '#065f46', fontSize: 12 }}>{ok}</span>}
    </div>
  );
}
