#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:4000}
echo "Checking $BASE/healthz..."
curl -sSf "$BASE/healthz" | jq -c . 2>/dev/null || curl -sSf "$BASE/healthz"
echo
echo "Listing incidents (limit=2)..."
curl -sSf "$BASE/incidents?limit=2" | jq -c . 2>/dev/null || curl -sSf "$BASE/incidents?limit=2"
echo
