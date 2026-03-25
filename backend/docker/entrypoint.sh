#!/bin/sh
set -e

# Porta injetada pelo Render (default 8000 para local)
export SERVER_NAME=":${PORT:-8000}"

# Extrai senha do REDIS_URL se disponivel (formato: redis://:senha@host:porta)
if [ -n "$REDIS_URL" ] && [ -z "$REDIS_PASSWORD" ]; then
    REDIS_PASSWORD=$(echo "$REDIS_URL" | sed -n 's|redis://:([^@]*)@.*|\1|p' 2>/dev/null || true)
    [ -n "$REDIS_PASSWORD" ] && export REDIS_PASSWORD
fi

# No plano free do Render (sem Redis), garante drivers via database
if [ -z "$REDIS_HOST" ]; then
    export CACHE_STORE="${CACHE_STORE:-database}"
    export SESSION_DRIVER="${SESSION_DRIVER:-database}"
    export QUEUE_CONNECTION="${QUEUE_CONNECTION:-database}"
fi

echo "==> Iniciando Gefther Backend na porta ${PORT:-8000}"
echo "==> Ambiente: ${APP_ENV:-production}"

# Aguarda o banco aceitar conexoes (util no Render com cold start do Postgres)
MAX=30
COUNT=0
until php artisan db:monitor --databases=pgsql --max=1 > /dev/null 2>&1 || [ $COUNT -ge $MAX ]; do
    echo "==> Aguardando banco de dados... ($((COUNT+1))/$MAX)"
    COUNT=$((COUNT+1))
    sleep 2
done

# Migrations
echo "==> Rodando migrations..."
php artisan migrate --force

# Otimizacoes de cache (config, route, view)
echo "==> Cacheando configuracoes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Iniciando FrankenPHP..."
exec frankenphp run --config /etc/caddy/Caddyfile
