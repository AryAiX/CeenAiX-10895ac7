#!/usr/bin/env node
/**
 * Copies auth.users, auth.identities, and all public.* rows from SOURCE ref to TARGET ref
 * using the Supabase Management API (same PAT as other scripts).
 *
 * Reads SUPABASE_ACCESS_TOKEN from docs/keys.local.md (first `sbp_...` token).
 *
 *   node scripts/copy-dev-db-to-idea-db.mjs
 *
 * Requires: schema already applied on TARGET (e.g. scripts/push-sql-bundles-to-supabase.mjs).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SOURCE_REF = process.env.SOURCE_PROJECT_REF || 'lgfaucsfiyxvmsghnpey';
const TARGET_REF = process.env.TARGET_PROJECT_REF || 'axgbhscmwjcqjslmofhx';

function loadToken() {
  const md = readFileSync(path.join(root, 'docs', 'keys.local.md'), 'utf8');
  const m = md.match(/`sbp_[a-f0-9]+`/);
  if (!m) throw new Error('No `sbp_...` token in docs/keys.local.md');
  return m[0].slice(1, -1);
}

async function query(ref, sql) {
  const token = loadToken();
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
    throw new Error(`[${ref}] HTTP ${res.status}: ${text.slice(0, 4000)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function columnMeta(schema, table) {
  const rows = await query(
    SOURCE_REF,
    `SELECT column_name, data_type, udt_name, is_generated
     FROM information_schema.columns
     WHERE table_schema = '${schema}' AND table_name = '${table}'
       AND is_generated IS DISTINCT FROM 'ALWAYS'
     ORDER BY ordinal_position`
  );
  return rows;
}

function formatCell(meta, val) {
  if (val === null || val === undefined) return 'NULL';
  const dt = meta.data_type;
  const udt = meta.udt_name;

  if (dt === 'boolean' || udt === 'bool') return val ? 'true' : 'false';
  if (dt === 'integer' || dt === 'bigint' || dt === 'smallint' || udt === 'int2' || udt === 'int4' || udt === 'int8')
    return String(val);
  if (dt === 'numeric' || dt === 'double precision' || dt === 'real') return String(val);
  if (dt === 'uuid' || udt === 'uuid') return `'${String(val).replace(/'/g, "''")}'::uuid`;
  if (dt === 'json' || dt === 'jsonb' || udt === 'json' || udt === 'jsonb') {
    const s = JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "''");
    return `'${s}'::jsonb`;
  }
  if (dt === 'ARRAY' || String(udt).startsWith('_')) {
    const s = JSON.stringify(val).replace(/'/g, "''");
    return `'${s}'::${udt}`;
  }
  if (dt === 'timestamp without time zone' || dt === 'timestamp with time zone' || dt === 'date') {
    const s = String(val).replace(/'/g, "''");
    return `'${s}'::timestamptz`;
  }
  if (dt === 'USER-DEFINED') {
    const s = String(val).replace(/'/g, "''");
    return `'${s}'::${udt}`;
  }
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function rowValues(metas, row) {
  return metas.map((m) => formatCell(m, row[m.column_name]));
}

async function fetchAll(ref, schema, table) {
  const ident = `${schema}.${table}`;
  return query(ref, `SELECT * FROM ${ident}`);
}

async function insertBatch(targetRef, schema, table, metas, rows) {
  if (rows.length === 0) return;
  const cols = metas.map((m) => `"${m.column_name}"`).join(', ');
  const ident = `${schema}.${table}`;
  const values = rows.map((r) => `(${rowValues(metas, r).join(', ')})`).join(',\n');
  const sql = `INSERT INTO ${ident} (${cols}) VALUES ${values}`;
  await query(targetRef, sql);
}

async function publicTopologicalOrder() {
  const fks = await query(
    SOURCE_REF,
    `SELECT
       tc.table_name AS tbl,
       ccu.table_name AS ref_tbl
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND ccu.table_schema = 'public'
       AND tc.table_name <> ccu.table_name`
  );

  const tablesRows = await query(
    SOURCE_REF,
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  const tables = tablesRows.map((r) => r.tablename);
  const edges = new Map();
  for (const t of tables) edges.set(t, new Set());
  for (const { tbl, ref_tbl } of fks) {
    if (edges.has(tbl) && edges.has(ref_tbl) && tbl !== ref_tbl) {
      edges.get(tbl).add(ref_tbl);
    }
  }

  const ordered = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(t) {
    if (visited.has(t)) return;
    if (visiting.has(t)) {
      console.warn('Cycle involving', t, '- appending anyway');
      return;
    }
    visiting.add(t);
    for (const dep of edges.get(t) || []) visit(dep);
    visiting.delete(t);
    visited.add(t);
    ordered.push(t);
  }
  for (const t of tables) visit(t);
  return ordered;
}

async function truncateTargetPublic() {
  const tabs = await query(
    TARGET_REF,
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  const list = tabs.map((r) => `public."${r.tablename}"`).join(', ');
  await query(TARGET_REF, `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

async function clearTargetAuth() {
  await query(TARGET_REF, `DELETE FROM auth.identities`);
  await query(TARGET_REF, `DELETE FROM auth.users`);
}

async function main() {
  console.log(`Copy data ${SOURCE_REF} -> ${TARGET_REF}`);

  await truncateTargetPublic();
  console.log('Truncated public on target');

  await clearTargetAuth();
  console.log('Cleared auth.identities + auth.users on target');

  const usersMeta = await columnMeta('auth', 'users');
  const users = await fetchAll(SOURCE_REF, 'auth', 'users');
  await insertBatch(TARGET_REF, 'auth', 'users', usersMeta, users);
  console.log(`Inserted auth.users (${users.length})`);

  const idMeta = await columnMeta('auth', 'identities');
  const identities = await fetchAll(SOURCE_REF, 'auth', 'identities');
  await insertBatch(TARGET_REF, 'auth', 'identities', idMeta, identities);
  console.log(`Inserted auth.identities (${identities.length})`);

  const order = await publicTopologicalOrder();
  for (const t of order) {
    const metas = await columnMeta('public', t);
    const rows = await fetchAll(SOURCE_REF, 'public', t);
    if (rows.length === 0) continue;
    await insertBatch(TARGET_REF, 'public', t, metas, rows);
    console.log(`Inserted public.${t} (${rows.length})`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
