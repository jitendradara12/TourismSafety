import 'reflect-metadata';
import AppDataSource from './db/data-source';
import { Incident } from './db/entities/Incident';

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Incident);
  const samples: Partial<Incident>[] = [
    { type: 'fire', severity: 'high', status: 'open', lat: 37.7749, lon: -122.4194 },
    { type: 'flood', severity: 'medium', status: 'triaged', lat: 34.0522, lon: -118.2437 },
    { type: 'earthquake', severity: 'critical', status: 'open', lat: 35.6895, lon: 139.6917 },
  ];
  await repo.save(samples.map((s) => repo.create(s)));
  console.log('Seeded incidents:', samples.length);
  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
