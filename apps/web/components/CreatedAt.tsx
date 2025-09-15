"use client";

import React from 'react';

type Props = {
  iso?: string;
  showRelative?: boolean;
  className?: string;
};

function formatIsoUTC(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // Deterministic UTC string to avoid SSR/CSR mismatches
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function relativeFrom(now: number, iso?: string) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return '';
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function CreatedAt({ iso, showRelative = true, className }: Props) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const absolute = formatIsoUTC(iso);
  const rel = showRelative && now ? relativeFrom(now, iso) : '';
  return (
    <span className={className} suppressHydrationWarning>
      {absolute}{rel ? ` (${rel})` : ''}
    </span>
  );
}
