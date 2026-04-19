#!/usr/bin/env node
// scripts/ui-parity-capture.mjs
//
// Screenshot capture for the UI parity pass.
// See docs/agent/ui-parity-plan.md and CHECKLIST.md section 17.
//
// Captures screenshots of every route in scripts/ui-parity-routes.json,
// at multiple viewports, from both the canonical dev server (default 5173)
// and the local design reference dev server (default 5174). Writes PNGs into:
//
//   docs/ui-parity/<route-id>/<viewport>/
//     before.png     (canonical, captured with --phase=before)
//     reference.png  (local design reference render, eyeball aid only)
//     after.png      (canonical, captured with --phase=after, after porting)
//
// Usage (from repo root):
//   # Ensure both dev servers are up:
//   ./scripts/ui-parity-servers.sh up
//
//   # First capture, before we port any styling:
//   node scripts/ui-parity-capture.mjs --phase=before
//
//   # Port styling, then re-capture:
//   node scripts/ui-parity-capture.mjs --phase=after
//
//   # Scope to a single route while iterating:
//   node scripts/ui-parity-capture.mjs --phase=after --route=patient-dashboard
//
//   # Recapture only the reference snapshot after updating it:
//   node scripts/ui-parity-capture.mjs --phase=reference-only
//
// Authenticated portal capture:
//   For /patient/* and /doctor/* routes, set these env vars before running
//   to sign the browser in with a real Supabase session; without them the
//   capture renders the /auth/login redirect (still valid for auth-page
//   parity).
//
//     VITE_SUPABASE_URL          # read from .env.local if not set
//     VITE_SUPABASE_ANON_KEY     # read from .env.local if not set
//     UI_PARITY_PATIENT_EMAIL    # optional; enables /patient/* capture
//     UI_PARITY_PATIENT_PASSWORD
//     UI_PARITY_DOCTOR_EMAIL     # optional; enables /doctor/* capture
//     UI_PARITY_DOCTOR_PASSWORD
//
// Requirements:
//   - Playwright is lazy-installed into .ui-parity/playwright-cache (git-ignored).
//   - Both dev servers must respond to the URL paths listed in ui-parity-routes.json.
//
// Intentional choices:
//   - Full-page screenshots so we see scrollable content, with stubborn lazy
//     content given 600ms to settle after networkidle.
//   - Auth-only canonical routes still render the shell of their layout. If a
//     route redirects to /auth/login and no auth env vars are set, we still
//     capture the result so we can compare the auth-page treatment.
//   - We never touch the canonical backend; capture is fully local.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUT_ROOT = join(ROOT, 'docs', 'ui-parity');
const ROUTES_FILE = join(__dirname, 'ui-parity-routes.json');

function loadDotEnvLocal() {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return {};
  const out = {};
  const lines = readFileSync(path, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function parseArgs(argv) {
  const args = {
    phase: 'before',
    route: null,
    viewport: null,
    canonicalOrigin: 'http://127.0.0.1:5173',
    referenceOrigin: 'http://127.0.0.1:5174',
  };
  for (const arg of argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k === 'phase') args.phase = v;
    else if (k === 'route') args.route = v;
    else if (k === 'viewport') args.viewport = v;
    else if (k === 'canonical-origin') args.canonicalOrigin = v;
    else if (k === 'reference-origin' || k === 'bolt-origin') args.referenceOrigin = v;
    else if (k === 'help' || k === 'h') args.help = true;
  }
  // Back-compat: --phase=bolt-only is accepted but canonicalized.
  if (args.phase === 'bolt-only') args.phase = 'reference-only';
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/ui-parity-capture.mjs [--phase=before|after|reference-only] [--route=<id>] [--viewport=desktop|tablet|mobile]

Phases:
  before           capture canonical as before.png and reference as reference.png
  after            capture canonical as after.png (no reference recapture)
  reference-only   capture only the design reference (useful after updating it)

Run './scripts/ui-parity-servers.sh up' first. See docs/agent/ui-parity-plan.md.`);
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

function relTime() {
  return new Date().toISOString();
}

async function ensurePlaywright() {
  const localDir = join(ROOT, '.ui-parity', 'playwright-cache');
  await ensureDir(localDir);
  const marker = join(localDir, 'installed');
  if (!existsSync(marker)) {
    console.log('Installing playwright + chromium once into .ui-parity/playwright-cache ...');
    await new Promise((res, rej) => {
      const child = spawn('npm', ['--prefix', localDir, 'install', 'playwright@^1', '--no-audit', '--no-fund', '--silent'], { stdio: 'inherit' });
      child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`npm install playwright exited ${code}`))));
    });
    await new Promise((res, rej) => {
      const child = spawn('npx', ['--prefix', localDir, '--yes', 'playwright', 'install', 'chromium'], { stdio: 'inherit' });
      child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`playwright install chromium exited ${code}`))));
    });
    await writeFile(marker, relTime(), 'utf8');
  }
  const pkgJsonPath = join(localDir, 'node_modules', 'playwright', 'package.json');
  if (!existsSync(pkgJsonPath)) {
    throw new Error(`playwright not present at ${pkgJsonPath} after install`);
  }
  const entry = join(localDir, 'node_modules', 'playwright', 'index.mjs');
  const fallback = join(localDir, 'node_modules', 'playwright', 'index.js');
  const modulePath = existsSync(entry) ? entry : fallback;
  return await import(modulePath);
}

async function reachable(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

// Bypass the canonical app's sessionStorage-based preview PIN gate so that
// screenshots show actual pages instead of the "Preview access" overlay. This
// is purely a capture-time concession: it never touches the gate's runtime
// behavior and has no effect on the reference render.
const PREVIEW_ACCESS_BYPASS_SCRIPT = `
try {
  sessionStorage.setItem('ceenaix_preview_access_v1', '1');
  window.dispatchEvent(new Event('ceenaix-preview-access-changed'));
} catch (_) { /* private mode: ignored */ }
`;

async function signInWithSupabase({ supabaseUrl, anonKey, email, password }) {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase sign-in failed for ${email}: ${res.status} ${body}`);
  }
  return await res.json();
}

function projectRef(supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.split('.')[0];
  } catch {
    return 'unknown';
  }
}

function supabaseLocalStorageKey(supabaseUrl) {
  return `sb-${projectRef(supabaseUrl)}-auth-token`;
}

function buildAuthBootstrap({ supabaseUrl, anonKey, sessionJson }) {
  const storageKey = supabaseLocalStorageKey(supabaseUrl);
  const payload = JSON.stringify({
    access_token: sessionJson.access_token,
    refresh_token: sessionJson.refresh_token,
    expires_in: sessionJson.expires_in,
    expires_at: sessionJson.expires_at,
    token_type: sessionJson.token_type ?? 'bearer',
    user: sessionJson.user,
  });
  return `
try {
  sessionStorage.setItem('ceenaix_preview_access_v1', '1');
  window.dispatchEvent(new Event('ceenaix-preview-access-changed'));
  localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(payload)});
} catch (_) {}
`;
}

async function capture(browser, url, outFile, width, height, initScript) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });
  if (initScript) {
    await context.addInitScript(initScript);
  }
  const page = await context.newPage();
  page.on('pageerror', (err) => console.warn(`  pageerror @ ${url}: ${err.message}`));
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch (e) {
    console.warn(`  nav slow @ ${url}: ${e.message}`);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: outFile, fullPage: true });
  await context.close();
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();

  const routesDoc = JSON.parse(await readFile(ROUTES_FILE, 'utf8'));
  const viewports = routesDoc.viewports.filter((v) => !args.viewport || v.name === args.viewport);
  const routes = routesDoc.routes.filter((r) => !args.route || r.id === args.route);

  if (routes.length === 0) {
    console.error(`No routes matched --route=${args.route}.`);
    process.exit(1);
  }

  const canonicalUp = await reachable(args.canonicalOrigin);
  const referenceUp = await reachable(args.referenceOrigin);

  if (args.phase !== 'reference-only' && !canonicalUp) {
    console.error(`Canonical server not reachable at ${args.canonicalOrigin}. Run './scripts/ui-parity-servers.sh up' first.`);
    process.exit(2);
  }
  if ((args.phase === 'before' || args.phase === 'reference-only') && !referenceUp) {
    console.error(`Reference server not reachable at ${args.referenceOrigin}. Run './scripts/ui-parity-servers.sh up' first.`);
    process.exit(2);
  }

  const envLocal = loadDotEnvLocal();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || envLocal.VITE_SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || envLocal.VITE_SUPABASE_ANON_KEY || '';

  const patientCreds = {
    email: process.env.UI_PARITY_PATIENT_EMAIL,
    password: process.env.UI_PARITY_PATIENT_PASSWORD,
  };
  const doctorCreds = {
    email: process.env.UI_PARITY_DOCTOR_EMAIL,
    password: process.env.UI_PARITY_DOCTOR_PASSWORD,
  };

  let patientInitScript = null;
  let doctorInitScript = null;

  if (supabaseUrl && anonKey && patientCreds.email && patientCreds.password) {
    try {
      const session = await signInWithSupabase({ supabaseUrl, anonKey, email: patientCreds.email, password: patientCreds.password });
      patientInitScript = buildAuthBootstrap({ supabaseUrl, anonKey, sessionJson: session });
      console.log(`[auth]   patient session acquired for ${patientCreds.email}`);
    } catch (e) {
      console.warn(`[auth]   patient sign-in failed, falling back to unauthenticated capture: ${e.message}`);
    }
  }
  if (supabaseUrl && anonKey && doctorCreds.email && doctorCreds.password) {
    try {
      const session = await signInWithSupabase({ supabaseUrl, anonKey, email: doctorCreds.email, password: doctorCreds.password });
      doctorInitScript = buildAuthBootstrap({ supabaseUrl, anonKey, sessionJson: session });
      console.log(`[auth]   doctor session acquired for ${doctorCreds.email}`);
    } catch (e) {
      console.warn(`[auth]   doctor sign-in failed, falling back to unauthenticated capture: ${e.message}`);
    }
  }

  const canonicalInitScriptFor = (routePath) => {
    if (routePath.startsWith('/patient') && patientInitScript) return patientInitScript;
    if (routePath.startsWith('/doctor') && doctorInitScript) return doctorInitScript;
    return PREVIEW_ACCESS_BYPASS_SCRIPT;
  };

  const { chromium } = await ensurePlaywright();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const route of routes) {
      const referencePath = route.reference ?? route.bolt ?? null;
      for (const vp of viewports) {
        const routeDir = join(OUT_ROOT, route.id, vp.name);
        await ensureDir(routeDir);

        if (args.phase === 'before') {
          const beforeOut = join(routeDir, 'before.png');
          const canonicalUrl = args.canonicalOrigin + route.canonical;
          console.log(`[before]    ${route.id} ${vp.name} <- ${canonicalUrl}`);
          await capture(browser, canonicalUrl, beforeOut, vp.width, vp.height, canonicalInitScriptFor(route.canonical));

          if (referencePath) {
            const referenceOut = join(routeDir, 'reference.png');
            const referenceUrl = args.referenceOrigin + referencePath;
            console.log(`[reference] ${route.id} ${vp.name} <- ${referenceUrl}`);
            await capture(browser, referenceUrl, referenceOut, vp.width, vp.height, null);
          } else {
            console.log(`[reference] ${route.id} ${vp.name} <- (no reference counterpart, skipping)`);
          }
        } else if (args.phase === 'reference-only') {
          if (!referencePath) continue;
          const referenceOut = join(routeDir, 'reference.png');
          const referenceUrl = args.referenceOrigin + referencePath;
          console.log(`[reference] ${route.id} ${vp.name} <- ${referenceUrl}`);
          await capture(browser, referenceUrl, referenceOut, vp.width, vp.height, null);
        } else if (args.phase === 'after') {
          const afterOut = join(routeDir, 'after.png');
          const canonicalUrl = args.canonicalOrigin + route.canonical;
          console.log(`[after]     ${route.id} ${vp.name} <- ${canonicalUrl}`);
          await capture(browser, canonicalUrl, afterOut, vp.width, vp.height, canonicalInitScriptFor(route.canonical));
        } else {
          console.error(`Unknown --phase=${args.phase}. Use before | after | reference-only.`);
          process.exit(1);
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. Artifacts in ${OUT_ROOT}/<route-id>/<viewport>/*.png`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
