"use client";

import React from "react";
import CopyButton from "./CopyButton";

type Props = {
  apiBase: string;
  status: string[];
  severity: string[];
  bbox?: string;
  since?: string;
};

export default function CopyExportUrlButton({ apiBase, status, severity, bbox, since }: Props) {
  const computeUrl = React.useCallback(() => {
    const qs = new URLSearchParams();
    if (since) {
      const map: Record<string, number> = { '1h': 60*60*1000, '24h': 24*60*60*1000, '7d': 7*24*60*60*1000 };
      const ms = map[since];
      if (ms) qs.set('created_after', new Date(Date.now() - ms).toISOString());
    }
    status.forEach((s) => qs.append('status', s));
    severity.forEach((s) => qs.append('severity', s));
    if (bbox) qs.set('bbox', bbox);
    return `${apiBase}/incidents/export${qs.toString() ? `?${qs.toString()}` : ''}`;
  }, [apiBase, status, severity, bbox, since]);

  const url = computeUrl();
  return (
    <CopyButton value={url} label="Copy export URL" />
  );
}
