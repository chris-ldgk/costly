#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PRODUCTION_DB_PASSWORD:-}" ]]; then
  echo "PRODUCTION_DB_PASSWORD is required" >&2
  exit 1
fi

export PRODUCTION_DB_HOST="${PRODUCTION_DB_HOST:-100.69.229.78}"
export PRODUCTION_DB_PORT="${PRODUCTION_DB_PORT:-6001}"
export PRODUCTION_DB_NAME="${PRODUCTION_DB_NAME:-costly-api}"
export PRODUCTION_DB_USER="${PRODUCTION_DB_USER:-postgres}"
export PRODUCTION_DB_SSLMODE="${PRODUCTION_DB_SSLMODE:-require}"

export DATABASE_URL
DATABASE_URL="$(
  bun -e "
    const url = new URL('postgres://localhost');
    url.username = process.env.PRODUCTION_DB_USER ?? 'postgres';
    url.password = process.env.PRODUCTION_DB_PASSWORD ?? '';
    url.hostname = process.env.PRODUCTION_DB_HOST ?? '100.69.229.78';
    url.port = process.env.PRODUCTION_DB_PORT ?? '6001';
    url.pathname = '/' + (process.env.PRODUCTION_DB_NAME ?? 'costly-api');
    url.searchParams.set('sslmode', process.env.PRODUCTION_DB_SSLMODE ?? 'require');
    console.log(url.toString());
  "
)"

echo "Running migrations against ${PRODUCTION_DB_HOST}:${PRODUCTION_DB_PORT}/${PRODUCTION_DB_NAME} (sslmode=${PRODUCTION_DB_SSLMODE})"

cd "$(dirname "$0")/.."
exec bun run db:migrate
