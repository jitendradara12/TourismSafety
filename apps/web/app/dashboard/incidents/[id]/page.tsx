import React from "react";
import CopyButton from "../../../../components/CopyButton";
import { notFound } from "next/navigation";
import UpdateIncidentStatus from "../../../../components/UpdateIncidentStatus";
import CreatedAt from "../../../../components/CreatedAt";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getIncident(id: string) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) return { id };
    return await res.json();
  } catch {
    return { id };
  }
}

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const id = params?.id;
  if (!id) return notFound();
  const data = await getIncident(id);
  if (data === null) return notFound();

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Incident Detail</h1>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <a href={`${API_BASE}/incidents/${id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12 }} target="_blank">Open JSON</a>
          <CopyButton value={id} label="Copy ID" />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <a href="/dashboard/incidents" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12 }}>← Back to list</a>
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>ID:</strong> <span style={{ fontFamily: "monospace" }}>{id}</span>
      </div>
      {"status" in (data as any) && <div style={{ marginBottom: 8 }}><strong>Status:</strong> {(data as any).status}</div>}
      <div style={{ marginBottom: 12 }}>
        <UpdateIncidentStatus apiBase={API_BASE} id={id} current={(data as any)?.status} />
      </div>
      {"type" in (data as any) && <div style={{ marginBottom: 8 }}><strong>Type:</strong> {(data as any).type}</div>}
      {"severity" in (data as any) && <div style={{ marginBottom: 8 }}><strong>Severity:</strong> {(data as any).severity}</div>}
      {(() => {
        const created = (data as any)?.created_at || (data as any)?.createdAt;
        // coords is [lon, lat]
        const lon = (data as any)?.lon ?? (Array.isArray((data as any)?.coords) ? (data as any).coords[0] : undefined);
        const lat = (data as any)?.lat ?? (Array.isArray((data as any)?.coords) ? (data as any).coords[1] : undefined);
        const parts: React.ReactNode[] = [];
        if (created) parts.push(<span key="c">Created: <CreatedAt iso={created} /></span>);
        if (typeof lat === 'number' && typeof lon === 'number') {
          const href = `https://maps.google.com/?q=${lat},${lon}`;
          parts.push(<a key="m" href={href} target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Open in Maps</a>);
          parts.push(<CopyButton key="cp" value={`${lat},${lon}`} label="Copy coords" />);
        }
        return parts.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 12, color: '#6b7280' }}>
            {parts.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span aria-hidden>•</span>}
                {p}
              </React.Fragment>
            ))}
          </div>
        ) : null;
      })()}
      <p style={{ color: "#6b7280", marginTop: 12 }}>
        Demo-safe: shows basic info even if API is offline.
      </p>
    </main>
  );
}
