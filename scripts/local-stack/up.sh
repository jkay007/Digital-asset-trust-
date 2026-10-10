#!/usr/bin/env bash
# Docker-free local Supabase-compatible stack for development and CI.
#
#   bash scripts/local-stack/up.sh            # start (keeps existing data)
#   bash scripts/local-stack/up.sh --reset    # wipe local data, re-run migrations + seed
#
# Components (downloaded on first run into .local-stack/):
#   PostgreSQL (system binaries) :54322   Supabase Auth (GoTrue) :9999
#   PostgREST :3000                       Storage API (file backend) :5000
#   Deno edge function :8000              SMTP sink :2500
#   Gateway (single API origin) :54321    -> VITE_SUPABASE_URL
#
# If Docker is available, `npx supabase start` is the officially supported
# alternative and applies the same migrations and seed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STACK="${ROOT:?}/.local-stack"
BIN="$STACK/bin"
LOG="$STACK/logs"
RUN="$STACK/run"
PGDATA="$STACK/pgdata"
PG_PORT="${PG_PORT:-54322}"
JWT_SECRET="${JWT_SECRET:-local-only-jwt-secret-do-not-use-in-production-0123456789}"
POSTGREST_VERSION="${POSTGREST_VERSION:-v12.2.3}"
AUTH_VERSION="${AUTH_VERSION:-v2.180.0}"
DENO_VERSION="${DENO_VERSION:-v2.1.4}"
STORAGE_VERSION="${STORAGE_VERSION:-v1.81.0}"
RESET=0
[[ "${1:-}" == "--reset" ]] && RESET=1

mkdir -p "$BIN" "$LOG" "$RUN"
log() { printf '\033[1;33m[stack]\033[0m %s\n' "$*"; }

as_pg() {
  if [[ "$(id -u)" == "0" ]]; then runuser -u postgres -- "$@"; else "$@"; fi
}

wait_for() { # url name
  for _ in $(seq 1 90); do
    if curl -fsS -o /dev/null "$1" 2>/dev/null; then return 0; fi
    sleep 1
  done
  log "Timed out waiting for $2 ($1). See $LOG/"
  exit 1
}

# --- Binaries -------------------------------------------------------------------
fetch() { curl -fsSL --retry 3 -o "$2" "$1"; }
if [[ ! -x "$BIN/postgrest" ]]; then
  log "Downloading PostgREST $POSTGREST_VERSION"
  fetch "https://github.com/PostgREST/postgrest/releases/download/$POSTGREST_VERSION/postgrest-$POSTGREST_VERSION-linux-static-x64.tar.xz" "$STACK/postgrest.tar.xz"
  tar -xJf "$STACK/postgrest.tar.xz" -C "$BIN"
  rm -f -- "${STACK:?}/postgrest.tar.xz"
fi
if [[ ! -x "$BIN/auth" ]]; then
  log "Downloading Supabase Auth (GoTrue) $AUTH_VERSION"
  fetch "https://github.com/supabase/auth/releases/download/$AUTH_VERSION/auth-$AUTH_VERSION-x86.tar.gz" "$STACK/auth.tgz"
  mkdir -p "$STACK/auth-dist"
  tar -xzf "$STACK/auth.tgz" -C "$STACK/auth-dist"
  rm -f -- "${STACK:?}/auth.tgz"
  cp "$STACK/auth-dist/auth" "$BIN/auth"
fi
if [[ ! -x "$BIN/deno" ]]; then
  log "Downloading Deno $DENO_VERSION"
  fetch "https://github.com/denoland/deno/releases/download/$DENO_VERSION/deno-x86_64-unknown-linux-gnu.zip" "$STACK/deno.zip"
  python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$STACK/deno.zip" "$BIN"
  chmod +x "$BIN/deno"
  rm -f -- "${STACK:?}/deno.zip"
fi
if [[ ! -f "$STACK/storage-api/dist/start/server.js" ]]; then
  log "Building Supabase Storage API $STORAGE_VERSION (one-off, a few minutes)"
  if [[ -d "$STACK/storage-api" ]]; then rm -rf -- "${STACK:?}/storage-api"; fi
  git clone --quiet --depth 1 --branch "$STORAGE_VERSION" https://github.com/supabase/storage "$STACK/storage-api"
  (cd "$STACK/storage-api" && npm ci --no-audit --no-fund --engine-strict=false >"$LOG/storage-build.log" 2>&1 && npm run build >>"$LOG/storage-build.log" 2>&1)
fi

# --- Keys -----------------------------------------------------------------------
eval "$(node "$ROOT/scripts/local-stack/jwt.mjs" "$JWT_SECRET")"
API_URL="http://127.0.0.1:54321"

# --- PostgreSQL -----------------------------------------------------------------
bash "$ROOT/scripts/local-stack/down.sh" >/dev/null 2>&1 || true
if [[ "$RESET" == "1" ]]; then
  log "Resetting local data"
  for d in pgdata storage-data mail; do
    if [[ -d "$STACK/$d" ]]; then rm -rf -- "${STACK:?}/${d:?}"; fi
  done
fi
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[[ -x "$PG_BIN/initdb" ]] || { log "PostgreSQL server binaries not found; set PG_BIN"; exit 1; }
FRESH=0
if [[ ! -d "$PGDATA" ]]; then
  FRESH=1
  mkdir -p "$PGDATA"
  if [[ "$(id -u)" == "0" ]]; then chown -R postgres "$PGDATA" "$RUN"; fi
  as_pg "$PG_BIN/initdb" -D "$PGDATA" -U postgres --auth=trust -E UTF8 --locale=C.UTF-8 >/dev/null
fi
touch "$LOG/postgres.log"
if [[ "$(id -u)" == "0" ]]; then chown postgres "$LOG/postgres.log" "$RUN"; fi
log "Starting PostgreSQL on :$PG_PORT"
as_pg "$PG_BIN/pg_ctl" -D "$PGDATA" -l "$LOG/postgres.log" -w \
  -o "-p $PG_PORT -k $RUN -c listen_addresses=127.0.0.1 -c log_min_messages=warning" start >/dev/null
DB_URL="postgresql://postgres@127.0.0.1:$PG_PORT/postgres"
PSQL=(psql "$DB_URL" -v ON_ERROR_STOP=1 -q -X)

if [[ "$FRESH" == "1" ]]; then
  log "Bootstrapping Supabase roles and schemas"
  "${PSQL[@]}" -f "$ROOT/scripts/local-stack/bootstrap.sql" >/dev/null
fi

# --- Auth -----------------------------------------------------------------------
export GOTRUE_DB_DRIVER=postgres
export DATABASE_URL="postgres://supabase_auth_admin:local-auth-admin@127.0.0.1:$PG_PORT/postgres"
export GOTRUE_DB_MIGRATIONS_PATH="$STACK/auth-dist/migrations"
export GOTRUE_SITE_URL="${SITE_URL:-http://localhost:5173}"
export GOTRUE_URI_ALLOW_LIST="http://localhost:5173/**,http://localhost:4173/**,http://127.0.0.1:5173/**,http://127.0.0.1:4173/**"
export API_EXTERNAL_URL="$API_URL/auth/v1"
export GOTRUE_API_HOST=127.0.0.1 PORT=9999
export GOTRUE_JWT_SECRET="$JWT_SECRET" GOTRUE_JWT_EXP=3600 GOTRUE_JWT_AUD=authenticated
export GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated GOTRUE_JWT_ADMIN_ROLES=service_role
export GOTRUE_EXTERNAL_EMAIL_ENABLED=true GOTRUE_MAILER_AUTOCONFIRM="${MAILER_AUTOCONFIRM:-true}"
export GOTRUE_PASSWORD_MIN_LENGTH=10
export GOTRUE_SMTP_HOST=127.0.0.1 GOTRUE_SMTP_PORT=2500 GOTRUE_SMTP_ADMIN_EMAIL=no-reply@localhost
export GOTRUE_SMTP_SENDER_NAME="Global Financial Assets (local)"
export GOTRUE_RATE_LIMIT_EMAIL_SENT=1000 GOTRUE_RATE_LIMIT_VERIFY=1000 GOTRUE_RATE_LIMIT_TOKEN_REFRESH=1000
export GOTRUE_RATE_LIMIT_SIGN_IN_SIGN_UPS=1000 GOTRUE_LOG_LEVEL=warn
log "Starting SMTP sink"
MAIL_DIR="$STACK/mail" nohup node "$ROOT/scripts/local-stack/smtp-sink.mjs" >"$LOG/smtp.log" 2>&1 &
echo $! >"$RUN/smtp.pid"
log "Migrating and starting Auth"
"$BIN/auth" migrate >"$LOG/auth-migrate.log" 2>&1
nohup "$BIN/auth" serve >"$LOG/auth.log" 2>&1 &
echo $! >"$RUN/auth.pid"
wait_for "http://127.0.0.1:9999/health" "auth"

# --- Storage --------------------------------------------------------------------
log "Starting Storage API (runs its own migrations)"
mkdir -p "$STACK/storage-data"
(
  cd "$STACK/storage-api"
  env -i PATH="$PATH" HOME="$HOME" NODE_ENV=production \
    SERVER_HOST=127.0.0.1 SERVER_PORT=5000 SERVER_ADMIN_PORT=5001 SERVER_REGION=local \
    AUTH_JWT_SECRET="$JWT_SECRET" AUTH_JWT_ALGORITHM=HS256 ANON_KEY="$ANON_KEY" SERVICE_KEY="$SERVICE_ROLE_KEY" \
    DATABASE_URL="postgres://supabase_storage_admin:local-storage-admin@127.0.0.1:$PG_PORT/postgres" \
    DB_INSTALL_ROLES=false DB_ANON_ROLE=anon DB_SERVICE_ROLE=service_role DB_AUTHENTICATED_ROLE=authenticated \
    DB_SUPER_USER=postgres DB_ALLOW_MIGRATION_REFRESH=true \
    STORAGE_BACKEND=file STORAGE_FILE_BACKEND_PATH="$STACK/storage-data" STORAGE_FILE_ETAG_ALGORITHM=md5 \
    TENANT_ID=local REGION=local GLOBAL_S3_BUCKET=local UPLOAD_FILE_SIZE_LIMIT=26214400 \
    UPLOAD_FILE_SIZE_LIMIT_STANDARD=26214400 IMAGE_TRANSFORMATION_ENABLED=false PG_QUEUE_ENABLE=false \
    OTEL_METRICS_ENABLED=false PROMETHEUS_METRICS_ENABLED=false LOGFLARE_ENABLED=false LOG_LEVEL=warn \
    nohup node dist/start/server.js >"$LOG/storage.log" 2>&1 &
  echo $! >"$RUN/storage.pid"
)
wait_for "http://127.0.0.1:5000/status" "storage"

# --- Project migrations and seed --------------------------------------------------
if [[ "$FRESH" == "1" ]]; then
  for f in "$ROOT"/supabase/migrations/*.sql; do
    log "Applying $(basename "$f")"
    "${PSQL[@]}" -f "$f" >/dev/null
  done
  if [[ "${SKIP_SEED:-0}" != "1" ]]; then
    log "Loading DEMO seed data"
    "${PSQL[@]}" -f "$ROOT/supabase/seed.sql" >/dev/null
  fi
fi

# --- PostgREST --------------------------------------------------------------------
log "Starting PostgREST"
PGRST_DB_URI="postgres://authenticator:local-authenticator@127.0.0.1:$PG_PORT/postgres" \
PGRST_DB_SCHEMAS=public PGRST_DB_ANON_ROLE=anon PGRST_JWT_SECRET="$JWT_SECRET" \
PGRST_DB_EXTRA_SEARCH_PATH=public,extensions PGRST_SERVER_HOST=127.0.0.1 PGRST_SERVER_PORT=3000 \
PGRST_DB_MAX_ROWS=200 PGRST_LOG_LEVEL=warn \
  nohup "$BIN/postgrest" >"$LOG/postgrest.log" 2>&1 &
echo $! >"$RUN/postgrest.pid"
wait_for "http://127.0.0.1:3000/" "postgrest"

# --- Edge function ------------------------------------------------------------------
log "Starting edge function document-access"
SUPABASE_URL="$API_URL" SUPABASE_ANON_KEY="$ANON_KEY" SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
ALLOWED_ORIGINS='*' DENO_DIR="$STACK/deno-cache" \
  nohup "$BIN/deno" run --quiet --allow-net --allow-env --allow-read \
  "$ROOT/supabase/functions/document-access/index.ts" >"$LOG/fn-document-access.log" 2>&1 &
echo $! >"$RUN/fn.pid"

# --- Gateway ------------------------------------------------------------------------
log "Starting API gateway on :54321"
nohup node "$ROOT/scripts/local-stack/gateway.mjs" >"$LOG/gateway.log" 2>&1 &
echo $! >"$RUN/gateway.pid"
wait_for "http://127.0.0.1:54321/auth/v1/health" "gateway"
for _ in $(seq 1 90); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "http://127.0.0.1:8000" || true)
  [[ "$code" != "000" ]] && break
  sleep 1
done

cat >"$ROOT/.env.localstack" <<ENV
# Generated by scripts/local-stack/up.sh. Local development only.
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_SITE_URL=http://localhost:5173
ENV
cat >"$STACK/keys.env" <<ENV
API_URL=$API_URL
DB_URL=$DB_URL
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
JWT_SECRET=$JWT_SECRET
MAIL_DIR=$STACK/mail
ENV

log "Ready. API: $API_URL  DB: $DB_URL"
log "Run the app against it with: npm run dev:local"
