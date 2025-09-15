"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Something went wrong.</h2>
      <p style={{ color: '#6b7280', marginBottom: 12 }}>Please try again. If the issue persists, go back to the Tourist page.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => reset()} style={{ padding: '6px 10px', background: '#2563eb', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Try again</button>
        <a href="/tourist" style={{ padding: '6px 10px', background: '#f3f4f6', color: '#111827', borderRadius: 6, textDecoration: 'none' }}>Back to Tourist</a>
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Details: {error?.message || 'unknown'}</div>
    </div>
  );
}
