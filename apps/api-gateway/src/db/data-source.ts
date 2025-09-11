import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Incident } from './entities/Incident';
import { env } from '../config';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [Incident],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  ssl: false,
});

export default AppDataSource;
