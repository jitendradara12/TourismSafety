.PHONY: dev stop compose ml web web-build web-start api api-db iot

dev:
	@echo "Starting dev servers with turbo (web, api, ml)"
	pnpm turbo run dev --parallel --filter=@sih/web --filter=@sih/api-gateway || npm run dev

stop:
	docker compose -f infra/compose/docker-compose.yml down

compose:
	docker compose -f infra/compose/docker-compose.yml up -d postgres redis minio kafka zookeeper mosquitto keycloak

ml:
	cd apps/ml-serving && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

ml-health:
	@curl -sS http://localhost:8000/healthz || true; echo

web:
	cd apps/web && pnpm dev || npm run dev

web-build:
	cd apps/web && pnpm build || npm run build

web-start:
	cd apps/web && pnpm start || npm start

api:
	cd apps/api-gateway && pnpm dev || npm run dev

api-db:
	cd apps/api-gateway && pnpm db:prepare

iot:
	cd apps/iot-gateway && pnpm dev || npm run dev

api-smoke:
	bash ./apps/api-gateway/scripts/smoke.sh

api-smoke-create:
	bash ./scripts/smoke-api-create.sh

api-test:
	node ./apps/api-gateway/scripts/test-api.mjs
