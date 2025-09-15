"use client";

import React from "react";

type Props = {
  apiBase: string;
  // current filters
  status?: string[];
  severity?: string[];
  bbox?: string;
  since?: string; // "1h" | "24h" | "7d" (mapped to created_after)
};

// Utility to compute created_after ISO for quick filters
function computeCreatedAfter(label?: string): string | undefined {
  if (!label) return undefined;
  const now = Date.now();
  const map: Record<string, number> = { "1h": 60 * 60 * 1000, "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 1000 };
  const ms = map[label];
  if (!ms) return undefined;
  return new Date(now - ms).toISOString();
}

export default function ExportIncidentsCsvButton({ apiBase, status = [], severity = [], bbox, since }: Props) {
  const [busy, setBusy] = React.useState(false);

  const handleExport = React.useCallback(() => {
    if (busy) return;
    setBusy(true);
    try {
      const qs = new URLSearchParams();
      status.forEach((s) => qs.append("status", s));
      severity.forEach((s) => qs.append("severity", s));
      if (bbox) qs.set("bbox", bbox);
      const createdAfter = computeCreatedAfter(since);
      if (createdAfter) qs.set("created_after", createdAfter);
      const url = `${apiBase}/incidents/export${qs.toString() ? `?${qs.toString()}` : ""}`;
      // Use a temporary anchor to trigger browser download (works without extra libs)
      const a = document.createElement("a");
      a.href = url;
      a.download = "incidents.csv"; // suggested filename; server sets Content-Disposition too
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setBusy(false);
    }
  }, [apiBase, status, severity, bbox, since, busy]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      style={{
        padding: "6px 10px",
        background: "#111827",
        color: "white",
        borderRadius: 6,
        border: "none",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.6 : 1,
      }}
      title="Download filtered incidents as CSV"
    >
      {busy ? "Preparing…" : "Export CSV"}
    </button>
  );
}
