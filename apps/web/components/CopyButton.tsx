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
      style={{
        padding: "2px 8px",
        background: copied ? "#16a34a" : "#374151",
        color: "white",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
      }}
      title={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
