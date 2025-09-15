"use client";

import React from "react";

type Props = {
  apiBase: string;
  status: string[];
  severity: string[];
  bbox?: string;
  since?: string;
  limit?: number;
};

export default function ExportIncidentsJsonButton({ apiBase, status, severity, bbox, since, limit = 20 }: Props) {
  const buildUrl = () => {
    const qs = new URLSearchParams();
    qs.set('limit', String(limit));
    if (since) {
      const map: Record<string, number> = { '1h': 3600e3, '24h': 86400e3, '7d': 604800e3 };
      const ms = map[since];
      if (ms) qs.set('created_after', new Date(Date.now() - ms).toISOString());
    }
    status.forEach((s) => qs.append('status', s));
    severity.forEach((s) => qs.append('severity', s));
    if (bbox) qs.set('bbox', bbox);
    return `${apiBase}/incidents?${qs.toString()}`;
  };

  const onClick = async () => {
    const url = buildUrl();
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'incidents.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <button type="button" onClick={onClick} title="Download filtered incidents as JSON" style={{ padding: '6px 10px', background: '#111827', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
      Export JSON
    </button>
  );
}
