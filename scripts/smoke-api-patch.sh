#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:4000}

echo "[smoke] Creating incident..."
CREATE_RES=$(curl -sS -w "\n%{http_code}" -X POST "$BASE/incidents" \
  -H 'Content-Type: application/json' \
  -d '{"type":"smoke","severity":"low","location":{"lat":37.7749,"lon":-122.4194}}')
CREATE_BODY=$(echo "$CREATE_RES" | head -n -1)
CREATE_CODE=$(echo "$CREATE_RES" | tail -n 1)
echo "[smoke] POST /incidents => $CREATE_CODE"
echo "$CREATE_BODY" | jq -c . 2>/dev/null || echo "$CREATE_BODY"
if [[ "$CREATE_CODE" != "201" ]]; then echo "[smoke] create failed" >&2; exit 1; fi

ID=$(echo "$CREATE_BODY" | jq -r '.id' 2>/dev/null || echo "$CREATE_BODY" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
if [[ -z "$ID" || "$ID" == "null" ]]; then echo "[smoke] could not parse id" >&2; exit 1; fi

echo "[smoke] Patching incident $ID to status=triaged..."
PATCH_RES=$(curl -sS -w "\n%{http_code}" -X PATCH "$BASE/incidents/$ID" \
  -H 'Content-Type: application/json' \
  -d '{"status":"triaged"}')
PATCH_BODY=$(echo "$PATCH_RES" | head -n -1)
PATCH_CODE=$(echo "$PATCH_RES" | tail -n 1)
echo "[smoke] PATCH /incidents/$ID => $PATCH_CODE"
echo "$PATCH_BODY" | jq -c . 2>/dev/null || echo "$PATCH_BODY"
if [[ "$PATCH_CODE" != "200" ]]; then echo "[smoke] patch failed" >&2; exit 1; fi

STATUS=$(echo "$PATCH_BODY" | jq -r '.status' 2>/dev/null || echo "$PATCH_BODY" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')
if [[ "$STATUS" != "triaged" ]]; then echo "[smoke] unexpected status: $STATUS" >&2; exit 1; fi

echo "[smoke] OK"
