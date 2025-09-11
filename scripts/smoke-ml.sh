#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:8000/healthz}"
echo "Hitting $URL..."
code=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [[ "$code" == "200" ]]; then
  echo "OK: ML service healthy"
else
  echo "FAIL: got HTTP $code" && exit 1
fi
