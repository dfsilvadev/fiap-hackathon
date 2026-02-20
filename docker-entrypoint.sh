#!/bin/sh
set -e

echo "[entrypoint] Starting..."

if [ "${RUN_DB_INIT:-true}" = "true" ]; then
  if [ -x "node_modules/.bin/prisma" ] || command -v npx >/dev/null 2>&1; then
    echo "[entrypoint] Applying migrations..."
    npx prisma migrate deploy

    echo "[entrypoint] Running seed (roles, categories, admin user)..."
    npx prisma db seed || true
  else
    echo "[entrypoint] Prisma CLI not found, skipping migrations and seed."
  fi
fi

echo "[entrypoint] Starting application."
exec "$@"
