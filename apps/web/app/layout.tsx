import type { ReactNode } from 'react';

export const metadata = { title: 'SIH Safety Platform' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <header style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', maxWidth: 1024, margin: '0 auto' }}>
            <a href="/" style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>SIH Safety</a>
            <a href="/dashboard/incidents" style={{ color: '#2563eb', textDecoration: 'none' }}>Dashboard</a>
            <a href="/tourist/report" style={{ color: '#2563eb', textDecoration: 'none' }}>Report</a>
            <a href="/tourist/id-demo" style={{ color: '#2563eb', textDecoration: 'none' }}>Tourist ID (Demo)</a>
          </nav>
        </header>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '16px' }}>
          {children}
        </div>
        <footer style={{ borderTop: '1px solid #e5e7eb', marginTop: 24 }}>
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>
            Prototype for demo — no real data.
          </div>
        </footer>
      </body>
    </html>
  );
}
