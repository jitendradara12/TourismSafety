import type { Request, Response } from 'express';
import { Router } from 'express';
import AppDataSource from '../db/data-source';
import { Incident } from '../db/entities/Incident';

const router = Router();


router.get('/', (req: Request, res: Response) => {
  const status = (Array.isArray(req.query.status) ? req.query.status : (req.query.status ? [req.query.status] : [])) as string[];
  const severity = (Array.isArray(req.query.severity) ? req.query.severity : (req.query.severity ? [req.query.severity] : [])) as string[];
  const take = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200);
  const createdBefore = typeof req.query.created_before === 'string' ? new Date(req.query.created_before) : null;
  const createdAfter = typeof req.query.created_after === 'string' ? new Date(req.query.created_after) : null;
  const bboxStr = typeof req.query.bbox === 'string' ? req.query.bbox : null; // minLon,minLat,maxLon,maxLat
  let bbox: [number, number, number, number] | null = null;
  if (bboxStr) {
    const parts = bboxStr.split(',').map((n) => Number(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [minLon, minLat, maxLon, maxLat] = parts as [number, number, number, number];
      if (minLon <= maxLon && minLat <= maxLat) bbox = [minLon, minLat, maxLon, maxLat];
    }
  }

  const qb = AppDataSource.getRepository(Incident)
    .createQueryBuilder('i')
    .orderBy('i.created_at', 'DESC')
    .limit(take);

  if (status.length) qb.andWhere('i.status = ANY(:status)', { status });
  if (severity.length) qb.andWhere('i.severity = ANY(:severity)', { severity });
  if (createdBefore && !isNaN(createdBefore.getTime())) qb.andWhere('i.created_at < :cursor', { cursor: createdBefore.toISOString() });
  if (createdAfter && !isNaN(createdAfter.getTime())) qb.andWhere('i.created_at >= :after', { after: createdAfter.toISOString() });
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    qb.andWhere('i.lon BETWEEN :minLon AND :maxLon AND i.lat BETWEEN :minLat AND :maxLat', {
      minLon,
      maxLon,
      minLat,
      maxLat,
    });
  }

  qb
    .getMany()
    .then((items: Incident[]) => {
      const last = items[items.length - 1];
      const nextCursor = last ? last.created_at.toISOString() : null;
      return res.json({
        items: items.map((i: Incident) => ({
          id: i.id,
          type: i.type,
          severity: i.severity,
          status: i.status,
          coords: [i.lon, i.lat] as [number, number],
          createdAt: i.created_at.toISOString(),
        })),
        nextCursor,
      });
    })
    .catch((e: unknown) => res.status(500).json({ title: 'Server error', detail: String(e) }));
});

router.get('/export', (req: Request, res: Response) => {
  const status = (Array.isArray(req.query.status) ? req.query.status : (req.query.status ? [req.query.status] : [])) as string[];
  const severity = (Array.isArray(req.query.severity) ? req.query.severity : (req.query.severity ? [req.query.severity] : [])) as string[];
  const take = Math.min(Math.max(Number(req.query.limit ?? 500), 1), 1000);
  const createdBefore = typeof req.query.created_before === 'string' ? new Date(req.query.created_before) : null;
  const createdAfter = typeof req.query.created_after === 'string' ? new Date(req.query.created_after) : null;
  const bboxStr = typeof req.query.bbox === 'string' ? req.query.bbox : null; // minLon,minLat,maxLon,maxLat
  let bbox: [number, number, number, number] | null = null;
  if (bboxStr) {
    const parts = bboxStr.split(',').map((n) => Number(n.trim()));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [minLon, minLat, maxLon, maxLat] = parts as [number, number, number, number];
      if (minLon <= maxLon && minLat <= maxLat) bbox = [minLon, minLat, maxLon, maxLat];
    }
  }

  const qb = AppDataSource.getRepository(Incident)
    .createQueryBuilder('i')
    .orderBy('i.created_at', 'DESC')
    .limit(take);

  if (status.length) qb.andWhere('i.status = ANY(:status)', { status });
  if (severity.length) qb.andWhere('i.severity = ANY(:severity)', { severity });
  if (createdBefore && !isNaN(createdBefore.getTime())) qb.andWhere('i.created_at < :cursor', { cursor: createdBefore.toISOString() });
  if (createdAfter && !isNaN(createdAfter.getTime())) qb.andWhere('i.created_at >= :after', { after: createdAfter.toISOString() });
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    qb.andWhere('i.lon BETWEEN :minLon AND :maxLon AND i.lat BETWEEN :minLat AND :maxLat', {
      minLon,
      maxLon,
      minLat,
      maxLat,
    });
  }

  qb
    .getMany()
    .then((items: Incident[]) => {
      const header = ['id', 'type', 'severity', 'status', 'lon', 'lat', 'createdAt'];
      const rows = items.map((i) => [i.id, i.type, i.severity, i.status, String(i.lon), String(i.lat), i.created_at.toISOString()]);
      const escape = (v: string) => (v.includes(',') || v.includes('"') || v.includes('\n') ? '"' + v.replace(/"/g, '""') + '"' : v);
      const csv = [header.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="incidents.csv"');
      return res.status(200).send(csv);
    })
    .catch((e: unknown) => res.status(500).json({ title: 'Server error', detail: String(e) }));
});

  // Get single incident by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const repo = AppDataSource.getRepository(Incident);
      const i = await repo.findOneBy({ id });
      if (!i) return res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Incident not found', code: 'INC_404_NOT_FOUND' });
      return res.json({
        id: i.id,
        type: i.type,
        severity: i.severity,
        status: i.status,
        coords: [i.lon, i.lat] as [number, number],
        createdAt: i.created_at.toISOString(),
      });
    } catch (e) {
      return res.status(500).json({ title: 'Server error', detail: String(e) });
    }
  });

router.post('/', (req: Request, res: Response) => {
  const { type, severity, description, location } = req.body ?? {};
  if (!type || !severity || !location?.lat || !location?.lon) {
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Bad Request',
      status: 400,
      detail: 'Missing required fields',
      code: 'INC_400_BAD_REQUEST',
    });
  }
  const repo = AppDataSource.getRepository(Incident);
  const entity = repo.create({
    type,
    severity,
    status: 'open',
    lat: location.lat,
    lon: location.lon,
  });
  repo
    .save(entity)
    .then((saved: Incident) => {
      return res.status(201).json({ id: saved.id, status: saved.status, createdAt: saved.created_at.toISOString() });
    })
    .catch((e: unknown) => res.status(500).json({ title: 'Server error', detail: String(e) }));
});

export default router;
