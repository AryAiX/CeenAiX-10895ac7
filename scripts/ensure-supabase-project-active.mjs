/**
 * Restore a paused Supabase project and wait until it is active.
 *
 * Env:
 *   SUPABASE_ACCESS_TOKEN
 *   SUPABASE_PROD_PROJECT_REF or SUPABASE_DEV_PROJECT_REF (or --project-ref)
 *   SUPABASE_PROJECT_RESTORE_TIMEOUT_SECONDS (optional, default 900)
 */

const API_BASE = 'https://api.supabase.com/v1';
const ACTIVE_STATUS = 'ACTIVE_HEALTHY';
const INACTIVE_STATUS = 'INACTIVE';
const DEFAULT_TIMEOUT_SECONDS = 900;
const POLL_INTERVAL_MS = 15_000;
const TRANSIENT_API_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504, 544]);

const projectRef =
  process.argv.find((arg, index) => process.argv[index - 1] === '--project-ref') ||
  process.env.SUPABASE_PROD_PROJECT_REF?.trim() ||
  process.env.SUPABASE_DEV_PROJECT_REF?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const timeoutSeconds = Number.parseInt(
  process.env.SUPABASE_PROJECT_RESTORE_TIMEOUT_SECONDS ?? String(DEFAULT_TIMEOUT_SECONDS),
  10,
);

if (!accessToken) {
  console.error('SUPABASE_ACCESS_TOKEN is required');
  process.exit(1);
}

if (!projectRef) {
  console.error('Set SUPABASE_PROD_PROJECT_REF / SUPABASE_DEV_PROJECT_REF or pass --project-ref');
  process.exit(1);
}

if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
  console.error('SUPABASE_PROJECT_RESTORE_TIMEOUT_SECONDS must be a positive integer');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientApiError = (error) => TRANSIENT_API_STATUSES.has(error.status);

const api = async (path, options = {}) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
      });

      const text = await response.text();
      let body;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      if (!response.ok) {
        const message =
          typeof body === 'string' ? body : JSON.stringify(body);
        const error = new Error(
          `Management API ${options.method ?? 'GET'} ${path} failed (${response.status}): ${message}`,
        );
        error.status = response.status;
        throw error;
      }

      return body;
    } catch (error) {
      if (attempt < 3 && isTransientApiError(error)) {
        const delayMs = attempt * 5000;
        console.warn(
          `Supabase project status request failed transiently ` +
            `(attempt ${attempt}/3); retrying in ${Math.round(delayMs / 1000)}s: ${error.message}`,
        );
        await sleep(delayMs);
        continue;
      }

      throw error;
    }
  }
};

const getProjectStatus = async () => {
  const project = await api(`/projects/${projectRef}`);
  return String(project?.status ?? 'UNKNOWN');
};

const restoreProject = async () => {
  console.log(`Supabase project ${projectRef} is inactive; requesting restore …`);
  await api(`/projects/${projectRef}/restore`, { method: 'POST' });
  console.log('Supabase project restore requested.');
};

const waitUntilActive = async () => {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let lastStatus = 'UNKNOWN';

  while (Date.now() < deadline) {
    lastStatus = await getProjectStatus();
    console.log(`Supabase project status: ${lastStatus}`);

    if (lastStatus === ACTIVE_STATUS) {
      return;
    }

    if (lastStatus === INACTIVE_STATUS) {
      await restoreProject();
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Supabase project ${projectRef} did not reach ${ACTIVE_STATUS} within ${timeoutSeconds}s ` +
      `(last status: ${lastStatus}). Open the Supabase dashboard and restore/inspect the project, then rerun Release.`,
  );
};

await waitUntilActive();
console.log(`Supabase project ${projectRef} is active.`);
