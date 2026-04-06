#!/usr/bin/env node
/**
 * Applies supabase/.temp/migration-chunk-*.sql to a remote Supabase project via Management API.
 *
 * Requires a personal access token (Dashboard → Account → Access tokens):
 *   export SUPABASE_ACCESS_TOKEN='sbp_...'
 *   export TARGET_PROJECT_REF='axgbhscmwjcqjslmofhx'   # optional
 *
 * Generate chunks first:
 *   node scripts/split-migrations-for-remote.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.TARGET_PROJECT_REF || 'axgbhscmwjcqjslmofhx';

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function runQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 2000)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const chunksDir = path.join(root, 'supabase', '.temp');
const chunks = fs
  .readdirSync(chunksDir)
  .filter((f) => f.startsWith('migration-chunk-') && f.endsWith('.sql'))
  .sort();

if (chunks.length === 0) {
  console.error('No chunks found. Run: node scripts/split-migrations-for-remote.mjs');
  process.exit(1);
}

console.log(`Project ${ref}: applying ${chunks.length} chunk(s)...`);

for (const c of chunks) {
  const sql = fs.readFileSync(path.join(chunksDir, c), 'utf8');
  process.stdout.write(`${c} (${sql.length} bytes)... `);
  await runQuery(sql);
  console.log('ok');
}

console.log('Done.');
