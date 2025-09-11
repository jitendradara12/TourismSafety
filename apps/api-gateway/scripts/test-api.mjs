#!/usr/bin/env node
/*
  Minimal API quick tests (no deps):
  - GET /healthz -> {status:"ok"}
  - GET /incidents?limit=2 -> 200 + items array
  - POST /incidents (valid) -> 201 + id
  - POST /incidents (invalid) -> 400

  Usage: node scripts/test-api.mjs [baseUrl]
*/

const base = process.argv[2] || 'http://localhost:4000';
const headers = { 'content-type': 'application/json' };

function log(title, ok, extra = '') {
  console.log(`${ok ? '✔' : '✖'} ${title}${extra ? ' - ' + extra : ''}`);
}

async function main() {
  let failed = 0;

  // healthz
  try {
    const r = await fetch(`${base}/healthz`);
    const j = await r.json();
    const ok = r.ok && j && j.status === 'ok';
    log('GET /healthz', ok);
    if (!ok) failed++;
  } catch (e) {
    log('GET /healthz', false, String(e));
    failed++;
  }

  // list incidents
  try {
    const r = await fetch(`${base}/incidents?limit=2`);
    const j = await r.json();
    const ok = r.ok && j && Array.isArray(j.items);
    log('GET /incidents?limit=2', ok, ok ? `items=${j.items.length}` : '');
    if (!ok) failed++;
  } catch (e) {
    log('GET /incidents?limit=2', false, String(e));
    failed++;
  }

  // create valid
  try {
    const body = { type: 'fire', severity: 'low', location: { lat: 10, lon: 10 } };
    const r = await fetch(`${base}/incidents`, { method: 'POST', headers, body: JSON.stringify(body) });
    const ok = r.status === 201;
    let info = '';
    try { const j = await r.json(); info = j && j.id ? `id=${String(j.id).slice(0,8)}` : ''; } catch {}
    log('POST /incidents (valid)', ok, info);
    if (!ok) failed++;
  } catch (e) {
    log('POST /incidents (valid)', false, String(e));
    failed++;
  }

  // create invalid
  try {
    const r = await fetch(`${base}/incidents`, { method: 'POST', headers, body: JSON.stringify({}) });
    const ok = r.status === 400;
    log('POST /incidents (invalid)', ok);
    if (!ok) failed++;
  } catch (e) {
    log('POST /incidents (invalid)', false, String(e));
    failed++;
  }

  if (failed) {
    console.error(`\n${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('\nAll checks passed');
  }
}

main();
