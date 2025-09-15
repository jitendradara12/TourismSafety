"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  apiBase: string;
  disabled?: boolean;
  // keep prop for compatibility but we'll ignore it to simplify UX
  count?: number;
};

export default function SeedDemoIncidentsButton({ apiBase, disabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onClick() {
    if (busy || disabled) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${apiBase}/incidents/_bulk_demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10 }),
      });
      if (!res.ok) {
        if (res.status === 501) {
          setMsg("Seeding is only available in demo mode (DB disabled)");
          return;
        }
        const text = await res.text().catch(() => "");
        throw new Error(`Seed failed (${res.status}) ${text}`);
      }
  const json = await res.json().catch(() => ({} as any));
      setMsg(`Seeded ${json?.added ?? 10}`);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message ?? "Failed to seed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>Demo-only</span>
      <button
        onClick={onClick}
        disabled={busy || disabled}
        style={{
          padding: "6px 10px",
          background: "#374151",
          color: "white",
          borderRadius: 6,
          border: "none",
          cursor: busy || disabled ? "not-allowed" : "pointer",
          opacity: busy || disabled ? 0.6 : 1,
        }}
      >
        {busy ? "Seeding…" : "Seed 10 demo incidents"}
      </button>
      {msg && <small style={{ color: "#6b7280" }}>{msg}</small>}
    </span>
  );
}
