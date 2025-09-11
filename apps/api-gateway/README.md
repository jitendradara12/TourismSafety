# API Gateway (Express + TypeORM)

## Prereqs
- Node 20+
- Postgres running (see `infra/compose/docker-compose.yml`)

## Setup
```bash
cp .env.example .env
pnpm install
```

## Dev
```bash
pnpm -C apps/api-gateway dev
```

## Build & Start
```bash
pnpm -C apps/api-gateway build
pnpm -C apps/api-gateway start
```

## Migrations
Run after Postgres is up and `DATABASE_URL` is set in `.env`:
```bash
pnpm -C apps/api-gateway migration:run
```
