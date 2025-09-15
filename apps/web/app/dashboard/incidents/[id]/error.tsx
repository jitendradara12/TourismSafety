"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Failed to load incident.</h2>
      <pre style={{ color: '#6b7280', whiteSpace: 'pre-wrap' }}>{error?.message}</pre>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: '6px 10px', background: '#374151', color: 'white', border: 'none', borderRadius: 6 }}>
        Retry
      </button>
    </div>
  );
}
