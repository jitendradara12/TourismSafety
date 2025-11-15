"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

export type IncidentItem = {
	id: string;
	type: string;
	severity: string;
	status: string;
	// coords is [lon, lat]
	coords: [number, number];
	createdAt: string;
	description?: string;
	local?: boolean;
};

type Props = {
	items: IncidentItem[];
	status: string[];
	severity: string[];
	since?: string;
	bbox?: string;
	limit?: number;
	sort?: 'asc' | 'desc';
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 4;

type ParsedBbox = { minLat: number; minLon: number; maxLat: number; maxLon: number };

const parseBbox = (value?: string): ParsedBbox | null => {
	if (!value) return null;
	const parts = value.split(',').map((p) => parseFloat(p.trim()));
	if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
	const [lon1, lat1, lon2, lat2] = parts;
	const minLat = Math.max(-90, Math.min(90, Math.min(lat1, lat2)));
	const maxLat = Math.max(-90, Math.min(90, Math.max(lat1, lat2)));
	const minLon = Math.max(-180, Math.min(180, Math.min(lon1, lon2)));
	const maxLon = Math.max(-180, Math.min(180, Math.max(lon1, lon2)));
	if (minLat === maxLat || minLon === maxLon) return null;
	return { minLat, minLon, maxLat, maxLon };
};

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export default function IncidentsMapClient({ items, status, severity, since, bbox, limit, sort }: Props) {
	const mapEl = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<any | null>(null);
	const layerRef = useRef<any | null>(null);
	const navigateRef = useRef<(nextBbox?: string) => void>(() => {});
	const router = useRouter();
	const activeBbox = useMemo(() => parseBbox(bbox), [bbox]);
	const effectiveLimit = typeof limit === 'number' ? limit : 20;
	const [localReports, setLocalReports] = useState<IncidentItem[]>([]);
	const [localReady, setLocalReady] = useState(false);
	const [showLocalReports, setShowLocalReports] = useState(true);

	const colors = useMemo(() => ({
		critical: '#ef4444',
		high: '#f59e0b',
		medium: '#fbbf24',
		low: '#10b981',
	} as const), []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const sync = () => {
			if (typeof window === 'undefined') return;
			try {
				const raw = window.localStorage.getItem('recent_reports');
				if (!raw) {
					setLocalReports([]);
					setLocalReady(true);
					return;
				}
				const parsed = JSON.parse(raw);
				const normalized: IncidentItem[] = (Array.isArray(parsed) ? parsed : [])
					.map((entry: any, idx: number) => {
						const lat = Number(entry?.location?.lat ?? entry?.lat);
						const lon = Number(entry?.location?.lon ?? entry?.lon);
						if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
						return {
							id: entry?.id ? `local-${entry.id}` : `local-${idx}-${entry?.createdAt ?? Date.now()}`,
							type: typeof entry?.type === 'string' ? entry.type : 'report',
							severity: typeof entry?.severity === 'string' ? String(entry.severity).toLowerCase() : 'low',
							status: 'local',
							coords: [Math.max(-180, Math.min(180, lon)), Math.max(-90, Math.min(90, lat))],
							createdAt: typeof entry?.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
							description: typeof entry?.description === 'string' ? entry.description : undefined,
							local: true,
						};
					})
					.filter(Boolean) as IncidentItem[];
				setLocalReports(normalized.slice(0, 200));
			} catch {
				setLocalReports([]);
			} finally {
				setLocalReady(true);
			}
		};
		sync();
		window.addEventListener('storage', sync);
		return () => {
			window.removeEventListener('storage', sync);
		};
	}, []);

	useEffect(() => {
		navigateRef.current = (nextBbox?: string) => {
			const qs = new URLSearchParams();
			status.forEach((s) => qs.append('status', s));
			severity.forEach((s) => qs.append('severity', s));
			if (since) qs.set('since', since);
			if (effectiveLimit) qs.set('limit', String(effectiveLimit));
			if (sort) qs.set('sort', sort);
			if (nextBbox) qs.set('bbox', nextBbox);
			const target = `/dashboard/incidents${qs.toString() ? `?${qs.toString()}` : ''}`;
			router.push(target);
		};
	}, [status, severity, since, effectiveLimit, sort, router]);

	// Initialize map once
	useEffect(() => {
		let disposed = false;
		(async () => {
			if (!mapEl.current || mapRef.current) return;
			const leaflet = await import('leaflet');
			const L: any = (leaflet as any).default ?? leaflet;

			// Ensure default icon assets work if any marker icons are used
			if ((L as any).Icon?.Default?.mergeOptions) {
				(L as any).Icon.Default.mergeOptions({
					iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
					iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
					shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
				});
			}

			const map = L.map(mapEl.current, {
				center: DEFAULT_CENTER,
				zoom: DEFAULT_ZOOM,
				worldCopyJump: true,
			});

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			}).addTo(map);

			L.control.scale({ metric: true, imperial: false }).addTo(map);

			// Click to filter by bbox around clicked point (±5°)
			map.on('click', (e: any) => {
				const { lat, lng } = e.latlng || {};
				if (typeof lat !== 'number' || typeof lng !== 'number') return;
				const pad = 5;
				const bbox = `${(lng - pad).toFixed(2)},${(lat - pad).toFixed(2)},${(lng + pad).toFixed(2)},${(lat + pad).toFixed(2)}`;
				navigateRef.current(bbox);
			});

			mapRef.current = map;
			if (disposed) {
				try { map.remove(); } catch {}
			}
		})();

		return () => {
			disposed = true;
			if (mapRef.current) {
				try { mapRef.current.remove(); } catch {}
				mapRef.current = null;
			}
		};
	}, []);

	// Update markers when items change
	useEffect(() => {
		(async () => {
			if (!mapRef.current) return;
			const leaflet = await import('leaflet');
			const L: any = (leaflet as any).default ?? leaflet;

			// Clear previous layer
			if (layerRef.current) {
				try { layerRef.current.remove(); } catch {}
				layerRef.current = null;
			}

			const layer = L.layerGroup();
			const boundsPoints: [number, number][] = [];
			const markerSource = showLocalReports ? [...items, ...localReports] : [...items];
			markerSource.forEach((i) => {
				const rawLon: any = Array.isArray(i?.coords) ? i.coords[0] : (i as any)?.lon;
				const rawLat: any = Array.isArray(i?.coords) ? i.coords[1] : (i as any)?.lat;
				const lon = typeof rawLon === 'string' ? parseFloat(rawLon) : Number(rawLon);
				const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat);
				if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
				if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;

				const isLocal = Boolean(i.local);
				const color = isLocal ? '#6366f1' : (colors as any)[i.severity] || '#0ea5a4';
				const marker = L.circleMarker([lat, lon], {
					radius: isLocal ? 7 : 6,
					color: isLocal ? '#312e81' : '#111827',
					weight: 1,
					fillColor: color,
					fillOpacity: isLocal ? 0.95 : 0.9,
				}).bindPopup(
					`<div style="font-size:12px;line-height:1.3">
						<div><strong>${i.type ?? (isLocal ? 'local report' : 'incident')}</strong> • ${i.severity}${isLocal ? ' (local)' : ''}</div>
						<div>${lat.toFixed(3)}, ${lon.toFixed(3)}</div>
						<div>${new Date(i.createdAt).toLocaleString?.() ?? ''}</div>
						${i.description ? `<div style="margin-top:4px;color:#6b7280">${escapeHtml(i.description)}</div>` : ''}
					</div>`
				);
				marker.addTo(layer);
				boundsPoints.push([lat, lon]);
			});

			if (activeBbox) {
				const sw = L.latLng(activeBbox.minLat, activeBbox.minLon);
				const ne = L.latLng(activeBbox.maxLat, activeBbox.maxLon);
				const bboxBounds = L.latLngBounds(sw, ne);
				const rect = L.rectangle(bboxBounds, {
					color: '#2563eb',
					weight: 1.4,
					dashArray: '6 4',
					fillColor: '#60a5fa',
					fillOpacity: 0.08,
				});
				rect.addTo(layer);
				boundsPoints.push([activeBbox.minLat, activeBbox.minLon], [activeBbox.maxLat, activeBbox.maxLon]);
			}

			layer.addTo(mapRef.current);
			layerRef.current = layer;

			// Auto-fit to markers if present, with a sensible max zoom to avoid zooming too close
			if (boundsPoints.length > 0) {
				try {
					const b = L.latLngBounds(boundsPoints.map(([la, lo]) => L.latLng(la, lo)));
					mapRef.current.fitBounds(b, { padding: [20, 20] });
					const maxZ = 7;
					if (mapRef.current.getZoom && mapRef.current.setZoom) {
						const z = mapRef.current.getZoom();
						if (typeof z === 'number' && z > maxZ) mapRef.current.setZoom(maxZ);
					}
				} catch {}
			} else {
				mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
			}
		})();
	}, [items, colors, activeBbox, localReports, showLocalReports]);

	const handleFocusLocalReports = async () => {
		if (!mapRef.current || localReports.length === 0) return;
		const leaflet = await import('leaflet');
		const L: any = (leaflet as any).default ?? leaflet;
		const points = localReports
			.map((r) => {
				const lat = Array.isArray(r.coords) ? r.coords[1] : (r as any)?.lat;
				const lon = Array.isArray(r.coords) ? r.coords[0] : (r as any)?.lon;
				return (Number.isFinite(lat) && Number.isFinite(lon)) ? L.latLng(lat, lon) : null;
			})
			.filter(Boolean);
		if (!points.length) return;
		try {
			const bounds = L.latLngBounds(points as any);
			mapRef.current.fitBounds(bounds, { padding: [30, 30] });
			const z = mapRef.current.getZoom?.();
			if (typeof z === 'number' && z > 10) mapRef.current.setZoom(10);
		} catch {}
	};

	const handleClearArea = () => navigateRef.current(undefined);
	const renderedCount = showLocalReports ? items.length + localReports.length : items.length;

	return (
		<div className="relative w-full" style={{ width: '100%', position: 'relative', isolation: 'isolate' }}>
			<div ref={mapEl} style={{ width: '100%', height: '420px', borderRadius: 8, border: '1px solid var(--color-border)', overflow: 'hidden' }} />
			{activeBbox && (
				<div
					style={{
						position: 'absolute',
						top: 16,
						left: 16,
						zIndex: 1200,
						padding: '10px 12px',
						background: 'color-mix(in srgb, var(--color-surface) 88%, #ffffff)',
						borderRadius: 10,
						boxShadow: '0 4px 12px rgba(15,23,42,0.14)',
						border: '1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border))',
						maxWidth: 260,
						pointerEvents: 'auto',
					}}
				>
					<div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--color-on-surface)' }}>Area filter active</div>
					<div style={{ fontSize: 11, fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-muted)' }}>
						SW: {activeBbox.minLon.toFixed(2)}, {activeBbox.minLat.toFixed(2)}
						<br />
						NE: {activeBbox.maxLon.toFixed(2)}, {activeBbox.maxLat.toFixed(2)}
					</div>
					<button
						type="button"
						onClick={handleClearArea}
						className="btn btn--ghost"
						style={{ marginTop: 8, fontSize: 11, padding: '4px 8px' }}
					>
						Clear area filter
					</button>
				</div>
			)}
			{localReady && (
				<div
					style={{
						position: 'absolute',
						top: 16,
						right: 16,
						zIndex: 1200,
						padding: '12px 14px',
						background: 'color-mix(in srgb, var(--color-surface) 94%, #ffffff)',
						borderRadius: 10,
						boxShadow: '0 4px 16px rgba(15,23,42,0.15)',
						border: '1px solid color-mix(in srgb, var(--color-secondary) 35%, var(--color-border))',
						width: 240,
						pointerEvents: 'auto',
					}}
				>
					<div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-on-surface)' }}>Past reports (local)</div>
					<div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
						{localReports.length ? `${localReports.length} saved on this browser` : 'No saved reports yet'}
					</div>
					{localReports.length > 0 && (
						<div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
							<label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--color-on-surface)' }}>
								<input
									type="checkbox"
									checked={showLocalReports}
									onChange={(e) => setShowLocalReports(e.target.checked)}
									style={{ width: 14, height: 14 }}
								/>
								Show on map
							</label>
							<button
								type="button"
								onClick={handleFocusLocalReports}
								className="btn btn--ghost"
								style={{ fontSize: 11, padding: '4px 8px', justifySelf: 'start' }}
							>
								Zoom to reports
							</button>
						</div>
					)}
				</div>
			)}
			{renderedCount === 0 && (
				<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
					<div style={{ background: 'rgba(255,255,255,0.7)', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#6b7280' }}>No data to display</div>
				</div>
			)}
		</div>
	);
}

