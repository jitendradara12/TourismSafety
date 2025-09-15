import React from 'react';
import Link from 'next/link';
import CreateTestIncidentButton from '../../../components/CreateTestIncidentButton';
import DashboardExtrasClient from '../../../components/DashboardExtrasClient';
import SeedDemoIncidentsButton from '../../../components/SeedDemoIncidentsButton';
import ExportIncidentsCsvButton from '../../../components/ExportIncidentsCsvButton';
import CopyExportUrlButton from '../../../components/CopyExportUrlButton';
import AutoRefreshToggle from '../../../components/AutoRefreshToggle';
import RefreshNowButton from '../../../components/RefreshNowButton';
import ExportIncidentsJsonButton from '../../../components/ExportIncidentsJsonButton';
import ExportIncidentsGeoJsonButton from '../../../components/ExportIncidentsGeoJsonButton';
import StaticMapPreviewButton from '../../../components/StaticMapPreviewButton';
import IncidentsMapClient from '../../../components/IncidentsMapClient';
import CreatedAt from '../../../components/CreatedAt';
import CopyJsonUrlButton from '../../../components/CopyJsonUrlButton';
import CopyPageUrlButton from '../../../components/CopyPageUrlButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type IncidentItem = {
  id: string;
  type: string;
  severity: string;
  status: string;
  coords: [number, number];
  createdAt?: string;
  created_at?: string;
  lat?: number;
  lon?: number;
};

async function getIncidents(opts?: { createdBefore?: string; createdAfter?: string; status?: string[]; severity?: string[]; bbox?: string; limit?: number }): Promise<{ base: string; items: IncidentItem[]; nextCursor: string | null; ok: boolean; demo: boolean }>{
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const qs = new URLSearchParams();
    qs.set('limit', String(opts?.limit ?? 20));
    if (opts?.createdBefore) qs.set('created_before', opts.createdBefore);
    if (opts?.createdAfter) qs.set('created_after', opts.createdAfter);
    (opts?.status ?? []).forEach((s) => qs.append('status', s));
    (opts?.severity ?? []).forEach((s) => qs.append('severity', s));
    if (opts?.bbox) qs.set('bbox', opts.bbox);
    const res = await fetch(`${base}/incidents?${qs.toString()}`, { cache: 'no-store' });
    const demoHeader = res.headers?.get?.('x-demo-mode');
    if (!res.ok) return { base, items: [], nextCursor: null, ok: false, demo: demoHeader === 'true' };
    const data = await res.json();
    return { base, items: (data.items ?? []) as IncidentItem[], nextCursor: data.nextCursor ?? null, ok: true, demo: demoHeader === 'true' };
  } catch {
    // Frontend-only demo fallback if API is unreachable (for resilient demos)
    const now = Date.now();
    const demoItems: IncidentItem[] = [
      { id: 'wf-001', type: 'theft', severity: 'medium', status: 'open', coords: [72.8777, 19.076], createdAt: new Date(now - 15 * 60 * 1000).toISOString() },
      { id: 'wf-002', type: 'sos', severity: 'high', status: 'open', coords: [-122.4194, 37.7749], createdAt: new Date(now - 40 * 60 * 1000).toISOString() },
      { id: 'wf-003', type: 'assault', severity: 'critical', status: 'triaged', coords: [-118.2437, 34.0522], createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'wf-004', type: 'fall', severity: 'low', status: 'closed', coords: [139.6503, 35.6762], createdAt: new Date(now - 3.5 * 60 * 60 * 1000).toISOString() },
    ];
    return { base, items: demoItems, nextCursor: null, ok: true, demo: true };
  }
}

export default async function IncidentsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const createdBefore = typeof searchParams?.created_before === 'string' ? searchParams!.created_before : undefined;
  const since = typeof searchParams?.since === 'string' ? searchParams!.since : undefined; // e.g., '1h','24h','7d'
  const statusQ = searchParams?.status;
  const severityQ = searchParams?.severity;
  const bboxQ = typeof searchParams?.bbox === 'string' ? searchParams!.bbox : undefined;
  const limitRaw = typeof searchParams?.limit === 'string' ? parseInt(searchParams!.limit, 10) : undefined;
  const allowed = [20, 50, 100] as const;
  const limit = allowed.includes(limitRaw as any) ? (limitRaw as 20|50|100) : 20;
  const sort = typeof searchParams?.sort === 'string' && (searchParams!.sort === 'asc' || searchParams!.sort === 'desc') ? searchParams!.sort : 'desc';
  const status = Array.isArray(statusQ) ? statusQ as string[] : (typeof statusQ === 'string' ? [statusQ] : []);
  const severity = Array.isArray(severityQ) ? severityQ as string[] : (typeof severityQ === 'string' ? [severityQ] : []);
  const computeCreatedAfter = (label?: string) => {
    if (!label) return undefined;
    const now = Date.now();
    const map: Record<string, number> = { '1h': 60*60*1000, '24h': 24*60*60*1000, '7d': 7*24*60*60*1000 };
    const ms = map[label];
    if (!ms) return undefined;
    const dt = new Date(now - ms);
    return dt.toISOString();
  };
  const createdAfter = computeCreatedAfter(since);
  const { base, items: rawItems, nextCursor, ok, demo } = await getIncidents({ createdBefore, createdAfter, status, severity, bbox: bboxQ, limit });
  const items = sort === 'asc' ? [...rawItems].reverse() : rawItems;
  const makeUrl = (params: Record<string, string | string[] | undefined>, dropCursor = true) => {
    const u = new URL('http://dummy');
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((vv) => qp.append(k, vv));
      else if (typeof v === 'string') qp.set(k, v);
    });
    qp.set('limit', String(limit));
    if (!dropCursor && createdBefore) qp.set('created_before', createdBefore);
    const qs = qp.toString();
    return `/dashboard/incidents${qs ? `?${qs}` : ''}`;
  };
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  const isActive = (list: string[], value: string) => list.includes(value);
  const activeChips = [
    ...status.map((s) => ({ label: `status:${s}`, key: `s:${s}`, onUrl: makeUrl({ status: status.filter((x) => x !== s), severity, bbox: bboxQ, since }, true) })),
    ...severity.map((s) => ({ label: `severity:${s}`, key: `v:${s}`, onUrl: makeUrl({ status, severity: severity.filter((x) => x !== s), bbox: bboxQ, since }, true) })),
    ...(bboxQ ? [{ label: `area:${bboxQ}`, key: `b:${bboxQ}`, onUrl: makeUrl({ status, severity, since }, true) }] : []),
    ...(since ? [{ label: `since:${since}`, key: `t:${since}`, onUrl: makeUrl({ status, severity, bbox: bboxQ }, true) }] : []),
  ];
  const severityCounts = items.reduce((acc: Record<string, number>, it) => { acc[it.severity] = (acc[it.severity]||0)+1; return acc; }, {} as Record<string, number>);
  const formatAge = (iso?: string) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '';
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };
  return (
    <main style={{ padding: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Incidents</h1>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          {demo && (
            <span style={{ padding: '4px 8px', background: '#111827', color: 'white', borderRadius: 6, fontSize: 12 }}>
              API DEMO
            </span>
          )}
          {demo && <SeedDemoIncidentsButton apiBase={API_BASE} count={10} />}
          <ExportIncidentsCsvButton apiBase={API_BASE} status={status} severity={severity} bbox={bboxQ} since={since} />
          <ExportIncidentsJsonButton apiBase={API_BASE} status={status} severity={severity} bbox={bboxQ} since={since} limit={limit} />
          <ExportIncidentsGeoJsonButton apiBase={API_BASE} status={status} severity={severity} bbox={bboxQ} since={since} limit={limit} />
          <CopyExportUrlButton apiBase={API_BASE} status={status} severity={severity} bbox={bboxQ} since={since} />
          <CopyJsonUrlButton apiBase={API_BASE} status={status} severity={severity} bbox={bboxQ} since={since} limit={limit} />
          <CopyPageUrlButton />
          <StaticMapPreviewButton items={items.map((it: any) => ({ id: it.id, coords: Array.isArray(it.coords) ? it.coords : [it.lon ?? 0, it.lat ?? 0], severity: it.severity }))} />
          <AutoRefreshToggle />
          <RefreshNowButton />
          <CreateTestIncidentButton apiBase={API_BASE} />
        </div>
      </header>

      {/* Minimal map overview (client-only SVG), no external keys required */}
      <div style={{ marginBottom: 12 }}>
        <IncidentsMapClient
          items={items.map((it: any) => ({
            id: it.id,
            type: it.type,
            severity: it.severity,
            status: it.status,
            coords: Array.isArray(it.coords) ? it.coords : ([it.lon ?? 0, it.lat ?? 0] as [number, number]),
            createdAt: (it.createdAt ?? it.created_at ?? new Date().toISOString()) as string,
          }))}
          status={status}
          severity={severity}
          since={since}
        />
      </div>

      {/* API error banner (non-blocking) */}
      {!ok && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: 8, borderRadius: 6, border: '1px solid #fcd34d', marginBottom: 12, fontSize: 12 }}>
          Could not reach API. Showing zero results. Try again or use demo seed if available.
        </div>
      )}

      {/* Quick filters toolbar */}
      <section style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {/* Status chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Status:</span>
          {["open","triaged","closed"].map((s) => (
            <a
              key={`st-${s}`}
              href={makeUrl({ status: toggle(status, s), severity, bbox: bboxQ, since }, true)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: isActive(status, s) ? '#111827' : '#374151',
                background: isActive(status, s) ? '#dbeafe' : '#ffffff',
              }}
            >
              {s}
            </a>
          ))}
        </div>
        {/* Severity chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Severity:</span>
          {["low","medium","high","critical"].map((v) => (
            <a
              key={`sv-${v}`}
              href={makeUrl({ status, severity: toggle(severity, v), bbox: bboxQ, since }, true)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: isActive(severity, v) ? '#111827' : '#374151',
                background: isActive(severity, v) ? '#fee2e2' : '#ffffff',
              }}
            >
              {v}
            </a>
          ))}
        </div>
        {/* Time window chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Since:</span>
          {["1h","24h","7d"].map((t) => (
            <a
              key={`tm-${t}`}
              href={makeUrl({ status, severity, bbox: bboxQ, since: since === t ? undefined : t }, true)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: since === t ? '#111827' : '#374151',
                background: since === t ? '#dcfce7' : '#ffffff',
              }}
            >
              {t}
            </a>
          ))}
        </div>
        {/* Sort chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Sort:</span>
          {[{k:'desc',label:'Newest'},{k:'asc',label:'Oldest'}].map(({k,label}) => (
            <a
              key={`so-${k}`}
              href={makeUrl({ status, severity, bbox: bboxQ, since, limit: String(limit), sort: k }, true)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: sort === k ? '#111827' : '#374151',
                background: sort === k ? '#e0f2fe' : '#ffffff',
              }}
            >
              {label}
            </a>
          ))}
        </div>
        {/* Page size chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Page size:</span>
          {[20,50,100].map((n) => (
            <a
              key={`lm-${n}`}
              href={makeUrl({ status, severity, bbox: bboxQ, since, limit: String(n) }, true)}
              style={{
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: limit === n ? '#111827' : '#374151',
                background: limit === n ? '#fef9c3' : '#ffffff',
              }}
            >
              {n}
            </a>
          ))}
        </div>
        {/* Active filters summary with clear links */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: 12 }}>Active:</span>
            {activeChips.map((c) => (
              <a key={c.key} href={c.onUrl} style={{ padding: '2px 8px', borderRadius: 9999, background: '#f3f4f6', color: '#111827', fontSize: 12, textDecoration: 'none' }}>
                {c.label} ✕
              </a>
            ))}
            <a href={makeUrl({ }, true)} style={{ marginLeft: 8, color: '#2563eb', textDecoration: 'none', fontSize: 12 }}>Clear all</a>
          </div>
        )}
      </section>

      {/* Results and severity summary */}
      <div style={{ marginBottom: 8, fontSize: 12, color: '#6b7280' }}>Showing {items.length} results</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {Object.entries(severityCounts).map(([sev, cnt]) => (
          <span key={`sum-${sev}`} style={{ padding: '2px 8px', borderRadius: 9999, background: '#f3f4f6', color: '#111827', fontSize: 12 }}>{sev}: {cnt}</span>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#6b7280', padding: 16, border: '1px dashed #e5e7eb', borderRadius: 8 }}>
          <p style={{ margin: 0 }}>No incidents match your filters.</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href={makeUrl({}, true)} style={{ color: '#2563eb', textDecoration: 'none' }}>Clear filters</a>
            <span aria-hidden>•</span>
            <a href={`${API_BASE}/incidents`} target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Open JSON</a>
          </div>
        </div>
      ) : (
        <ul style={{ display: 'grid', gap: 8 }}>
          {items.map((it: any) => (
            <li key={it.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div><strong>{it.type ?? 'incident'}</strong> • {it.severity ?? '-'} • {it.status ?? '-'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{it.id}</div>
                  {(() => {
                    const created = (it.createdAt ?? it.created_at) as string | undefined;
                    // API contracts: coords is [lon, lat]
                    const lon = (it.lon ?? (Array.isArray(it.coords) ? it.coords[0] : undefined)) as number | undefined;
                    const lat = (it.lat ?? (Array.isArray(it.coords) ? it.coords[1] : undefined)) as number | undefined;
                    const parts: React.ReactNode[] = [];
                    if (created) parts.push(<CreatedAt key="c" iso={created} />);
                    if (typeof lat === 'number' && typeof lon === 'number') {
                      const href = `https://maps.google.com/?q=${lat},${lon}`;
                      parts.push(<a key="m" href={href} target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Map</a>);
                    }
                    return parts.length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
                        {parts.map((p, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span aria-hidden>•</span>}
                            {p}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
                <Link href={`/dashboard/incidents/${it.id}`} style={{ color: '#2563eb' }}>Open</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Load more pagination */}
      {nextCursor && (
        <div style={{ marginTop: 12 }}>
          {(() => {
            const qp = new URLSearchParams();
            status.forEach((s) => qp.append('status', s));
            severity.forEach((s) => qp.append('severity', s));
            if (bboxQ) qp.set('bbox', bboxQ);
            if (since) qp.set('since', since);
            qp.set('limit', String(limit));
            qp.set('created_before', nextCursor);
            const href = `/dashboard/incidents?${qp.toString()}`;
            return <a href={href} style={{ color: '#2563eb', textDecoration: 'none' }}>Load more</a>;
          })()}
        </div>
      )}
      {/* Convenience link to open current filters in JSON view */}
      <div style={{ marginTop: 12 }}>
        {(() => {
          const qs = new URLSearchParams();
          status.forEach((s) => qs.append('status', s));
          severity.forEach((s) => qs.append('severity', s));
          if (bboxQ) qs.set('bbox', bboxQ);
          if (createdAfter) qs.set('created_after', createdAfter);
          if (limit) qs.set('limit', String(limit));
          const href = `${API_BASE}/incidents${qs.toString() ? `?${qs.toString()}` : ''}`;
          return <a href={href} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12 }} target="_blank">Open JSON (current filters)</a>;
        })()}
      </div>
    </main>
  );
}
