# ============================================
# Stage 1: Composer dependencies
# ============================================
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .

RUN composer dump-autoload --optimize --no-dev

# ============================================
# Stage 2: FrankenPHP production
# ============================================
FROM dunglas/frankenphp:latest-php8.3-bookworm

# Cache de extensoes PHP (layer separado para aproveitar cache do Docker)
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    redis \
    gd \
    zip \
    bcmath \
    intl \
    opcache \
    pcntl

# Configs e scripts (layer separado - raramente muda)
COPY docker/php/php-prod.ini $PHP_INI_DIR/conf.d/99-prod.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY Caddyfile /etc/caddy/Caddyfile

RUN cp $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini \
    && chmod +x /usr/local/bin/entrypoint.sh

# Strip capabilities (copia limpa do binario)
RUN cp /usr/local/bin/frankenphp /tmp/frankenphp-clean \
    && rm /usr/local/bin/frankenphp \
    && mv /tmp/frankenphp-clean /usr/local/bin/frankenphp \
    && chmod +x /usr/local/bin/frankenphp

WORKDIR /app

# Vendor primeiro (aproveita cache se composer.json nao mudar)
COPY --from=vendor /app/vendor ./vendor

# Codigo da aplicacao (muda com frequencia, vai por ultimo)
COPY . .

# Estrutura de diretorios (executa uma unica vez)
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    /data/caddy \
    /config/caddy \
    && chmod -R 775 storage bootstrap/cache /data/caddy /config/caddy

ENV FRANKENPHP_CONFIG="worker ./public/index.php"
ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:${PORT:-8000}/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
