#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:4000}
echo "Checking $BASE/healthz..."
curl -sSf "$BASE/healthz" | jq -c . 2>/dev/null || curl -sSf "$BASE/healthz"
echo
echo "Listing incidents (limit=1)..."
curl -sSf "$BASE/incidents?limit=1" | jq -c . 2>/dev/null || curl -sSf "$BASE/incidents?limit=1"
echo
