#!/usr/bin/env node
/**
 * Applies supabase/.temp/bundle-*.sql (from cat of migration chunks) via Management API.
 *
 *   export SUPABASE_ACCESS_TOKEN='sbp_...'
 *   export TARGET_PROJECT_REF='axgbhscmwjcqjslmofhx'
 *   node scripts/push-sql-bundles-to-supabase.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.TARGET_PROJECT_REF || 'axgbhscmwjcqjslmofhx';

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN');
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
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 4000)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const dir = path.join(root, 'supabase', '.temp');
const bundles = fs
  .readdirSync(dir)
  .filter((f) => /^bundle-\d+\.sql$/.test(f))
  .sort();

if (bundles.length === 0) {
  console.error('No bundle-*.sql in supabase/.temp. Build with cat of migration-chunk-*.sql');
  process.exit(1);
}

console.log(`Project ${ref}: applying ${bundles.length} bundle(s)...`);

for (const b of bundles) {
  const sql = fs.readFileSync(path.join(dir, b), 'utf8');
  process.stdout.write(`${b} (${sql.length} bytes)... `);
  await runQuery(sql);
  console.log('ok');
}

console.log('Done.');
