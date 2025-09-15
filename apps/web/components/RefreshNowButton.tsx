"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function RefreshNowButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);

  const onClick = () => {
    if (busy) return;
    setBusy(true);
    router.refresh();
    setTimeout(() => {
      setBusy(false);
      setOk('Refreshed');
      setTimeout(() => setOk(null), 800);
    }, 200);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        title="Refresh now"
        style={{ padding: '6px 10px', background: '#f3f4f6', color: '#111827', borderRadius: 6, border: '1px solid #e5e7eb', cursor: busy ? 'default' : 'pointer' }}
      >
        {busy ? 'Refreshing…' : 'Refresh now'}
      </button>
      {ok && <span style={{ fontSize: 12, color: '#065f46' }}>{ok}</span>}
    </span>
  );
}
