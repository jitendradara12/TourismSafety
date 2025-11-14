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
      className={`btn ${copied ? 'btn--success' : 'btn--secondary'} btn--xs`}
      data-busy={copied ? 'true' : undefined}
    >
      {copied ? 'Copied Link' : 'Copy Page URL'}
    </button>
  );
}
