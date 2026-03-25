#!/bin/sh
set -e

export SERVER_NAME=":${PORT:-8000}"

# Extrai senha do REDIS_URL se disponivel
if [ -n "$REDIS_URL" ] && [ -z "$REDIS_PASSWORD" ]; then
    REDIS_PASSWORD=$(echo "$REDIS_URL" | sed -n 's|redis://:([^@]*)@.*|\1|p' 2>/dev/null || true)
    [ -n "$REDIS_PASSWORD" ] && export REDIS_PASSWORD
fi

# Sem Redis: drivers via database
if [ -z "$REDIS_HOST" ]; then
    export CACHE_STORE="${CACHE_STORE:-database}"
    export SESSION_DRIVER="${SESSION_DRIVER:-database}"
    export QUEUE_CONNECTION="${QUEUE_CONNECTION:-database}"
fi

echo "==> Gefther Backend | porta ${PORT:-8000} | ${APP_ENV:-production}"

# Aguarda banco
MAX=30
COUNT=0
until php artisan db:monitor --databases=pgsql --max=1 > /dev/null 2>&1 || [ $COUNT -ge $MAX ]; do
    echo "==> Aguardando banco... ($((COUNT+1))/$MAX)"
    COUNT=$((COUNT+1))
    sleep 2
done

echo "==> Rodando migrations..."
php artisan migrate --force

# Cria admin se nao existir (seguro rodar multiplas vezes: updateOrCreate)
echo "==> Verificando usuario admin..."
php artisan db:seed --class=AdminSeeder --force 2>/dev/null || echo "==> AdminSeeder ignorado"

echo "==> Cacheando configuracoes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Iniciando FrankenPHP..."
exec /usr/local/bin/frankenphp run --config /etc/caddy/Caddyfile
