export default function TouristLanding() {
  return (
    <main>
      <h1>Tourist</h1>
      <p style={{ color: '#6b7280' }}>Choose an option:</p>
      <ul style={{ marginTop: 12, lineHeight: 1.8 }}>
        <li><a href="/tourist/report" style={{ color: '#2563eb' }}>Report an Incident</a></li>
        <li><a href="/tourist/id-demo" style={{ color: '#2563eb' }}>Digital ID (Demo)</a></li>
      </ul>
    </main>
  );
}
