export default function HomePage() {
  return (
    <main>
      <h1>SIH Safety Platform</h1>
      <p style={{ color: '#666' }}>Welcome to the prototype.</p>
      <ul style={{ marginTop: 16, lineHeight: 1.8 }}>
        <li>
          <a href="/dashboard/incidents" style={{ color: '#2563eb' }}>Dashboard: Incidents</a>
        </li>
        <li>
          <a href="/tourist/report" style={{ color: '#2563eb' }}>Report an Incident</a>
        </li>
        <li>
          <a href="/tourist/id-demo" style={{ color: '#2563eb' }}>Tourist Digital ID (Demo)</a>
        </li>
      </ul>
    </main>
  );
}
