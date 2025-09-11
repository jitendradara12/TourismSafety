# SIH Safety Platform (Monorepo)

This monorepo follows the instructions in `.github/instructions/AIinstructions.instructions.md`.

- Apps: Next.js web, Express API gateway, (placeholders for mobile, ML, IoT)
- Packages: shared types, UI tokens, schemas
- Infra: docker-compose stack for local dev

Quick start (once Node 20+ and pnpm are installed):

## Quick Start

Install deps and build web/API:
```bash
pnpm install
pnpm -C apps/web build
pnpm -C apps/api-gateway build
```

Run API (requires Postgres reachable at DATABASE_URL; see apps/api-gateway/.env.example):
```bash
cd apps/api-gateway
pnpm db:prepare   # builds + migrations + seed
node dist/index.js
```

Run web:
```bash
cd ../../apps/web
pnpm start
```

Smokes:
```bash
./scripts/smoke-ml.sh     # ML /healthz
./scripts/smoke-api.sh    # API /healthz + incidents list
```

See `/docs/runbooks.md` and `/docs/architecture.md` for details.

## Makefile shortcuts (optional)

```bash
# API database prep (build + migrate + seed)
make api-db

# Run quick API smoke
make api-smoke

# Start ML locally (reload) and check health
make ml
make ml-health

# Start web in dev mode
make web
```
