"use client";

import React from "react";

type Item = {
  id: string;
  coords: [number, number]; // [lon, lat]
  severity?: string;
};

type Props = {
  items: Item[];
  maxPins?: number;
};

// Opens a Mapbox Static Image in a new tab with pins for the current incidents.
// Requires NEXT_PUBLIC_MAPBOX_TOKEN to be set; otherwise the button is hidden.
export default function StaticMapPreviewButton({ items, maxPins = 50 }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [busy, setBusy] = React.useState(false);

  if (!token) return null;
  if (!Array.isArray(items) || items.length === 0) return null;

  const onClick = () => {
    try {
      setBusy(true);
      const limited = items.slice(0, maxPins);
      // Color by severity (keep small palette for Mapbox pin syntax)
      const colorFor = (sev?: string) => sev === 'critical' ? 'ff0000' : sev === 'high' ? 'f59e0b' : sev === 'medium' ? 'fbbf24' : '10b981';
      const pins = limited.map((it) => `pin-s+${colorFor(it.severity)}(${it.coords[0]},${it.coords[1]})`).join(",");
      // 'auto' to fit markers, 800x400 @2x for clarity
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${encodeURI(pins)}/auto/800x400@2x?access_token=${token}`;
      window.open(url, '_blank', 'noopener');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={onClick} disabled={busy} title="Open static map preview (Mapbox)" style={{ padding: '6px 10px', background: '#1f2937', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
      {busy ? 'Opening…' : 'Map preview'}
    </button>
  );
}
