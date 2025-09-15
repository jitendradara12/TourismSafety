"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  intervalMs?: number;
};

export default function AutoRefreshToggle({ intervalMs = 15000 }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = React.useState(false);

  // Initialize from localStorage once on mount
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('incidents:autoRefresh');
      if (v === '1') setEnabled(true);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, router]);

  return (
    <label title="Auto-refresh incidents list" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#111827' }}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => {
          const val = e.target.checked;
          setEnabled(val);
          try { localStorage.setItem('incidents:autoRefresh', val ? '1' : '0'); } catch {}
        }}
        style={{ width: 14, height: 14 }}
      />
      Auto-refresh
    </label>
  );
}
