export default function NotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Page not found</h1>
      <p style={{ color: '#6b7280', marginTop: 8 }}>The page you’re looking for doesn’t exist or was moved.</p>
      <div style={{ marginTop: 12 }}>
        <a href="/" style={{ color: '#2563eb' }}>Go to Home</a>
      </div>
    </main>
  );
}
