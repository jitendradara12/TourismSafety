"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  apiBase: string;
  disabled?: boolean;
};

export default function CreateTestIncidentButton({ apiBase, disabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      // Try to use geolocation for a nicer demo if available; fallback to random coords
      const coords = await new Promise<{ lat: number; lon: number }>((resolve) => {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(randCoords())
          );
        } else {
          resolve(randCoords());
        }
      });

      const severities = ["low", "medium", "high", "critical"] as const;
      const types = ["disturbance", "accident", "theft", "sos", "hazard"] as const;
      const body = {
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: "Test incident created from dashboard",
        location: { lat: coords.lat, lon: coords.lon },
      };

      const res = await fetch(`${apiBase}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST /incidents failed (${res.status}): ${text}`);
      }
      setMsg('Created! Refreshing…');
      // Let SSR fetch new list
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message ?? 'Failed to create');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!!disabled || busy}
        title={disabled ? 'API offline' : 'Create a test incident at your location (or random)'}
        style={{
          padding: '6px 10px',
          background: '#e0e7ff',
          color: '#3730a3',
          borderRadius: 6,
          border: 'none',
          cursor: (!!disabled || busy) ? 'not-allowed' : 'pointer',
          opacity: (!!disabled || busy) ? 0.6 : 1,
        }}
      >
        {busy ? 'Creating…' : 'Create test incident'}
      </button>
      {msg && (
        <span style={{ fontSize: 12, color: '#6b7280' }}>{msg}</span>
      )}
    </span>
  );
}

function randCoords() {
  const lat = Math.max(-85, Math.min(85, (Math.random() * 170) - 85));
  const lon = (Math.random() * 360) - 180;
  return { lat, lon };
}
