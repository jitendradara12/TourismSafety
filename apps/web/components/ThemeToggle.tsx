"use client";

import { useEffect, useState } from "react";

function getInitial(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitial());

  useEffect(() => {
    try { localStorage.setItem("theme", theme); } catch {}
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      style={{ padding: "4px 8px", borderRadius: 9999, background: "var(--chip-bg)", color: "var(--fg)", border: "1px solid var(--border)" }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
