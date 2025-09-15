"use client";
import React from 'react';

export type IncidentItem = {
	id: string;
	type: string;
	severity: string;
	status: string;
	// coords is [lon, lat]
	coords: [number, number];
	createdAt: string;
};

type Props = {
	items: IncidentItem[];
	status: string[];
	severity: string[];
	since?: string;
};

export default function IncidentsMapClient({ items, status, severity, since }: Props) {
	return (
		<div className="relative w-full" style={{ position: 'relative', width: '100%', paddingBottom: '40%' }}>
			<svg
				viewBox="0 0 360 180"
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="World map with incident markers"
				className="absolute inset-0 h-full w-full"
				style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#f9fafb', cursor: 'crosshair' }}
				onClick={(e) => {
					const el = e.currentTarget as SVGSVGElement;
					const rect = el.getBoundingClientRect();
					const x = ((e.clientX - rect.left) / rect.width) * 360; // 0..360
					const y = ((e.clientY - rect.top) / rect.height) * 180; // 0..180
					const lon = x - 180;
					const lat = 90 - y;
					const pad = 5; // degrees window for quick zoom
					const bbox = `${(lon - pad).toFixed(2)},${(lat - pad).toFixed(2)},${(lon + pad).toFixed(2)},${(lat + pad).toFixed(2)}`;
					const q = new URLSearchParams();
					status.forEach((s) => q.append('status', s));
					severity.forEach((s) => q.append('severity', s));
					if (since) q.set('since', since);
					q.set('bbox', bbox);
					window.location.href = `/dashboard/incidents?${q.toString()}`;
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
				<g>
					{items.map((i) => {
						const [lon, lat] = i.coords;
						const x = Math.max(0, Math.min(360, lon + 180));
						const y = Math.max(0, Math.min(180, 90 - lat));
						const color = i.severity === 'critical' ? '#ef4444' : i.severity === 'high' ? '#f59e0b' : i.severity === 'medium' ? '#fbbf24' : '#10b981';
						return (
							<g key={i.id}>
								<circle cx={x} cy={y} r={2.5} fill={color} stroke="#111827" strokeWidth={0.3} />
								<title>{`${i.type} (${i.severity}) @ ${lon.toFixed(2)}, ${lat.toFixed(2)}\n${new Date(i.createdAt).toISOString()}`}</title>
							</g>
						);
					})}
				</g>
				{items.length === 0 && (
					<text x="180" y="90" textAnchor="middle" alignmentBaseline="middle" fontSize="12" fill="#9ca3af">
						No data to display
					</text>
				)}
			</svg>
		</div>
	);
}

