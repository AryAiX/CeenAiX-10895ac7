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
const modeArg = args.find((arg) => arg.startsWith('--mode='));
const inputArg = args.find((arg) => arg.startsWith('--input='));
const mode = modeArg ? modeArg.slice('--mode='.length) : 'bulk-rxnorm';
const seedPath = inputArg
  ? path.resolve(root, inputArg.slice('--input='.length))
  : path.join(root, 'scripts', 'medication-catalog.seed.json');
const practicalTtys = ['IN', 'PIN', 'MIN', 'BN', 'SCD', 'SBD'];

const normalizeEnvValue = (value) => (typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : '');

const supabaseUrl = normalizeEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

const rxNormFetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`RxNorm request failed (${response.status}) for ${url}`);
  }

  return response.json();
};

const resolveRxNormBulkRows = async () => {
  const rows = [];

  for (const tty of practicalTtys) {
    const url = `https://rxnav.nlm.nih.gov/REST/allconcepts.json?tty=${encodeURIComponent(tty)}`;
    const data = await rxNormFetchJson(url);
    const concepts = data?.minConceptGroup?.minConcept ?? [];

    for (const concept of concepts) {
      const name = typeof concept?.name === 'string' ? concept.name.trim() : '';
      const sourceCode = typeof concept?.rxcui === 'string' ? concept.rxcui.trim() : '';

      if (!name || !sourceCode) {
        continue;
      }

      rows.push({
        source: 'rxnorm',
        source_code: sourceCode,
        generic_name_en: name,
        brand_name_en: tty === 'BN' || tty === 'SBD' ? name : null,
        display_name_ar: null,
        strength: null,
        dosage_form: null,
        manufacturer: null,
        rxnorm_tty: tty,
        ingredient_name_en: null,
        enrichment_status: 'pending',
        enrichment_error: null,
        last_enriched_at: null,
        is_active: true,
        is_custom: false,
        last_synced_at: new Date().toISOString(),
      });
    }

    console.log(`Fetched ${concepts.length} RxNorm concepts for ${tty}`);
  }

  return rows;
};

const resolveMedicationSeed = async (seedRow) => {
  const searchUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(seedRow.query)}&search=1`;
  const searchJson = await rxNormFetchJson(searchUrl);
  const rxcui = searchJson?.idGroup?.rxnormId?.[0];

  if (!rxcui) {
    throw new Error(`No RxNorm match found for "${seedRow.query}".`);
  }

  const propertiesUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(rxcui)}/properties.json`;
  const propertiesJson = await rxNormFetchJson(propertiesUrl);
  const properties = propertiesJson?.properties ?? {};

  return {
    source: 'rxnorm',
    source_code: String(rxcui),
    generic_name_en: seedRow.generic_name_en || properties.name || seedRow.query,
    brand_name_en: seedRow.brand_name_en || null,
    display_name_ar:
      typeof seedRow.display_name_ar === 'string' && seedRow.display_name_ar.trim().length > 0
        ? seedRow.display_name_ar.trim()
        : null,
    strength: seedRow.strength || null,
    dosage_form: seedRow.dosage_form || null,
    manufacturer: seedRow.manufacturer || null,
    rxnorm_tty: properties.tty || null,
    ingredient_name_en: seedRow.ingredient_name_en || null,
    enrichment_status: seedRow.strength || seedRow.dosage_form ? 'enriched' : 'pending',
    enrichment_error: null,
    last_enriched_at: seedRow.strength || seedRow.dosage_form ? new Date().toISOString() : null,
    is_active: true,
    is_custom: false,
    last_synced_at: new Date().toISOString(),
  };
};

let resolvedRows = [];

if (mode === 'bulk-rxnorm') {
  resolvedRows = await resolveRxNormBulkRows();
} else if (mode === 'seed') {
  const seedRows = JSON.parse(await fs.readFile(seedPath, 'utf8'));

  if (!Array.isArray(seedRows) || seedRows.length === 0) {
    console.error(`No medication seed rows found in ${seedPath}`);
    process.exit(1);
  }

  for (const seedRow of seedRows) {
    if (!seedRow || typeof seedRow.query !== 'string' || seedRow.query.trim().length === 0) {
      console.error('Each seed row must provide a non-empty "query".');
      process.exit(1);
    }

    const resolvedRow = await resolveMedicationSeed(seedRow);
    resolvedRows.push(resolvedRow);
    console.log(`Resolved ${seedRow.query} -> ${resolvedRow.source_code} (${resolvedRow.generic_name_en})`);
  }
} else {
  console.error(`Unsupported mode "${mode}". Use --mode=bulk-rxnorm or --mode=seed.`);
    process.exit(1);
  }

if (resolvedRows.length === 0) {
  console.error('No medication rows were resolved.');
  process.exit(1);
}

if (dryRun) {
  console.log(JSON.stringify(resolvedRows, null, 2));
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

const { error } = await supabase.from('medication_catalog').upsert(resolvedRows, {
  onConflict: 'source,source_code',
  ignoreDuplicates: false,
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Upserted ${resolvedRows.length} medication catalog rows.`);
