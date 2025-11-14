"use client";

import React from "react";

type Props = {
  value: string;
  label?: string;
};

export default function CopyButton({ value, label = "Copy" }: Props) {
  const [copied, setCopied] = React.useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn ${copied ? 'btn--success' : 'btn--primary'} btn--xs`}
      title={copied ? "Copied" : "Copy to clipboard"}
      data-busy={copied ? 'true' : undefined}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
