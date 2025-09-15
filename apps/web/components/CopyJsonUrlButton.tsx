"use client";

import { useState } from 'react';

type Props = {
  apiBase: string;
  status?: string[];
  severity?: string[];
  bbox?: string;
  since?: string;
  limit?: number;
};

export default function CopyJsonUrlButton({ apiBase, status = [], severity = [], bbox, since, limit }: Props) {
  const [copied, setCopied] = useState(false);
  const href = (() => {
    const qs = new URLSearchParams();
    status.forEach((s) => qs.append('status', s));
    severity.forEach((s) => qs.append('severity', s));
    if (bbox) qs.set('bbox', bbox);
    if (since) {
      // server converts 'since' to created_after; keep a practical limit here
      // but for copying, include since as-is so users can reproduce the page filters
      qs.set('since', since);
    }
    if (limit) qs.set('limit', String(limit));
    const q = qs.toString();
    return `${apiBase.replace(/\/$/, '')}/incidents${q ? `?${q}` : ''}`;
  })();
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(href); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
      }}
      title="Copy JSON URL"
      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: copied ? '#dcfce7' : '#ffffff', color: '#111827', fontSize: 12 }}
    >
      {copied ? 'Copied JSON' : 'Copy JSON URL'}
    </button>
  );
}
