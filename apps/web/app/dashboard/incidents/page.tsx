import React from 'react';

type IncidentItem = {
  id: string;
  type: string;
  severity: string;
  status: string;
  coords: [number, number];
  createdAt: string;
};

async function getIncidents(opts?: { createdBefore?: string; createdAfter?: string; status?: string[]; severity?: string[]; bbox?: string }): Promise<{ base: string; items: IncidentItem[]; nextCursor: string | null; ok: boolean }>{
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const qs = new URLSearchParams();
    qs.set('limit', '20');
    if (opts?.createdBefore) qs.set('created_before', opts.createdBefore);
    if (opts?.createdAfter) qs.set('created_after', opts.createdAfter);
    (opts?.status ?? []).forEach((s) => qs.append('status', s));
    (opts?.severity ?? []).forEach((s) => qs.append('severity', s));
    if (opts?.bbox) qs.set('bbox', opts.bbox);
    const res = await fetch(`${base}/incidents?${qs.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { base, items: [], nextCursor: null, ok: false };
    const data = await res.json();
    return { base, items: (data.items ?? []) as IncidentItem[], nextCursor: data.nextCursor ?? null, ok: true };
  } catch {
    return { base, items: [], nextCursor: null, ok: false };
  }
}

export default async function IncidentsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const createdBefore = typeof searchParams?.created_before === 'string' ? searchParams!.created_before : undefined;
  const since = typeof searchParams?.since === 'string' ? searchParams!.since : undefined; // e.g., '1h','24h','7d'
  const statusQ = searchParams?.status;
  const severityQ = searchParams?.severity;
  const bboxQ = typeof searchParams?.bbox === 'string' ? searchParams!.bbox : undefined;
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
  const { base, items, nextCursor, ok } = await getIncidents({ createdBefore, createdAfter, status, severity, bbox: bboxQ });
  const makeUrl = (params: Record<string, string | string[] | undefined>, dropCursor = true) => {
    const u = new URL('http://dummy');
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((vv) => qp.append(k, vv));
      else if (typeof v === 'string') qp.set(k, v);
    });
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
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Incidents</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', flexWrap: 'wrap' }}>
        <span>Latest 20 incidents · Count: {items.length}</span>
        <span aria-label={ok ? 'API online' : 'API unreachable'} title={ok ? 'API online' : 'API unreachable'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 9999, background: '#f3f4f6', color: '#111827' }}>
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: ok ? '#10b981' : '#ef4444', boxShadow: ok ? '0 0 0 3px rgba(16,185,129,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)' }} />
          API
        </span>
        <span style={{ color: '#9ca3af' }}>at</span>
        <code style={{ background: '#f9fafb', padding: '2px 6px', borderRadius: 4 }}>{base}</code>
      </div>
      {/* Filters */}
      <section aria-label="Filters" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Status:</span>
          {['open','triaged','closed'].map((s) => (
            <a
              key={s}
              href={makeUrl({ status: toggle(status, s), severity, bbox: bboxQ, since }, true)}
              style={{ padding: '4px 8px', borderRadius: 9999, textTransform: 'capitalize', background: isActive(status, s) ? '#dbeafe' : '#f3f4f6', color: isActive(status, s) ? '#1e40af' : '#111827', textDecoration: 'none' }}
            >{s}</a>
          ))}
          <a href={makeUrl({ status: [], severity, bbox: bboxQ, since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, fontSize: 12, background: '#f9fafb', color: '#6b7280', textDecoration: 'none' }}>Clear</a>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Severity:</span>
          {['low','medium','high','critical'].map((s) => (
            <a
              key={s}
              href={makeUrl({ status, severity: toggle(severity, s), bbox: bboxQ, since }, true)}
              style={{ padding: '4px 8px', borderRadius: 9999, textTransform: 'capitalize', background: isActive(severity, s) ? '#fee2e2' : '#f3f4f6', color: isActive(severity, s) ? '#991b1b' : '#111827', textDecoration: 'none' }}
            >{s}</a>
          ))}
          <a href={makeUrl({ status, severity: [], bbox: bboxQ, since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, fontSize: 12, background: '#f9fafb', color: '#6b7280', textDecoration: 'none' }}>Clear</a>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Area:</span>
          {/* presets: World (no bbox), SF, LA, Tokyo, Mumbai */}
          <a href={makeUrl({ status, severity, since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, background: !bboxQ ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>All</a>
          <a href={makeUrl({ status, severity, bbox: '-122.55,37.70,-122.35,37.82', since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, background: bboxQ === '-122.55,37.70,-122.35,37.82' ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>SF</a>
          <a href={makeUrl({ status, severity, bbox: '-118.33,33.90,-118.10,34.10', since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, background: bboxQ === '-118.33,33.90,-118.10,34.10' ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>LA</a>
          <a href={makeUrl({ status, severity, bbox: '139.60,35.60,139.85,35.75', since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, background: bboxQ === '139.60,35.60,139.85,35.75' ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>Tokyo</a>
          <a href={makeUrl({ status, severity, bbox: '72.77,18.88,72.93,19.10', since }, true)} style={{ padding: '4px 8px', borderRadius: 9999, background: bboxQ === '72.77,18.88,72.93,19.10' ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>Mumbai</a>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Since:</span>
          {[
            { key: 'all', label: 'All', value: undefined },
            { key: '1h', label: '1h', value: '1h' },
            { key: '24h', label: '24h', value: '24h' },
            { key: '7d', label: '7d', value: '7d' },
          ].map((t) => (
            <a key={t.key} href={makeUrl({ status, severity, bbox: bboxQ, since: t.value }, true)}
               style={{ padding: '4px 8px', borderRadius: 9999, background: (since === t.value || (!since && t.value===undefined)) ? '#e5e7eb' : '#f3f4f6', color: '#111827', textDecoration: 'none' }}>{t.label}</a>
          ))}
        </div>
      </section>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
        <a href="/dashboard/incidents" style={{ display: 'inline-block', padding: '6px 10px', background: '#e5e7eb', borderRadius: 6 }}>Refresh</a>
        <a href="/tourist/report" style={{ display: 'inline-block', padding: '6px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 6 }}>Report incident</a>
        <a href={`${base}/incidents/export?${(() => { const q=new URLSearchParams(); status.forEach(s=>q.append('status',s)); severity.forEach(s=>q.append('severity',s)); if (bboxQ) q.set('bbox', bboxQ); if (createdAfter) q.set('created_after', createdAfter); q.set('limit','1000'); return q.toString(); })()}`}
           style={{ display: 'inline-block', padding: '6px 10px', background: '#ecfccb', color: '#365314', borderRadius: 6, textDecoration: 'none' }}
           rel="noopener noreferrer" target="_blank">
          Export CSV
        </a>
      </div>
      {/* Severity counts */}
      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['low','medium','high','critical'].map((s) => (
          <span key={s} style={{ padding: '2px 8px', borderRadius: 9999, background: s==='critical'? '#fee2e2' : s==='high' ? '#fef3c7' : s==='medium' ? '#fef9c3' : '#dcfce7', color: '#111827', fontSize: 12 }}>
            {s}: {severityCounts[s] || 0}
          </span>
        ))}
      </div>
      {(activeChips.length > 0) && (
        <div aria-label="Active filters" style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Active:</span>
          {activeChips.map((c) => (
            <a key={c.key} href={c.onUrl} style={{ padding: '2px 8px', borderRadius: 9999, background: '#f3f4f6', color: '#111827', textDecoration: 'none', fontSize: 12 }}>
              {c.label} ✕
            </a>
          ))}
          <a href={makeUrl({}, true)} style={{ padding: '2px 8px', borderRadius: 9999, background: '#fee2e2', color: '#991b1b', textDecoration: 'none', fontSize: 12 }}>Reset all</a>
        </div>
      )}
      {/* Simple SVG map (equirectangular projection). ViewBox uses degrees for easy positioning. */}
      <section aria-label="Incidents map" style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: '#111827' }}>Map (fast SVG)</strong>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Equirectangular · dots by severity</span>
        </div>
        <div style={{ width: '100%', height: 0, paddingBottom: '40%', position: 'relative' }}>
          <svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map with incident markers" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#f9fafb' }}>
            {/* Simple graticule */}
            <g stroke="#e5e7eb" strokeWidth="0.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`v${i}`} x1={(i+1)*30} y1={0} x2={(i+1)*30} y2={180} />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={(i+1)*30} x2={360} y2={(i+1)*30} />
              ))}
            </g>
            {/* Border */}
            <rect x="0" y="0" width="360" height="180" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            {/* Markers */}
            <g>
              {items.map((i) => {
                const [lon, lat] = i.coords;
                const x = Math.max(0, Math.min(360, lon + 180));
                const y = Math.max(0, Math.min(180, 90 - lat));
                const color = i.severity === 'critical' ? '#ef4444' : i.severity === 'high' ? '#f59e0b' : i.severity === 'medium' ? '#fbbf24' : '#10b981';
                return (
                  <g key={i.id}>
                    <circle cx={x} cy={y} r={2.5} fill={color} stroke="#111827" strokeWidth={0.3} />
                    <title>{`${i.type} (${i.severity}) @ ${lon.toFixed(2)}, ${lat.toFixed(2)}\n${new Date(i.createdAt).toLocaleString()}`}</title>
                  </g>
                );
              })}
            </g>
            {items.length === 0 && (
              <text x="180" y="90" textAnchor="middle" alignmentBaseline="middle" fontSize="12" fill="#9ca3af">
                No data to display
              </text>
            )}
          </svg>
        </div>
      </section>
      {!ok && (
        <div role="status" style={{ marginTop: 12, padding: 12, border: '1px solid #fee2e2', background: '#fef2f2', color: '#7f1d1d', borderRadius: 8 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>API unreachable</strong>
          <span>Make sure the backend API service is running and accessible at the URL shown above.</span>
        </div>
      )}
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Severity</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Lon,Lat</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace' }}>
                  <a href={`/dashboard/incidents/${i.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{i.id.slice(0, 8)}</a>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{i.type}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textTransform: 'capitalize' }}>{i.severity}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textTransform: 'capitalize' }}>{i.status}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{i.coords.join(', ')}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{new Date(i.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6} style={{ padding: 0 }}>
                  <div style={{ margin: 12, padding: 16, border: '1px dashed #e5e7eb', background: '#f9fafb', color: '#6b7280', borderRadius: 8, textAlign: 'center' }}>
                    No incidents found. Try Refresh above, or come back later.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {ok && items.length > 0 && nextCursor && (
        <div style={{ marginTop: 12 }}>
          <a href={makeUrl({ status, severity, bbox: bboxQ, since, created_before: nextCursor }, false)} style={{ color: '#2563eb' }}>Load more</a>
        </div>
      )}
    </main>
  );
}
