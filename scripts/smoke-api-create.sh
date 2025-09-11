#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:4000}
TYPE=${2:-fire}
SEVERITY=${3:-low}
LAT=${4:-37.7749}
LON=${5:--122.4194}

echo "Creating incident at $BASE/incidents ..."
RES=$(curl -sS -w "\n%{http_code}" -X POST "$BASE/incidents" \
  -H 'Content-Type: application/json' \
  -d "{\"type\":\"$TYPE\",\"severity\":\"$SEVERITY\",\"location\":{\"lat\":$LAT,\"lon\":$LON}}")

BODY=$(echo "$RES" | head -n -1)
CODE=$(echo "$RES" | tail -n 1)

echo "HTTP $CODE"
echo "$BODY" | jq -c . 2>/dev/null || echo "$BODY"

if [[ "$CODE" != "201" ]]; then
  echo "Creation failed" >&2
  exit 1
fi
