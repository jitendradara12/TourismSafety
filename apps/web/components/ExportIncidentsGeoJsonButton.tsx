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

export default function ExportIncidentsGeoJsonButton({ apiBase, status, severity, bbox, since, limit = 20 }: Props) {
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

  const toGeoJSON = (data: any) => {
    const items = Array.isArray(data?.items) ? data.items : [];
    const features = items.map((it: any) => {
      const lon = it?.coords?.[0] ?? it?.lon;
      const lat = it?.coords?.[1] ?? it?.lat;
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id: it.id,
          type: it.type,
          severity: it.severity,
          status: it.status,
          createdAt: it.createdAt || it.created_at,
        },
      };
    }).filter((f: any) => Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.every((n: any) => typeof n === 'number'));
    return { type: 'FeatureCollection', features };
  };

  const onClick = async () => {
    const url = buildUrl();
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const json = await res.json();
    const geo = toGeoJSON(json);
    const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'incidents.geojson';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <button type="button" onClick={onClick} title="Download filtered incidents as GeoJSON" style={{ padding: '6px 10px', background: '#065f46', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
      Export GeoJSON
    </button>
  );
}
