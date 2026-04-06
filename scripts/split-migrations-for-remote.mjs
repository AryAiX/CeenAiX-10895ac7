#!/usr/bin/env node
/**
 * Splits supabase/migrations/*.sql into chunks <= maxBytes (UTF-8) on file boundaries.
 * Used to apply schema via execute_sql when a single payload is too large.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const migDir = path.join(root, 'supabase', 'migrations');
const maxBytes = Number(process.env.CHUNK_MAX_BYTES || 45000);

const files = fs
  .readdirSync(migDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const chunks = [];
let current = '';
let currentBytes = 0;

function addPart(header, body) {
  const piece = `${header}\n${body}\n\n`;
  const b = Buffer.byteLength(piece, 'utf8');
  if (currentBytes + b > maxBytes && current.length > 0) {
    chunks.push(current);
    current = '';
    currentBytes = 0;
  }
  current += piece;
  currentBytes += b;
}

for (const f of files) {
  const body = fs.readFileSync(path.join(migDir, f), 'utf8');
  addPart(`-- === ${f} ===`, body);
}
if (current.length > 0) {
  chunks.push(current);
}

const outDir = path.join(root, 'supabase', '.temp');
fs.mkdirSync(outDir, { recursive: true });
chunks.forEach((sql, i) => {
  const p = path.join(outDir, `migration-chunk-${String(i + 1).padStart(2, '0')}.sql`);
  fs.writeFileSync(p, sql, 'utf8');
});
console.log(JSON.stringify({ chunks: chunks.length, files: files.length, maxBytes }));
