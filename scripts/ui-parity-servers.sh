#!/usr/bin/env bash
# scripts/ui-parity-servers.sh
#
# Boots the canonical CeenAiX dev server and a local design reference
# dev server side-by-side so we can take before / after screenshots
# for the UI parity pass (see docs/agent/ui-parity-plan.md,
# CHECKLIST.md #17).
#
# Usage:
#   ./scripts/ui-parity-servers.sh up     # start both servers
#   ./scripts/ui-parity-servers.sh down   # stop both servers
#   ./scripts/ui-parity-servers.sh status # show which is running
#
# Ports:
#   CANONICAL_PORT  default 5173  (our UX-4-6-3 app)
#   REFERENCE_PORT  default 5174  (local design reference; can also be
#                                  set via the legacy BOLT_PORT env var)
#
# Side effects:
#   .ui-parity/  local work dir for pid files and logs. Git-ignored.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REFERENCE_DIR="${ROOT}/.reference/CeenAiX-final-main-today/CeenAiX-final-main"
WORK_DIR="${ROOT}/.ui-parity"
CANONICAL_PORT="${CANONICAL_PORT:-5173}"
REFERENCE_PORT="${REFERENCE_PORT:-${BOLT_PORT:-5174}}"

mkdir -p "${WORK_DIR}"

reference_check() {
  if [ ! -f "${REFERENCE_DIR}/package.json" ]; then
    echo "Design reference snapshot not found at ${REFERENCE_DIR}"
    echo "Expected an unpacked reference app there (see docs/agent/ui-parity-plan.md)."
    exit 1
  fi
}

reference_install() {
  if [ ! -d "${REFERENCE_DIR}/node_modules" ]; then
    echo "Installing reference dependencies (one-time)..."
    (cd "${REFERENCE_DIR}" && npm install --silent --no-audit --no-fund)
  fi
}

wait_for() {
  local url="$1"
  local tries=60
  while [ "${tries}" -gt 0 ]; do
    if curl -sSf -o /dev/null "${url}"; then
      return 0
    fi
    sleep 1
    tries=$((tries - 1))
  done
  echo "Timed out waiting for ${url}"
  return 1
}

port_in_use() {
  local port="$1"
  curl -sSf -o /dev/null "http://127.0.0.1:${port}/" 2>/dev/null
}

start_canonical() {
  if [ -f "${WORK_DIR}/canonical.pid" ] && kill -0 "$(cat "${WORK_DIR}/canonical.pid")" 2>/dev/null; then
    echo "Canonical already running (pid $(cat "${WORK_DIR}/canonical.pid")) on :${CANONICAL_PORT}"
    return 0
  fi
  if port_in_use "${CANONICAL_PORT}"; then
    echo "Canonical already serving on :${CANONICAL_PORT} (not owned by this script; leaving it alone)."
    return 0
  fi
  echo "Starting canonical on :${CANONICAL_PORT}..."
  ( cd "${ROOT}" && nohup npm run dev -- --host 127.0.0.1 --port "${CANONICAL_PORT}" --strictPort \
      >"${WORK_DIR}/canonical.log" 2>&1 & echo $! >"${WORK_DIR}/canonical.pid" )
  wait_for "http://127.0.0.1:${CANONICAL_PORT}/"
}

start_reference() {
  reference_check
  reference_install
  if [ -f "${WORK_DIR}/reference.pid" ] && kill -0 "$(cat "${WORK_DIR}/reference.pid")" 2>/dev/null; then
    echo "Reference already running (pid $(cat "${WORK_DIR}/reference.pid")) on :${REFERENCE_PORT}"
    return 0
  fi
  if port_in_use "${REFERENCE_PORT}"; then
    echo "Port :${REFERENCE_PORT} already busy with something not started by this script."
    echo "Stop it or set REFERENCE_PORT=<unused-port> and re-run."
    return 1
  fi
  echo "Starting reference on :${REFERENCE_PORT}..."
  ( cd "${REFERENCE_DIR}" && nohup npm run dev -- --host 127.0.0.1 --port "${REFERENCE_PORT}" --strictPort \
      >"${WORK_DIR}/reference.log" 2>&1 & echo $! >"${WORK_DIR}/reference.pid" )
  wait_for "http://127.0.0.1:${REFERENCE_PORT}/"
}

stop_pid() {
  local name="$1"
  local pidfile="${WORK_DIR}/${name}.pid"
  if [ -f "${pidfile}" ]; then
    local pid
    pid="$(cat "${pidfile}")"
    if kill -0 "${pid}" 2>/dev/null; then
      echo "Stopping ${name} (pid ${pid})"
      kill "${pid}" 2>/dev/null || true
      sleep 1
      kill -9 "${pid}" 2>/dev/null || true
    fi
    rm -f "${pidfile}"
  fi
}

report_status() {
  local name="$1"
  local port="$2"
  local pidfile="${WORK_DIR}/${name}.pid"
  if [ -f "${pidfile}" ] && kill -0 "$(cat "${pidfile}")" 2>/dev/null; then
    echo "${name}: running (pid $(cat "${pidfile}"), managed, :${port})"
  elif port_in_use "${port}"; then
    local extpid
    extpid="$(lsof -nP -iTCP:${port} -sTCP:LISTEN -Fp 2>/dev/null | head -n1 | cut -c2-)"
    echo "${name}: running (pid ${extpid:-?}, external, :${port})"
  else
    echo "${name}: stopped"
  fi
}

case "${1:-up}" in
  up)
    start_canonical
    start_reference
    echo
    echo "Ready:"
    echo "  canonical  http://127.0.0.1:${CANONICAL_PORT}/"
    echo "  reference  http://127.0.0.1:${REFERENCE_PORT}/"
    echo "Logs in ${WORK_DIR}/*.log"
    ;;
  down)
    stop_pid canonical
    stop_pid reference
    # Legacy cleanup for any old "bolt" pid files left around.
    stop_pid bolt
    ;;
  status)
    report_status canonical "${CANONICAL_PORT}"
    report_status reference "${REFERENCE_PORT}"
    ;;
  *)
    echo "Usage: $0 {up|down|status}"
    exit 1
    ;;
esac
