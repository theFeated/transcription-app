# -------------------------------------------------------------------
# Frontend Dockerfile (Node build + PHP/Apache production)
# -------------------------------------------------------------------

# 1) Declare ARGs for base images
ARG NODE_IMAGE=node:18-bullseye-slim
ARG PHP_IMAGE=php:8.2-apache-bullseye

################################################################################
# Stage 1: Build React/Vite assets using Node
################################################################################
FROM ${NODE_IMAGE} AS node_builder

WORKDIR /app

# Install JS deps (including devDeps for build)
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

################################################################################
# Stage 2: Laravel + Apache (production)
################################################################################
FROM ${PHP_IMAGE}

# Install PHP extensions
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libzip-dev libpng-dev libonig-dev libxml2-dev \
 && docker-php-ext-install pdo pdo_mysql zip gd mbstring exif pcntl bcmath \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Configure Apache doc root & modules
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && a2enmod rewrite headers

# Copy built frontend + Laravel code
COPY --from=node_builder /app /var/www/html

# Fix permissions
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html/storage

# Run as non-root
USER www-data

EXPOSE 80
