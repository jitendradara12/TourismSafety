"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "../../../components/LocationPicker";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ReportPage() {
  const router = useRouter();
  const [type, setType] = React.useState("general");
  const [severity, setSeverity] = React.useState("low");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [chosenLoc, setChosenLoc] = React.useState<{ lat: number; lon: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const coords = chosenLoc ?? await new Promise<{ lat: number; lon: number }>((resolve) => {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve({ lat: 19.076, lon: 72.8777 }) // fallback (Mumbai)
          );
        } else {
          resolve({ lat: 19.076, lon: 72.8777 });
        }
      });

      let res = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, severity, description, location: coords }),
      });
      // One safe retry against localhost in case NEXT_PUBLIC_API_URL is misconfigured during demo
      if (!res.ok) {
        const alt = "http://localhost:4000";
        if ((API_BASE || "").replace(/\/$/, "") !== alt) {
          try {
            res = await fetch(`${alt}/incidents`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type, severity, description, location: coords }),
            });
          } catch {
            // ignore and fall through to error handling
          }
        }
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Submit failed (${res.status}) ${t}`);
        }
      }

      setMsg("Report submitted");
      router.push("/dashboard/incidents");
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Failed to submit");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Report an Incident</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
        <label>
          <div>Type</div>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Type"
            style={{ border: "1px solid #d1d5db", padding: 8, borderRadius: 6, width: "100%" }}
            required
          />
        </label>
        <label>
          <div>Severity</div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ border: "1px solid #d1d5db", padding: 8, borderRadius: 6, width: "100%" }}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>
        <label>
          <div>Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident"
            rows={4}
            style={{ border: "1px solid #d1d5db", padding: 8, borderRadius: 6, width: "100%" }}
          />
        </label>
        <label>
          <div>Location</div>
          <LocationPicker value={chosenLoc} onChange={setChosenLoc} />
        </label>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "8px 12px",
            background: "#2563eb",
            color: "white",
            borderRadius: 6,
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Submitting…" : "Submit"}
        </button>
        {msg && <div style={{ fontSize: 12, color: "#6b7280" }}>{msg}</div>}
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Demo note: uses your location if permitted; otherwise a safe fallback.
        </div>
      </form>
    </main>
  );
}
