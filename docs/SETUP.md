# 10xR Community Platform - Setup Guide

**Version:** 3.0  
**Last Updated:** November 2025  
**Schema Management:** Declarative (Supabase v2)

Complete guide to setting up the 10xR Community Platform for local development using **Supabase Declarative Schema Management**.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Schema Management](#database-schema-management)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

1. **Node.js** (v20 or higher)
   ```bash
   # Download from https://nodejs.org/
   # Verify installation
   node --version  # Should show v20.x.x or higher
   ```

2. **pnpm** (v10.0.0)
   ```bash
   npm install -g pnpm@10.0.0
   pnpm --version  # Should show 10.0.0
   ```

3. **Git**
   ```bash
   # Download from https://git-scm.com/
   git --version  # Verify installation
   ```

4. **Supabase CLI** (latest version)
   ```bash
   # Install via npm
   npm install -g supabase
   
   # Verify installation
   supabase --version
   ```

5. **Docker Desktop** (for local Supabase)
   ```bash
   # Download from https://www.docker.com/products/docker-desktop
   # Required for running Supabase locally
   docker --version  # Verify installation
   ```

### Required Accounts

1. **Supabase Account** (free tier available)
    - Sign up at [supabase.com](https://supabase.com/)
    - Create a new organization

2. **GitHub Account** (for version control)
    - Sign up at [github.com](https://github.com/)

---

## Initial Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd ten-xr-community-platform

# Create your feature branch
git checkout -b setup/local-dev
```

### 2. Install Dependencies

```bash
# Install all npm packages
pnpm install

# This will take a few minutes the first time
# Progress: Installing dependencies... [====================] 100%
```

### 3. Initialize Supabase Locally

```bash
# Initialize Supabase in your project
supabase init

# This creates:
# - supabase/ directory
# - supabase/config.toml (configuration)
# - supabase/.gitignore

# Start Supabase services locally
supabase start

# This will:
# - Pull Supabase Docker images (first time only, ~5 minutes)
# - Start Postgres database
# - Start PostgREST API
# - Start Supabase Studio
# - Start Realtime server
# - Start Storage server

# Output will show:
# Started supabase local development setup.
#
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# JWT secret: <your-jwt-secret>
# anon key: <your-anon-key>
# service_role key: <your-service-role-key>
```

**⚠️ Important:** Save the output from `supabase start`. You'll need these credentials.

---

## Database Schema Management

### Understanding Declarative Schema

We use **Supabase Declarative Schema Management** instead of traditional imperative migrations. This means:

**Traditional Approach** (we DON'T use this):
```sql
-- Migration 001
CREATE TABLE posts (...);

-- Migration 002
ALTER TABLE posts ADD COLUMN tags TEXT[];

-- Migration 003
ALTER TABLE posts ADD COLUMN slug TEXT;
```

**Declarative Approach** (we USE this):
```sql
-- supabase/schemas/content.sql (single source of truth)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  tags TEXT[],
  slug TEXT,
  -- All columns defined in one place
);
```

### Schema Files Organization

Our schema is organized into modular files:

```
supabase/
├── schemas/                    # Source of truth
│   ├── types.sql              # Custom ENUM types
│   ├── auth.sql               # Better Auth tables
│   ├── community_core.sql     # Users, communities
│   ├── content.sql            # Posts, comments, votes
│   ├── engagement.sql         # Saves, follows, notifications
│   ├── messaging.sql          # Direct messages
│   ├── b2b_sales.sql          # Agencies, CRM
│   ├── analytics.sql          # Tracking, metrics
│   └── functions.sql          # Triggers, stored procedures
│
├── migrations/                 # Auto-generated (don't edit manually)
│   ├── 20241101000000_initial_schema.sql
│   └── ... (timestamped files)
│
├── seed.sql                   # Test data
└── config.toml                # Supabase configuration
```

### Step 4: Configure Schema Order

Edit `supabase/config.toml` to declare schema loading order:

```toml
[db.migrations]
enabled = true
schema_paths = [
  "./schemas/types.sql",          # 1. Types first (ENUMs)
  "./schemas/auth.sql",            # 2. Auth layer
  "./schemas/community_core.sql",  # 3. Core community
  "./schemas/content.sql",         # 4. Posts, comments
  "./schemas/engagement.sql",      # 5. User engagement
  "./schemas/messaging.sql",       # 6. Direct messages
  "./schemas/b2b_sales.sql",       # 7. B2B CRM
  "./schemas/analytics.sql",       # 8. Analytics
  "./schemas/functions.sql",       # 9. Functions last
]

[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

**Why this order?**
- Types must be created before they're referenced
- Auth tables before users (FK constraint)
- Core community before content (FK constraints)
- Functions last (reference all tables)

### Step 5: Apply Initial Schema

```bash
# Method 1: Reset database (applies all schemas from scratch)
supabase db reset

# This will:
# 1. Drop existing database
# 2. Create fresh database
# 3. Load schema files in order (from config.toml)
# 4. Run seed.sql (test data)
# 5. Apply any pending migrations

# Output:
# Applying migration 20241101000000_initial_schema.sql...
# Seeding data from seed.sql...
# Finished supabase db reset on branch main.
```

### Step 6: Verify Schema

```bash
# Open Supabase Studio
open http://localhost:54323

# Or check tables via CLI
supabase db list

# Expected tables:
# - auth_users, auth_sessions, auth_accounts, auth_verification_tokens, auth_two_factor
# - users, communities, memberships
# - posts, comments, votes
# - saved_posts, follows, notifications, reports, user_blocks
# - direct_conversations, direct_conversation_participants, direct_messages
# - agencies, aide_profiles, agency_leads, evangelist_rewards, sales_activities
# - user_activity_log, daily_community_stats
```

---

### Step 7: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your favorite editor
vim .env.local
```

**Required variables:**

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (from `supabase start` output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-start>

# Better Auth
BETTER_AUTH_SECRET=<generate-this-see-below>
BETTER_AUTH_URL=http://localhost:3000

# Database (for direct connections, optional)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

**Generate Better Auth Secret:**
```bash
# Generate a random secret
openssl rand -base64 32

# Copy output and paste as BETTER_AUTH_SECRET
```

---

### Step 8: Generate TypeScript Types

```bash
# Generate TypeScript types from Supabase schema
pnpm supabase:types

# This creates: lib/supabase/database.types.ts
# Contains type-safe interfaces for all tables

# Verify types were generated
cat lib/supabase/database.types.ts | head -50
```

---

### Step 9: Start Development Server

```bash
# Start Next.js development server
pnpm dev

# Server will start at http://localhost:3000

# Output:
#   ▲ Next.js 16.0.0
#   - Local:        http://localhost:3000
#   - Ready in 2.5s
```

---

### Step 10: Verify Installation

#### Test 1: Homepage

```bash
# Open browser
open http://localhost:3000

# Expected: Homepage loads without errors
```

#### Test 2: Health Check

```bash
# Check API health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "database": {
#     "status": "connected",
#     "tables": 29
#   },
#   "timestamp": "2025-11-11T12:00:00.000Z"
# }
```

#### Test 3: Supabase Studio

```bash
# Open Supabase Studio
open http://localhost:54323

# Navigate to:
# 1. Table Editor → Verify tables exist
# 2. SQL Editor → Run test query:

SELECT COUNT(*) as user_count FROM users;

# Expected: 3 (from seed data)
```

#### Test 4: Test User Login

```bash
# Test users from seed.sql:
# Email: aide1@test.com
# Password: (set during seed, default: password123)

# 1. Go to http://localhost:3000/auth/signin
# 2. Enter email: aide1@test.com
# 3. Enter password: password123
# 4. Should redirect to feed
```

---

## Development Workflow

### Making Schema Changes

#### Scenario 1: Add New Column

```bash
# 1. Edit schema file
vim supabase/schemas/content.sql

# Add new column to posts table:
# slug TEXT,

# 2. Generate migration
supabase db diff -f add_post_slug

# This creates:
# supabase/migrations/[timestamp]_add_post_slug.sql

# 3. Review generated migration
cat supabase/migrations/*_add_post_slug.sql

# Expected content:
# ALTER TABLE "public"."posts" ADD COLUMN "slug" TEXT;

# 4. Apply migration locally
supabase migration up

# 5. Regenerate TypeScript types
pnpm supabase:types

# 6. Test your changes
pnpm dev
```

#### Scenario 2: Add New Table

```bash
# 1. Edit schema file (or create new file)
vim supabase/schemas/new_feature.sql

# Add new table:
CREATE TABLE my_new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

# 2. Update config.toml schema order
vim supabase/config.toml

# Add to schema_paths:
#   "./schemas/new_feature.sql",

# 3. Generate migration
supabase db diff -f add_new_table

# 4. Apply and test
supabase migration up
pnpm supabase:types
pnpm dev
```

#### Scenario 3: Modify Existing Table

```bash
# 1. Edit schema file
vim supabase/schemas/content.sql

# Change:
# title TEXT NOT NULL,
# To:
# title TEXT NOT NULL CHECK (char_length(title) <= 500),

# 2. Generate migration
supabase db diff -f update_title_constraint

# 3. Review migration carefully
cat supabase/migrations/*_update_title_constraint.sql

# ⚠️ May be destructive! Check for:
# - DROP COLUMN statements
# - Data type changes that lose precision
# - Constraints that existing data violates

# 4. If safe, apply
supabase migration up
```

### Best Practices

1. **Always review generated migrations**
    - `supabase db diff` is smart but not perfect
    - Check for unintended DROP statements
    - Verify constraints won't break existing data

2. **Test locally first**
   ```bash
   # Apply migration locally
   supabase migration up
   
   # Run tests
   pnpm test
   
   # Manual testing
   pnpm dev
   ```

3. **Commit schema changes AND migrations**
   ```bash
   git add supabase/schemas/content.sql
   git add supabase/migrations/[timestamp]_add_post_slug.sql
   git commit -m "feat: add post slugs for SEO"
   ```

4. **Use descriptive migration names**
   ```bash
   # Good
   supabase db diff -f add_post_slug_for_seo
   
   # Bad
   supabase db diff -f update
   ```

---

### Rolling Back Changes

#### During Development

```bash
# Reset to previous version
supabase db reset --version 20241101000000

# This will:
# 1. Drop database
# 2. Recreate from schemas
# 3. Apply migrations up to specified version
# 4. Skip seed.sql (unless you want it)

# Or reset completely
supabase db reset

# Regenerate types
pnpm supabase:types
```

#### In Production

**⚠️ NEVER reset production database!**

```bash
# Instead, create a new migration that reverts changes

# 1. Revert schema file
vim supabase/schemas/content.sql
# Remove the problematic changes

# 2. Generate "down" migration
supabase db diff -f revert_post_slug

# 3. Review carefully (may be destructive!)
cat supabase/migrations/*_revert_post_slug.sql

# Example content:
# ALTER TABLE "public"."posts" DROP COLUMN "slug";

# 4. Deploy to staging first
supabase db push --project-ref staging-ref

# 5. Test thoroughly

# 6. Deploy to production
supabase db push --project-ref production-ref
```

---

## Testing

### Running Tests

```bash
# Unit tests
pnpm test

# Watch mode (for development)
pnpm test:watch

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Database Testing

```bash
# Test database functions
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run test queries
SELECT * FROM users LIMIT 5;
SELECT COUNT(*) FROM posts;
SELECT * FROM aide_profiles WHERE verification_status = 'verified';

# Test RLS policies
SET ROLE authenticated;
SET request.jwt.claims.sub = '<auth-user-id>';
SELECT * FROM posts;  # Should only see public posts
SELECT * FROM aide_profiles;  # Should only see own profile
RESET ROLE;
```

### Manual Testing Checklist

- [ ] User signup flow
- [ ] User login flow
- [ ] Create post (text, image, link, poll)
- [ ] Create comment
- [ ] Vote on post/comment
- [ ] Anonymous posting
- [ ] Direct messaging
- [ ] Create aide profile
- [ ] Submit agency lead
- [ ] Admin CRM features

---

## Troubleshooting

### Issue 1: Supabase won't start

**Symptom:** `supabase start` fails

**Solutions:**

```bash
# 1. Check Docker is running
docker ps

# 2. Stop and restart
supabase stop
supabase start

# 3. Reset completely
supabase stop --no-backup
supabase start

# 4. Check port conflicts
lsof -i :54321  # API port
lsof -i :54322  # Database port
lsof -i :54323  # Studio port

# If ports in use, stop conflicting services
```

---

### Issue 2: Migration fails

**Symptom:** `supabase migration up` or `supabase db reset` fails

**Solutions:**

```bash
# 1. Check migration syntax
cat supabase/migrations/[failing-migration].sql

# 2. Test migration manually
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/migrations/[failing-migration].sql

# 3. Check for dependency issues
# - Are foreign key tables created first?
# - Are types defined before use?
# - Is schema_paths order correct in config.toml?

# 4. Reset and try again
supabase db reset
```

---

### Issue 3: Types not generating

**Symptom:** `pnpm supabase:types` fails or types are outdated

**Solutions:**

```bash
# 1. Check Supabase is running
supabase status

# 2. Manually generate types
supabase gen types typescript --local > lib/supabase/database.types.ts

# 3. Check connection
curl http://localhost:54321/rest/v1/users

# 4. Restart Supabase
supabase stop
supabase start
pnpm supabase:types
```

---

### Issue 4: Environment variables not loading

**Symptom:** App can't connect to Supabase

**Solutions:**

```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Verify variables are set
cat .env.local | grep SUPABASE

# 3. Restart dev server
# Environment variables only load on server start
pnpm dev

# 4. Check for typos
# NEXT_PUBLIC_ prefix required for client-side vars
```

---

### Issue 5: Seed data not loading

**Symptom:** No test users after `supabase db reset`

**Solutions:**

```bash
# 1. Check seed.sql exists
cat supabase/seed.sql | head -20

# 2. Verify config.toml
cat supabase/config.toml | grep seed

# Should show:
# [db.seed]
# enabled = true
# sql_paths = ["./seed.sql"]

# 3. Manually apply seed
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql

# 4. Check for errors
supabase db reset 2>&1 | grep ERROR
```

---

## Production Deployment

### Step 1: Create Production Project

```bash
# 1. Go to https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Fill in details:
#    - Name: 10xr-community-prod
#    - Database Password: (generate strong password)
#    - Region: (choose closest to users)

# 4. Wait for project to provision (~2 minutes)
```

### Step 2: Link Local to Production

```bash
# Login to Supabase CLI
supabase login

# Link to production project
supabase link --project-ref <your-project-ref>

# Project ref is in project URL:
# https://supabase.com/dashboard/project/<project-ref>
```

### Step 3: Deploy Schema

```bash
# Push database schema to production
supabase db push

# This will:
# 1. Generate migration from schema files
# 2. Apply to production database
# 3. Show diff before applying

# ⚠️ Review diff carefully before confirming!

# Expected output:
# Applying migration 20241101000000_initial_schema.sql...
# Do you want to push these migrations to the remote database? [y/N] y
# Finished supabase db push.
```

### Step 4: Configure Production Environment

```bash
# Update environment variables in hosting platform
# (Vercel, Railway, etc.)

# Required variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
BETTER_AUTH_SECRET=<new-secret-for-production>
BETTER_AUTH_URL=https://your-domain.com

# Get Supabase keys from:
# Project Dashboard > Settings > API
```

### Step 5: Deploy Application

```bash
# Build for production
pnpm build

# Test production build locally
pnpm start

# Deploy to hosting platform
git push origin main  # Triggers deployment on Vercel/Railway

# Or manual deployment
vercel --prod
```

### Step 6: Post-Deployment Verification

```bash
# 1. Check API health
curl https://your-domain.com/api/health

# 2. Test user signup
# Go to https://your-domain.com/auth/signup

# 3. Test database connection
# Try creating a post, comment, etc.

# 4. Monitor logs
# Check Supabase Dashboard > Logs
# Check hosting platform logs
```

---

## Ongoing Maintenance

### Daily Tasks

```bash
# Update dependencies
pnpm update

# Run tests
pnpm test

# Check for security vulnerabilities
pnpm audit
```

### Weekly Tasks

```bash
# Review database performance
# Supabase Dashboard > Database > Performance

# Check query performance
# Look for slow queries (>1s)

# Review storage usage
# Supabase Dashboard > Storage

# Backup database (automatic on Supabase)
# Verify backups exist in dashboard
```

### Monthly Tasks

```bash
# Review RLS policies
# Ensure security is maintained

# Audit user activity
# Check for suspicious patterns

# Update production schema if needed
supabase db push

# Review analytics
# Check daily_community_stats table
```

---

## Quick Reference

### Essential Commands

```bash
# Supabase
supabase start                  # Start local Supabase
supabase stop                   # Stop local Supabase
supabase db reset               # Reset database from schemas
supabase db diff -f name        # Generate migration
supabase migration up           # Apply pending migrations
supabase db push                # Deploy to production

# Development
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm test                       # Run tests
pnpm supabase:types             # Generate TypeScript types

# Database
psql postgresql://postgres:postgres@localhost:54322/postgres  # Connect to local DB
```

### URLs

- **Local App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **Supabase API:** http://localhost:54321
- **Email Testing:** http://localhost:54324

---

## Getting Help

### Resources

1. **Documentation**
    - [Supabase Declarative Schema Docs](https://supabase.com/docs/guides/local-development/declarative-schema)
    - [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
    - [Better Auth Docs](https://www.better-auth.com/docs)

2. **Internal Docs**
    - `SCHEMA.md` - Complete schema reference
    - `SUPABASE.md` - Technical Supabase integration
    - `README.md` - Project overview

3. **Support Channels**
    - Team Slack: #engineering
    - GitHub Issues
    - Daily standup meetings

---

**Setup Status:** ✅ Ready for Development  
**Last Updated:** November 2025  
**Maintained By:** 10xR Engineering Team