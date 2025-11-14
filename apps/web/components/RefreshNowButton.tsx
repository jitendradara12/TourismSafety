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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        data-busy={busy ? 'true' : undefined}
        title="Refresh now"
        className="btn btn--secondary btn--sm"
      >
        {busy ? 'Refreshing…' : 'Refresh now'}
      </button>
      {ok && <span style={{ fontSize: 12, color: 'var(--color-success)' }}>{ok}</span>}
    </span>
  );
}
