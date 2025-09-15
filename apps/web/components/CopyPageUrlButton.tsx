"use client";

import { useEffect, useState } from 'react';

export default function CopyPageUrlButton() {
  const [href, setHref] = useState<string>('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') setHref(window.location.href);
  }, []);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(href); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} }}
      title="Copy page URL"
      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: copied ? '#e0f2fe' : '#ffffff', color: '#111827', fontSize: 12 }}
    >
      {copied ? 'Copied Link' : 'Copy Page URL'}
    </button>
  );
}
