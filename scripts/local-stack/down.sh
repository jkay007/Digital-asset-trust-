#!/usr/bin/env bash
# Stops the local stack started by up.sh. Data is kept unless up.sh --reset is used.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STACK="${ROOT:?}/.local-stack"
RUN="${STACK:?}/run"
for name in gateway fn postgrest storage auth smtp; do
  pidfile="${RUN:?}/${name:?}.pid"
  if [[ -f "$pidfile" ]]; then
    kill "$(cat "$pidfile")" 2>/dev/null || true
    rm -f -- "${pidfile:?}"
  fi
done
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
if [[ -d "$STACK/pgdata" && -x "$PG_BIN/pg_ctl" ]]; then
  if [[ "$(id -u)" == "0" ]]; then
    runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$STACK/pgdata" -m fast stop >/dev/null 2>&1 || true
  else
    "$PG_BIN/pg_ctl" -D "$STACK/pgdata" -m fast stop >/dev/null 2>&1 || true
  fi
fi
echo "[stack] stopped"
