#!/usr/bin/env node
// Placeholder codegen: copies schemas to docs and generates a trivial TS file
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

try {
  const apiSpecs = resolve(process.cwd(), '../../docs/api-specs.md');
  const content = '# API Specs\n\nGenerated placeholder. Replace with real codegen.';
  writeFileSync(apiSpecs, content);
  const out = resolve(process.cwd(), 'src/generated/index.ts');
  writeFileSync(out, '// generated placeholder');
  console.log('codegen: updated docs/api-specs.md and src/generated');
} catch (e) {
  console.warn('codegen placeholder failed:', e.message);
}
