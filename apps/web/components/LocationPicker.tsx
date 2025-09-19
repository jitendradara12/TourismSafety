"use client";

import React from "react";

type Props = {
  value?: { lat: number; lon: number } | null;
  onChange: (v: { lat: number; lon: number } | null) => void;
};

export default function LocationPicker({ value, onChange }: Props) {
  const [loc, setLoc] = React.useState<{ lat: number; lon: number } | null>(value ?? null);
  const [locating, setLocating] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoc(value ?? null);
  }, [value]);

  const useMyLocation = () => {
    if (locating) return;
    setStatus(null);
    setLocating(true);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const next = { lat: 19.076, lon: 72.8777 };
      setLoc(next);
      onChange(next);
      setStatus('Geolocation not available. Using fallback.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLoc(next);
        onChange(next);
        setStatus('Location set from device');
        setLocating(false);
      },
      () => {
        const next = { lat: 19.076, lon: 72.8777 };
        setLoc(next);
        onChange(next);
        setStatus('Permission denied or unavailable. Using fallback.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={useMyLocation} disabled={locating} style={{ padding: '6px 10px', background: locating ? '#6b7280' : '#111827', color: 'white', borderRadius: 6, border: 'none', cursor: locating ? 'not-allowed' : 'pointer', opacity: locating ? 0.8 : 1 }}>
          {locating ? 'Locating…' : 'Use my location'}
        </button>
        {loc && (
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>
            lat: {loc.lat.toFixed(5)}, lon: {loc.lon.toFixed(5)}
          </span>
        )}
        {!loc && <span style={{ fontSize: 12, color: '#6b7280' }}>No location selected</span>}
      </div>
      <svg
        viewBox="0 0 360 180"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Select approximate location (tap or click)"
        className="bg-gray-50"
        style={{ width: '100%', height: 200, border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'crosshair' }}
        onClick={(e) => {
          const el = e.currentTarget as SVGSVGElement;
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 360; // 0..360
          const y = ((e.clientY - rect.top) / rect.height) * 180; // 0..180
          const lon = x - 180;
          const lat = 90 - y;
          const next = { lat, lon };
          setLoc(next);
          onChange(next);
        }}
        onTouchEnd={(e) => {
          // Touch support for mobile devices
          if (!e.changedTouches || e.changedTouches.length === 0) return;
          const touch = e.changedTouches[0];
          const el = e.currentTarget as unknown as HTMLElement;
          const rect = el.getBoundingClientRect();
          const x = ((touch.clientX - rect.left) / rect.width) * 360;
          const y = ((touch.clientY - rect.top) / rect.height) * 180;
          const lon = x - 180;
          const lat = 90 - y;
          const next = { lat, lon };
          setLoc(next);
          onChange(next);
        }}
      >
        <g stroke="#e5e7eb" strokeWidth="0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 30} y1={0} x2={(i + 1) * 30} y2={180} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * 30} x2={360} y2={(i + 1) * 30} />
          ))}
        </g>
        <rect x="0" y="0" width="360" height="180" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        {loc && (
          <g>
            <circle cx={loc.lon + 180} cy={90 - loc.lat} r={3} fill="#ef4444" stroke="#111827" strokeWidth={0.5} />
            <title>{`lat: ${loc.lat.toFixed(5)}, lon: ${loc.lon.toFixed(5)}`}</title>
          </g>
        )}
      </svg>
  <div style={{ fontSize: 12, color: '#6b7280' }}>Tip: Tap or click the mini map to set location, or use the button to auto-detect. This is approximate and for demo use.</div>
  {status && <div style={{ fontSize: 12, color: '#6b7280' }}>{status}</div>}
    </div>
  );
}
