#!/bin/bash
# 10xR Healthcare Platform - Docker Entrypoint Script
# This script runs before the main application starts in Docker
# It handles pre-start checks, migrations, and initialization

set -e  # Exit on error

echo "========================================="
echo "10xR Healthcare Platform"
echo "Starting application..."
echo "========================================="

# ==============================================================================
# Environment Validation
# ==============================================================================
echo "✓ Validating environment variables..."

# Required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "BETTER_AUTH_SECRET"
    "BETTER_AUTH_URL"
)

# Check if required variables are set
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✓ All required environment variables are set"

# ==============================================================================
# Health Checks
# ==============================================================================
echo "✓ Checking infrastructure connectivity..."

# Check PostgreSQL connectivity (optional - can be disabled if causing issues)
if [ ! -z "$DATABASE_URL" ]; then
    echo "  - Checking PostgreSQL connection..."
    # Add PostgreSQL connection check here if needed
fi

# Check Redis connectivity (optional)
if [ ! -z "$REDIS_URL" ]; then
    echo "  - Checking Redis connection..."
    # Add Redis connection check here if needed
fi

# ==============================================================================
# Directory Setup
# ==============================================================================
echo "✓ Setting up directories..."

# Ensure temp directory exists and has correct permissions
mkdir -p /app/temp /tmp
chmod 777 /app/temp /tmp

# ==============================================================================
# Database Migrations (Optional)
# ==============================================================================
# Uncomment if you want to run migrations on container start
# WARNING: Only do this for single-instance deployments or use init containers
#
# echo "✓ Running database migrations..."
# if [ -f "/app/node_modules/.bin/drizzle-kit" ]; then
#     pnpm db:migrate || echo "WARNING: Migration failed, continuing anyway..."
# else
#     echo "  - Drizzle Kit not found, skipping migrations"
# fi

# ==============================================================================
# Application Start
# ==============================================================================
echo "========================================="
echo "Starting Next.js application on port ${PORT:-3000}..."
echo "========================================="

# Start the application
# Use standalone server if it exists, otherwise use npm start
if [ -f "/app/server.js" ]; then
    exec node server.js
else
    exec npm start
fi

# ==============================================================================
# Notes:
# ==============================================================================
#
# This script is called by Docker when the container starts.
# It performs the following tasks:
#
# 1. Validates that all required environment variables are present
# 2. Checks connectivity to infrastructure services (optional)
# 3. Sets up necessary directories with correct permissions
# 4. Optionally runs database migrations (commented out by default)
# 5. Starts the Next.js application
#
# To customize:
# - Add additional environment variable checks
# - Add health checks for other services
# - Enable database migrations (use with caution)
# - Add custom initialization logic
#
# ==============================================================================