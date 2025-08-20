# Multi-stage build for EventConnect Backend
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    ffmpeg \
    imagemagick

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    dumb-init

# Set working directory
WORKDIR /app

# Copy from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /usr/local/bin/node /usr/local/bin/
COPY --from=base /usr/local/lib/node_modules /usr/local/lib/node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R nodejs:nodejs logs uploads temp

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]

# Development stage
FROM base AS development

# Install dev dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start in development mode
CMD ["npm", "run", "dev"]