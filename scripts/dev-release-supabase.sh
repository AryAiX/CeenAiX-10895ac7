#!/usr/bin/env bash
# Dev Supabase sync: schema, edge functions, auth platform (keeps demo seed data).
#
# Required env:
#   SUPABASE_ACCESS_TOKEN
#   SUPABASE_DEV_PROJECT_REF  (default lgfaucsfiyxvmsghnpey)
#   SUPABASE_DEV_DB_PASSWORD
#
# Optional: SUPABASE_RESEND_SMTP_PASSWORD

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_REF="${SUPABASE_DEV_PROJECT_REF:-lgfaucsfiyxvmsghnpey}"

require_env() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing required env: $1" >&2
    exit 1
  fi
}

require_env SUPABASE_ACCESS_TOKEN
require_env SUPABASE_DEV_DB_PASSWORD

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found" >&2
  exit 1
fi

echo "=== [1/3] Apply database migrations to dev (${PROJECT_REF}) ==="
cd "${ROOT_DIR}"
supabase link --project-ref "${PROJECT_REF}" --password "${SUPABASE_DEV_DB_PASSWORD}"
echo 'Y' | supabase db push --linked --include-all --password "${SUPABASE_DEV_DB_PASSWORD}"

echo "=== [2/3] Deploy edge functions to dev ==="
export SUPABASE_DEV_PROJECT_REF="${PROJECT_REF}"
node "${ROOT_DIR}/scripts/deploy-edge-functions.mjs"

echo "=== [3/3] Sync dev auth platform ==="
"${ROOT_DIR}/scripts/sync-dev-auth-platform.sh" "${PROJECT_REF}"

echo "Dev Supabase release complete for ${PROJECT_REF}."
