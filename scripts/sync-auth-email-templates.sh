#!/usr/bin/env bash
# Sync CeenAiX branded Supabase Auth email templates to a hosted project via the Management API.
#
# Required env:
#   SUPABASE_ACCESS_TOKEN  Personal access token from https://supabase.com/dashboard/account/tokens
#
# Usage:
#   ./scripts/sync-auth-email-templates.sh <project-ref> [--site-url https://www.ceenaix.com]
#
# Examples:
#   ./scripts/sync-auth-email-templates.sh lgfaucsfiyxvmsghnpey --site-url http://localhost:5173
#   ./scripts/sync-auth-email-templates.sh ziykaxyadcdmyakzvjff --site-url https://www.ceenaix.com
#
# Notes:
# - Custom SMTP (Resend) only changes the sender address. Email body HTML comes from these templates.
# - Apply to every Supabase project (dev-db AND ceenaix-prod) so signup looks the same everywhere.
# - Disable link tracking on your SMTP provider for auth emails (can break confirmation links).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES_DIR="${ROOT_DIR}/supabase/templates"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN is not set" >&2
  exit 1
fi

PROJECT_REF="${1:-}"
if [[ -z "${PROJECT_REF}" ]]; then
  echo "Usage: $0 <project-ref> [--site-url URL]" >&2
  exit 1
fi
shift || true

SITE_URL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --site-url)
      SITE_URL="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

read_template() {
  local file="${TEMPLATES_DIR}/$1"
  if [[ ! -f "${file}" ]]; then
    echo "Missing template file: ${file}" >&2
    exit 1
  fi
  jq -Rs '.' < "${file}"
}

CONFIRMATION_CONTENT="$(read_template confirmation.html)"
RECOVERY_CONTENT="$(read_template recovery.html)"
MAGIC_LINK_CONTENT="$(read_template magic_link.html)"

PAYLOAD="$(jq -n \
  --arg site_url "${SITE_URL}" \
  --argjson confirmation_content "${CONFIRMATION_CONTENT}" \
  --argjson recovery_content "${RECOVERY_CONTENT}" \
  --argjson magic_link_content "${MAGIC_LINK_CONTENT}" \
  '{
    mailer_subjects_confirmation: "Confirm your CeenAiX account",
    mailer_subjects_recovery: "Reset your CeenAiX password",
    mailer_subjects_magic_link: "Your CeenAiX sign-in link",
    mailer_templates_confirmation_content: $confirmation_content,
    mailer_templates_recovery_content: $recovery_content,
    mailer_templates_magic_link_content: $magic_link_content
  }
  | if $site_url != "" then . + { site_url: $site_url } else . end')"

echo "Updating auth email templates for project ${PROJECT_REF}..."
if [[ -n "${SITE_URL}" ]]; then
  echo "  site_url -> ${SITE_URL}"
fi

HTTP_CODE="$(
  curl -sS -o /tmp/supabase-auth-config-response.json -w '%{http_code}' \
    -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "${PAYLOAD}"
)"

if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "Management API returned HTTP ${HTTP_CODE}" >&2
  cat /tmp/supabase-auth-config-response.json >&2
  exit 1
fi

echo "Done. Send a test signup from the app to verify branding on project ${PROJECT_REF}."
