# ===== EVENTCONNECT v4.0.0 - DOCKERFILE PRINCIPAL =====
# Multi-stage build para optimizar el tamaño de la imagen

# ===== ETAPA 1: BASE IMAGE =====
FROM node:18-alpine AS base

# Configurar variables de entorno
ENV NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=false
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY lerna.json ./
COPY .npmrc ./

# ===== ETAPA 2: INSTALACIÓN DE DEPENDENCIAS =====
FROM base AS deps

# Instalar dependencias de todos los paquetes
RUN npm ci --only=production --ignore-scripts

# ===== ETAPA 3: BUILD DEL BACKEND =====
FROM base AS backend-builder

# Copiar código del backend
COPY backend/ ./backend/

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm ci --only=production --ignore-scripts

# Build del backend (si es necesario)
RUN npm run build || echo "No build script found"

# ===== ETAPA 4: BUILD DEL FRONTEND =====
FROM base AS frontend-builder

# Copiar código del frontend
COPY web/ ./web/

# Instalar dependencias del frontend
WORKDIR /app/web
RUN npm ci --only=production --ignore-scripts

# Build del frontend
RUN npm run build

# ===== ETAPA 5: BUILD DE LA APP MÓVIL =====
FROM base AS mobile-builder

# Copiar código de la app móvil
COPY mobile/ ./mobile/

# Instalar dependencias de la app móvil
WORKDIR /app/mobile
RUN npm ci --only=production --ignore-scripts

# Build de la app móvil (si es necesario)
RUN npm run build || echo "No build script found"

# ===== ETAPA 6: IMAGEN FINAL =====
FROM node:18-alpine AS production

# Configurar variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Instalar dependencias del sistema para producción
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/lerna.json ./

# Copiar código compilado
COPY --from=backend-builder /app/backend ./backend
COPY --from=frontend-builder /app/web/.next ./web/.next
COPY --from=frontend-builder /app/web/public ./web/public
COPY --from=frontend-builder /app/web/package.json ./web/
COPY --from=mobile-builder /app/mobile ./mobile

# Copiar scripts y configuraciones
COPY scripts/ ./scripts/
COPY config/ ./config/
COPY docker-compose.yml ./
COPY Makefile ./
COPY .env.example ./

# Crear directorios necesarios
RUN mkdir -p \
    logs \
    uploads \
    backups \
    temp \
    && chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Exponer puertos
EXPOSE 5000 3000 8081

# Configurar healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Configurar entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["npm", "run", "start:prod"]

# ===== METADATA =====
LABEL maintainer="EventConnect Team <team@eventconnect.com>"
LABEL version="4.0.0"
LABEL description="EventConnect - Plataforma de eventos inteligente"
LABEL vendor="EventConnect"
LABEL org.opencontainers.image.title="EventConnect"
LABEL org.opencontainers.image.description="Plataforma completa de eventos con funcionalidades avanzadas"
LABEL org.opencontainers.image.version="4.0.0"
LABEL org.opencontainers.image.vendor="EventConnect"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/eventconnect/eventconnect"