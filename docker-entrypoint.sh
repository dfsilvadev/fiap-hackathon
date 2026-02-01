#!/bin/sh
set -e

echo "[entrypoint] Iniciando..."

# Migrações e seed em produção
if [ "$NODE_ENV" = "production" ]; then
  if [ -x "node_modules/.bin/prisma" ] || command -v npx >/dev/null 2>&1; then
    echo "[entrypoint] Aplicando migrações..."
    npx prisma migrate deploy

    echo "[entrypoint] Executando seed (roles, categorias, usuário admin)..."
    npx prisma db seed || true
  else
    echo "[entrypoint] Prisma CLI não encontrado, pulando migrações e seed."
  fi
fi

echo "[entrypoint] Iniciando aplicação."
exec "$@"
