#!/usr/bin/env bash
set -euo pipefail

WEB_URL="${WEB_URL:-http://localhost:${PORT:-3037}}"

echo "[web] healthz => $WEB_URL/healthz"
code=$(curl -sS -o /dev/null -w '%{http_code}' "$WEB_URL/healthz" || true)
echo "HTTP $code"

echo "[web] dashboard/incidents => $WEB_URL/dashboard/incidents"
code2=$(curl -sS -o /dev/null -w '%{http_code}' "$WEB_URL/dashboard/incidents" || true)
echo "HTTP $code2"

if [[ "$code" != "200" || "$code2" != "200" ]]; then
  echo "Smoke failed" >&2
  exit 1
fi
echo "Smoke OK"
