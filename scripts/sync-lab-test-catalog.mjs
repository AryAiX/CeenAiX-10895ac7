#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputArg = args.find((arg) => arg.startsWith('--input='));
const targetArg = args.find((arg) => arg.startsWith('--target='));
const seedPath = inputArg
  ? path.resolve(root, inputArg.slice('--input='.length))
  : path.join(root, 'scripts', 'lab-test-catalog.seed.json');
const targetCount = targetArg ? Number.parseInt(targetArg.slice('--target='.length), 10) : 1000;

const normalizeEnvValue = (value) =>
  typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : '';

const supabaseUrl = normalizeEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
const nonLabPattern =
  /\b(brother|sister|twin|still living|family history|cone beam ct|tmj|teeth|questionnaire|survey|protocol|phenx|assessment|scale|score|interview|who is|how many)\b/i;

const isDeprecated = (value) => /\bdeprecated\b/i.test(value);
const isLikelyNonLab = (value) => nonLabPattern.test(value);

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const extractSpecimen = (displayName) => {
  const normalized = normalizeWhitespace(displayName);
  const parts = normalized.split(' - ');

  if (parts.length < 2) {
    return null;
  }

  const specimen = parts.at(-1)?.trim() ?? '';
  return specimen.length > 0 ? specimen : null;
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`LOINC request failed (${response.status}) for ${url}`);
  }

  return response.json();
};

const resolveSeedRows = async (seedRows) => {
  const resolved = [];
  const seenCodes = new Set();

  for (const seedRow of seedRows) {
    const term = typeof seedRow.term === 'string' ? seedRow.term.trim() : '';
    const category = typeof seedRow.category === 'string' ? seedRow.category.trim() : '';
    const limit = Number.isFinite(seedRow.limit) ? Math.min(Math.max(seedRow.limit, 1), 100) : 20;

    if (!term || !category) {
      throw new Error('Each lab test seed row must provide non-empty "term" and "category" values.');
    }

    const url = new URL('https://clinicaltables.nlm.nih.gov/api/loinc_items/v3/search');
    url.searchParams.set('type', 'question');
    url.searchParams.set('terms', term);
    url.searchParams.set('count', String(limit));
    url.searchParams.set('offset', '0');
    url.searchParams.set('df', 'LOINC_NUM,SHORTNAME,LONG_COMMON_NAME');
    url.searchParams.set('ef', 'PROPERTY,CLASS,SHORTNAME,LONG_COMMON_NAME');

    const payload = await fetchJson(url.toString());
    const codes = Array.isArray(payload?.[1]) ? payload[1] : [];
    const extra = payload?.[2] && typeof payload[2] === 'object' ? payload[2] : {};
    const displayRows = Array.isArray(payload?.[3]) ? payload[3] : [];

    let accepted = 0;

    for (let index = 0; index < codes.length; index += 1) {
      const code = typeof codes[index] === 'string' ? codes[index].trim() : '';
      const displayRow = Array.isArray(displayRows[index]) ? displayRows[index] : [];
      const shortName = typeof displayRow[1] === 'string' ? normalizeWhitespace(displayRow[1]) : '';
      const longCommonName = typeof displayRow[2] === 'string' ? normalizeWhitespace(displayRow[2]) : '';
      const property = Array.isArray(extra.PROPERTY) && typeof extra.PROPERTY[index] === 'string'
        ? normalizeWhitespace(extra.PROPERTY[index])
        : null;
      const loincClass = Array.isArray(extra.CLASS) && typeof extra.CLASS[index] === 'string'
        ? normalizeWhitespace(extra.CLASS[index])
        : null;
      const displayNameEn = longCommonName || shortName;

      if (
        !code ||
        !displayNameEn ||
        seenCodes.has(code) ||
        isDeprecated(displayNameEn) ||
        isDeprecated(shortName) ||
        isLikelyNonLab(displayNameEn) ||
        isLikelyNonLab(shortName)
      ) {
        continue;
      }

      seenCodes.add(code);
      accepted += 1;
      resolved.push({
        source: 'loinc',
        source_code: code,
        loinc_class: loincClass,
        category,
        display_name_en: displayNameEn,
        display_name_ar: null,
        short_name_en: shortName || null,
        specimen: extractSpecimen(displayNameEn),
        property,
        is_panel: /\bpanel\b/i.test(displayNameEn) || /\bpnl\b/i.test(shortName),
        is_active: true,
        is_custom: false,
        source_updated_at: null,
        last_synced_at: new Date().toISOString(),
      });
    }

    console.log(`Resolved ${accepted} unique rows for "${term}" (${category})`);
  }

  return resolved;
};

if (!Number.isFinite(targetCount) || targetCount <= 0) {
  console.error('The target row count must be a positive integer.');
  process.exit(1);
}

const seedRows = JSON.parse(await fs.readFile(seedPath, 'utf8'));

if (!Array.isArray(seedRows) || seedRows.length === 0) {
  console.error(`No lab test seed rows found in ${seedPath}`);
  process.exit(1);
}

const allResolvedRows = await resolveSeedRows(seedRows);
const resolvedRows = allResolvedRows.slice(0, targetCount);

if (resolvedRows.length < targetCount) {
  console.error(`Only resolved ${resolvedRows.length} unique lab test rows; expected at least ${targetCount}.`);
  process.exit(1);
}

if (dryRun) {
  const categoryCounts = resolvedRows.reduce((accumulator, row) => {
    accumulator[row.category] = (accumulator[row.category] ?? 0) + 1;
    return accumulator;
  }, {});

  console.log(JSON.stringify({
    count: resolvedRows.length,
    categoryCounts,
    sample: resolvedRows.slice(0, 10),
  }, null, 2));
  process.exit(0);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Run with --dry-run to inspect resolved rows without writing to Supabase.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from('lab_test_catalog').upsert(resolvedRows, {
  onConflict: 'source,source_code',
  ignoreDuplicates: false,
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Upserted ${resolvedRows.length} lab test catalog rows.`);
