"use client";
import React, { useState } from 'react';

export default function ReportIncidentPage() {
  const [type, setType] = useState('fire');
  const [severity, setSeverity] = useState('low');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  const useMyLocation = async () => {
    if (!navigator.geolocation) return setMsg('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLon(String(pos.coords.longitude));
      },
      () => setMsg('Unable to get location'),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      setMsg('Please enter valid numeric coordinates');
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, severity, location: { lat: latNum, lon: lonNum } }),
    });
    if (res.ok) {
      const j = await res.json();
      setMsg(`Created incident ${j.id}`);
      setOk(true);
      setLat('');
      setLon('');
    } else {
      setMsg('Failed to create incident');
      setOk(false);
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Report Incident</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420, marginTop: 16 }}>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="fire">fire</option>
            <option value="flood">flood</option>
            <option value="earthquake">earthquake</option>
          </select>
        </label>
        <label>
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>
        <label>
          Latitude
          <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 37.7749" style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Longitude
          <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="e.g. -122.4194" style={{ width: '100%', padding: 8 }} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={useMyLocation} style={{ padding: '8px 12px', background: '#e5e7eb', borderRadius: 6 }}>Use my location</button>
          <button type="submit" style={{ padding: '8px 12px', background: '#111827', color: 'white', borderRadius: 6 }}>Submit</button>
        </div>
      </form>
      {msg && (
        <div role="status" style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 8,
          border: ok ? '1px solid #d1fae5' : '1px solid #fee2e2',
          background: ok ? '#ecfdf5' : '#fef2f2',
          color: ok ? '#065f46' : '#7f1d1d',
        }}>
          {msg}
        </div>
      )}
    </main>
  );
}
