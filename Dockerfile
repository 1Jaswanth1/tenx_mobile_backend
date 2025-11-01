# syntax=docker.io/docker/dockerfile:1
# 10xR Healthcare Platform - Production Dockerfile
# Multi-stage build optimized for Next.js 16 with Better Auth and document processing

# ==============================================================================
# Base Stage - Install system dependencies
# ==============================================================================
FROM node:24-slim AS base

# Install system dependencies for document processing and runtime
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        ca-certificates \
        python3 \
        python3-pip \
        python3-venv \
        build-essential \
        libtool \
        autoconf \
        automake \
        pkg-config \
        libjpeg-dev \
        libcairo2-dev \
        libgif-dev \
        libpango1.0-dev \
        libpixman-1-dev \
        libreoffice \
        poppler-utils \
        ghostscript \
        graphicsmagick \
        imagemagick \
        default-jre \
        fonts-dejavu \
        fonts-liberation \
        fontconfig && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create Python virtual environment for document processing
RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip3 install --no-cache-dir \
        python-docx \
        pdf2image \
        PyPDF2

# Set working directory
WORKDIR /app

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# ==============================================================================
# Dependencies Stage - Install Node.js dependencies
# ==============================================================================
FROM base AS deps

# Copy package manager files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile --prod=false

# ==============================================================================
# Builder Stage - Build the application
# ==============================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set build-time environment variables
# Note: Runtime environment variables are injected by infrastructure
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN pnpm build

# ==============================================================================
# Runner Stage - Production runtime
# ==============================================================================
FROM base AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV HOME=/tmp

# Add Python venv and LibreOffice to PATH
ENV PATH="/opt/venv/bin:/usr/lib/libreoffice/program:$PATH"

# Runtime configuration
ENV NEXT_RUNTIME="nodejs"
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV TZ=UTC
ENV LANG=en_US.UTF-8

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Create necessary directories with proper permissions
RUN mkdir -p /app/temp /tmp && \
    chown -R nextjs:nodejs /app /tmp && \
    chmod 777 /app/temp /tmp

# Copy Python virtual environment
COPY --from=deps --chown=nextjs:nodejs /opt/venv /opt/venv

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Alternative: If not using standalone output, copy these instead
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy entrypoint script if it exists
COPY --chown=nextjs:nodejs scripts/entrypoint.sh* /app/entrypoint.sh*
RUN if [ -f /app/entrypoint.sh ]; then chmod +x /app/entrypoint.sh; fi

# Expose application port
EXPOSE 3000

# Health check configuration
# Checks the /api/health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Start the application
# Use entrypoint script if it exists, otherwise start directly
CMD if [ -f /app/entrypoint.sh ]; then \
        /app/entrypoint.sh; \
    else \
        node server.js; \
    fi

# ==============================================================================
# Build Instructions:
# ==============================================================================
#
# Build image:
#   docker build -t 10xr-backend:latest .
#
# Build with specific version:
#   docker build -t 10xr-backend:v1.0.0 .
#
# Build with build args:
#   docker build --build-arg NODE_ENV=production -t 10xr-backend:prod .
#
# ==============================================================================
# Run Instructions:
# ==============================================================================
#
# Run with environment variables from infrastructure:
#   docker run -p 3000:3000 \
#     -e DATABASE_URL=$DATABASE_URL \
#     -e REDIS_URL=$REDIS_URL \
#     -e BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
#     -e BETTER_AUTH_URL=$BETTER_AUTH_URL \
#     -e NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
#     10xr-backend:latest
#
# Run with resource limits:
#   docker run -p 3000:3000 \
#     --memory=4g \
#     --cpus=2 \
#     -e DATABASE_URL=$DATABASE_URL \
#     10xr-backend:latest
#
# ==============================================================================
# Notes:
# ==============================================================================
#
# 1. Environment Variables:
#    - All environment variables are injected at runtime by infrastructure
#    - No .env files are copied into the image
#    - Required vars: DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
#
# 2. Security:
#    - Runs as non-root user (nextjs:nodejs, UID 1001)
#    - Minimal attack surface with slim base image
#    - No sensitive data in image layers
#
# 3. Performance:
#    - Multi-stage build reduces final image size
#    - Layer caching optimized for fast rebuilds
#    - Standalone output for minimal runtime dependencies
#
# 4. Health Checks:
#    - Built-in health check on /api/health
#    - Orchestrators (K8s, ECS) can use this for liveness/readiness probes
#
# 5. Document Processing:
#    - Includes LibreOffice for document conversion
#    - ImageMagick/GraphicsMagick for image processing
#    - Python tools for PDF/DOCX handling
#
# ==============================================================================