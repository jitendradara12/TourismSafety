import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIncidents1700000000000 implements MigrationInterface {
    name = 'InitIncidents1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
                await queryRunner.query(`CREATE TABLE IF NOT EXISTS incidents (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          type text NOT NULL,
          severity text NOT NULL CHECK (severity in ('low','medium','high','critical')),
          status text NOT NULL DEFAULT 'open' CHECK (status in ('open','triaged','closed')),
          lat double precision NOT NULL,
          lon double precision NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS incidents_status_severity_created_at_idx ON incidents (status, severity, created_at DESC);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS incidents;`);
    }
}
