# 10xR Community Platform - Setup Guide

Complete guide to setting up the 10xR Community Platform for local development.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v20 or higher)
    - Download from [nodejs.org](https://nodejs.org/)
    - Verify: `node --version`

2. **pnpm** (v10.0.0)
   ```bash
   npm install -g pnpm@10.0.0
   ```
    - Verify: `pnpm --version`

3. **Git**
    - Download from [git-scm.com](https://git-scm.com/)
    - Verify: `git --version`

### Accounts Needed

1. **Supabase Account** (free tier available)
    - Sign up at [supabase.com](https://supabase.com/)
    - Create a new organization

2. **GitHub Account** (for OAuth, optional)
    - Sign up at [github.com](https://github.com/)

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd ten-xr-community-platform

# Create a new branch for your work
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies

```bash
# Install all npm packages
pnpm install

# This will take a few minutes the first time
```

### 3. Set Up Supabase Project

#### Option A: Supabase Cloud (Recommended)

1. **Create a new project**
    - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
    - Click "New Project"
    - Fill in project details:
        - Name: `10xr-community-dev`
        - Database Password: (generate a strong password)
        - Region: Choose closest to you

2. **Get your project credentials**
    - Go to Settings > API
    - Copy:
        - Project URL (e.g., `https://xxxxx.supabase.co`)
        - Anon/Public Key
        - Service Role Key (keep this secret!)

#### Option B: Local Supabase (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase (requires Docker)
supabase start

# Note the API URL and keys from the output
```

### 4. Configure Environment Variables

1. **Copy the example environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your Supabase credentials**
   Open `.env.local` and update:

   ```env
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Supabase (get these from your Supabase dashboard)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Better Auth
   BETTER_AUTH_SECRET=generate-this-see-below
   BETTER_AUTH_URL=http://localhost:3000

   # Redis (optional for now)
   # REDIS_URL=redis://localhost:6379
   ```

3. **Generate Better Auth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `BETTER_AUTH_SECRET`

### 5. Set Up Database Schema

#### If using Supabase Cloud:

1. **Open SQL Editor**
    - Go to your Supabase project dashboard
    - Click "SQL Editor" in the sidebar

2. **Run the migration**
    - Create a new query
    - Copy the contents of `supabase/migrations/20241101000000_initial_schema.sql`
    - Paste into the SQL Editor
    - Click "Run"

3. **Verify tables created**
    - Go to "Table Editor"
    - You should see: `user`, `session`, `account`, `verification`, `profiles`

#### If using Local Supabase:

```bash
# Apply migrations
supabase db push

# Check migration status
supabase migration list
```

### 6. Generate TypeScript Types

```bash
# Generate types from Supabase schema
pnpm supabase:types

# This creates lib/supabase/database.types.ts
```

### 7. Start Development Server

```bash
# Start the Next.js development server
pnpm dev

# Server will start at http://localhost:3000
```

### 8. Verify Installation

Open your browser and check:

1. **Homepage**
    - Visit: http://localhost:3000
    - Should load without errors

2. **Health Check**
    - Visit: http://localhost:3000/api/health
    - Should show:
      ```json
      {
        "status": "healthy",
        "database": {
          "status": "connected"
        }
      }
      ```

3. **Supabase Dashboard** (if local)
    - Visit: http://localhost:54323
    - Login with credentials from `supabase start` output

---

## Common Issues & Solutions

### Issue: "BETTER_AUTH_SECRET is not set"

**Solution:**
```bash
# Generate a new secret
openssl rand -base64 32

# Add it to .env.local
BETTER_AUTH_SECRET=<your-generated-secret>
```

### Issue: "Cannot connect to Supabase"

**Solutions:**

1. **Check environment variables**
    - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
    - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
    - No extra spaces or quotes

2. **Check Supabase project status**
    - Go to Supabase dashboard
    - Ensure project is active (not paused)

3. **Check network connection**
    - Ensure you can access supabase.com
    - Try from a different network if needed

### Issue: "Database tables not found"

**Solution:**
```bash
# Re-run the migration
# Copy supabase/migrations/20241101000000_initial_schema.sql
# Run in Supabase SQL Editor
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Issue: "pnpm install fails"

**Solutions:**

1. **Clear cache**
   ```bash
   pnpm store prune
   pnpm install
   ```

2. **Update pnpm**
   ```bash
   npm install -g pnpm@10.0.0
   ```

3. **Delete node_modules and reinstall**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

---

## Optional: Set Up OAuth Providers

### Google OAuth

1. **Create OAuth credentials**
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing
    - Enable Google+ API
    - Create OAuth 2.0 credentials
    - Add authorized redirect URIs:
        - `http://localhost:3000/api/auth/callback/google`

2. **Update .env.local**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Uncomment in lib/auth/auth.ts**
   ```typescript
   socialProviders: {
     google: {
       clientId: env.GOOGLE_CLIENT_ID!,
       clientSecret: env.GOOGLE_CLIENT_SECRET!,
     },
   },
   ```

### GitHub OAuth

1. **Create OAuth App**
    - Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
    - Click "New OAuth App"
    - Fill in:
        - Application name: `10xR Community (Dev)`
        - Homepage URL: `http://localhost:3000`
        - Callback URL: `http://localhost:3000/api/auth/callback/github`

2. **Update .env.local**
   ```env
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

3. **Uncomment in lib/auth/auth.ts**
   ```typescript
   socialProviders: {
     github: {
       clientId: env.GITHUB_CLIENT_ID!,
       clientSecret: env.GITHUB_CLIENT_SECRET!,
     },
   },
   ```

---

## Optional: Set Up Redis (for Background Jobs)

### Using Docker

```bash
# Run Redis container
docker run -d \
  --name redis-10xr \
  -p 6379:6379 \
  redis:latest

# Verify it's running
docker ps
```

### Using Local Installation

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Update .env.local:**
```env
REDIS_URL=redis://localhost:6379
```

---

## Next Steps

After setup is complete:

1. **Explore the codebase**
    - Read `README.md` for architecture overview
    - Check `lib/` for core functionality
    - Review `app/` for routes and pages

2. **Create your first feature**
    - Create a new branch
    - Add your code
    - Write tests
    - Submit a PR

3. **Join the team**
    - Ask questions in team chat
    - Attend daily standups
    - Review code from teammates

---

## Development Workflow

```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make changes and test
pnpm dev
pnpm test

# Format and lint
pnpm format
pnpm lint:fix

# Commit changes
git add .
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm e2e:headless     # Run E2E tests

# Database
pnpm supabase:types   # Generate TypeScript types

# Code Quality
pnpm lint             # Check linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
```

---

## Getting Help

If you're stuck:

1. **Check the docs**
    - README.md
    - CHANGELOG.md
    - This setup guide

2. **Check existing issues**
    - GitHub Issues
    - Team wiki

3. **Ask for help**
    - Team chat
    - Daily standup
    - Pair programming session

---

## Success! ðŸŽ‰

You're now ready to start developing on the 10xR Community Platform!

Happy coding! 💙