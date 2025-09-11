import React from 'react';

async function getIncident(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/incidents/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) return { base, ok: false, data: null } as const;
    const data = await res.json();
    return { base, ok: true, data } as const;
  } catch {
    return { base: base, ok: false, data: null } as const;
  }
}

export default async function IncidentDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { base, ok, data } = await getIncident(id);
  return (
    <main style={{ padding: 16 }}>
      <a href="/dashboard/incidents" style={{ display: 'inline-block', marginBottom: 8, color: '#2563eb' }}>&larr; Back</a>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>Incident {id.slice(0,8)}</h1>
      {!ok && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #fee2e2', background: '#fef2f2', color: '#7f1d1d', borderRadius: 8 }}>
          Failed to load incident from {base}
        </div>
      )}
      {ok && data && (
        <section style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Details</strong>
            <a href={`${base}/incidents/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: 12 }}>Open API</a>
          </div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><span style={{ color: '#6b7280' }}>Type:</span> <strong>{data.type}</strong></div>
            <div><span style={{ color: '#6b7280' }}>Severity:</span> <strong style={{ textTransform: 'capitalize' }}>{data.severity}</strong></div>
            <div><span style={{ color: '#6b7280' }}>Status:</span> <span style={{ textTransform: 'capitalize' }}>{data.status}</span></div>
            <div><span style={{ color: '#6b7280' }}>Created:</span> {new Date(data.createdAt).toLocaleString()}</div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#6b7280' }}>Location:</span> {data.coords[1]}, {data.coords[0]} {' '}
              <a href={`https://www.google.com/maps?q=${data.coords[1]},${data.coords[0]}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Open in Maps</a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
