import type { ReactNode } from 'react';
import ThemeToggle from '../components/ThemeToggle';

export const metadata = { title: 'SIH Safety Platform' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  let apiOk = false;
  let apiDemo = false;
  try {
    // Add a short timeout so the whole layout doesn't hang if API is slow
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${base}/healthz`, { cache: 'no-store', signal: controller.signal });
    clearTimeout(t);
    if (res.ok) {
      apiOk = true;
      const j = (await res.json()) as any;
      apiDemo = Boolean(j?.demo);
    }
  } catch {}
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --bg:#ffffff; --fg:#111827; --muted:#6b7280; --border:#e5e7eb; --chip-bg:#f3f4f6; }
          .dark { --bg:#0b1020; --fg:#e5e7eb; --muted:#9ca3af; --border:#1f2937; --chip-bg:#111827; }
          body { background: var(--bg); color: var(--fg); }
          header, footer { background: var(--bg); }
        `}} />
        <header style={{ borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', maxWidth: 1024, margin: '0 auto', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <a href="/" style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>SIH Safety</a>
              <a href="/dashboard/incidents" style={{ color: '#2563eb', textDecoration: 'none' }}>Dashboard</a>
              <a href="/tourist/report" style={{ color: '#2563eb', textDecoration: 'none' }}>Report</a>
              <a href="/tourist/id-demo" style={{ color: '#2563eb', textDecoration: 'none' }}>Tourist ID (Demo)</a>
            </div>
            <div title={apiOk ? `API online at ${base}` : `API offline at ${base}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 9999, background: '#f3f4f6', color: '#111827', fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: apiOk ? '#10b981' : '#ef4444', boxShadow: apiOk ? '0 0 0 3px rgba(16,185,129,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)' }} />
                API
              </span>
              {apiDemo && (
                <span title="Demo mode" style={{ padding: '2px 8px', borderRadius: 9999, background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>DEMO</span>
              )}
              <ThemeToggle />
            </div>
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
