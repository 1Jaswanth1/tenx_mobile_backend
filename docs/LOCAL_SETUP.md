# 10xR Community Platform - Local Development Setup Guide

**Version:** 2.1  
**Last Updated:** November 2025  
**Status:** Production Ready with Declarative Schemas

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Local Development Workflow](#local-development-workflow)
4. [Database Schema Management](#database-schema-management)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Prerequisites

### Required Software

1. **Node.js** (v18+ recommended)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **Supabase CLI**
   ```bash
   # Install via npm
   npm install -g supabase
   
   # Or via Homebrew (macOS)
   brew install supabase/tap/supabase
   
   # Verify installation
   supabase --version
   ```

3. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Docker is required for running Supabase locally
   - Ensure Docker is running before starting Supabase

---

## 🎯 Initial Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd 10xr-community-platform
```

### Step 2: Initialize Supabase

```bash
# Initialize Supabase in the project
supabase init
```

This command creates the `supabase` directory structure if it doesn't exist.

### Step 3: Review Project Structure

Your project should now have this structure:

```
10xr-community-platform/
├── supabase/
│   ├── config.toml          # Supabase configuration
│   ├── seed.sql             # Seed data for local dev
│   ├── migrations/          # Generated migration files (auto-created)
│   └── schemas/             # Declarative schema files
│       ├── auth.sql      # Better Auth tables
│       ├── types.sql     # Custom ENUM types
│       ├── community_core.sql  # Users, communities, memberships
│       ├── content.sql   # Posts, comments, votes
│       ├── engagement.sql     # Saved posts, follows, notifications
│       ├── messaging.sql      # Direct messages
│       ├── b2b_sales.sql      # Agencies, aide profiles
│       ├── analytics.sql      # Activity logs, stats
│       └── functions.sql      # Triggers and functions
└── docs/
    ├── LOCAL_SETUP.md       # This file
    └── SCHEMA_GUIDE.md      # Schema documentation
```

### Step 4: Start Supabase Locally

```bash
# Start all Supabase services (Postgres, Studio, Auth, etc.)
supabase start
```

This command will:
- Start Docker containers for Postgres, Studio, GoTrue (Auth), etc.
- Run all schema files in the order defined in `config.toml`
- Apply seed data from `seed.sql`

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save these keys!** You'll need them for your frontend application.

### Step 5: Verify the Setup

1. **Open Supabase Studio**
   ```bash
   # Open in browser
   open http://localhost:54323
   ```

2. **Check Tables Created**
   - Navigate to "Table Editor" in Studio
   - You should see:
     - `auth_users`, `auth_sessions`, `auth_accounts` (Better Auth)
     - `users`, `communities`, `posts`, `comments` (Community)
     - `agencies`, `aide_profiles` (B2B Sales)
     - All 30+ tables from the schema

3. **Check Seed Data**
   ```sql
   -- Run in SQL Editor
   SELECT * FROM users;
   SELECT * FROM communities;
   SELECT * FROM posts;
   ```
   
   You should see:
   - System user + 3 test users
   - 5 default communities
   - 4 sample posts

### Step 6: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-step-4>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-step-4>

# Database URL (for Better Auth)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Better Auth
BETTER_AUTH_SECRET=your-local-secret-key-here
BETTER_AUTH_URL=http://localhost:3000/api/auth
```

---

## 🔄 Local Development Workflow

### Daily Workflow

```bash
# 1. Start Supabase (if not already running)
supabase start

# 2. Start your Next.js dev server
npm run dev

# 3. Work on your code...

# 4. When done for the day
supabase stop
```

### Making Schema Changes

We use **declarative schemas** to manage the database. Here's how to make changes:

#### Scenario 1: Adding a New Column to Existing Table

1. **Edit the schema file**
   ```bash
   # Example: Add 'phone' column to users table
   # Edit: supabase/schemas/03_community_core.sql
   ```

   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     auth_user_id UUID UNIQUE NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
     
     -- Public Community Identity
     username TEXT UNIQUE NOT NULL,
     display_name TEXT,
     avatar_url TEXT,
     banner_url TEXT,
     bio TEXT,
     location TEXT,
     website TEXT,
     phone TEXT,  -- 👈 NEW COLUMN (add at end)
     
     -- ... rest of table definition
   );
   ```

2. **Generate migration**
   ```bash
   supabase db diff -f add_phone_to_users
   ```

   This creates: `supabase/migrations/<timestamp>_add_phone_to_users.sql`

3. **Review the generated migration**
   ```bash
   cat supabase/migrations/<timestamp>_add_phone_to_users.sql
   ```

   Should contain:
   ```sql
   alter table "public"."users" add column "phone" text;
   ```

4. **Apply the migration**
   ```bash
   supabase migration up
   ```

5. **Verify in Studio**
   - Check that the `phone` column now exists in the `users` table

#### Scenario 2: Creating a New Table

1. **Create new schema file** (optional, or add to existing file)
   ```bash
   # Create: supabase/schemas/10_user_preferences.sql
   ```

   ```sql
   CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     
     -- Preferences
     theme TEXT DEFAULT 'light',
     email_notifications BOOLEAN DEFAULT TRUE,
     push_notifications BOOLEAN DEFAULT FALSE,
     
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
   ```

2. **Update `config.toml`** to include the new file
   ```toml
   [db.migrations]
   schema_paths = [
     "./schemas/01_auth.sql",
     # ... existing files ...
     "./schemas/09_functions.sql",
     "./schemas/10_user_preferences.sql",  # 👈 ADD THIS
   ]
   ```

3. **Generate migration**
   ```bash
   supabase db diff -f create_user_preferences
   ```

4. **Apply the migration**
   ```bash
   supabase migration up
   ```

#### Scenario 3: Rolling Back a Change (Local Only)

```bash
# Reset database to a specific migration version
supabase db reset --version <timestamp>

# Or reset to clean state (applies all migrations fresh)
supabase db reset
```

**Warning:** Only reset locally! Never reset a production database.

---

## 🧪 Testing

### Test User Accounts

The seed data creates three test accounts:

| Email | Password | Username | Role |
|-------|----------|----------|------|
| `aide1@test.com` | `password123` | `test_aide_1` | CNA (3 years) |
| `nurse1@test.com` | `password123` | `experienced_rn` | RN (10 years) |
| `don1@test.com` | `password123` | `director_johnson` | DON (20 years) |

### Manual Testing Checklist

1. **User Signup & Login**
   ```typescript
   // Test via your frontend
   await authClient.signUp.email({
     email: "newuser@test.com",
     password: "password123",
     name: "New User"
   });
   ```

2. **Create Community User**
   ```typescript
   // After auth signup, create community user
   const { data: user } = await supabase
     .from('users')
     .insert({
       auth_user_id: authUser.id,
       username: generateUsername(),
     })
     .select()
     .single();
   ```

3. **Join a Community**
   ```typescript
   await supabase
     .from('memberships')
     .insert({
       user_id: user.id,
       community_id: 's/aides-uuid',
       flair_text: 'CNA - 2 Yrs'
     });
   ```

4. **Create Anonymous Post**
   ```typescript
   await supabase
     .from('posts')
     .insert({
       title: "Testing anonymous posting",
       content: "This should hide my username",
       author_id: user.id,
       community_id: community.id,
       is_anonymous: true,  // 👈 The magic flag
     });
   ```

5. **Vote on Content**
   ```typescript
   await supabase
     .from('votes')
     .insert({
       user_id: user.id,
       votable_id: post.id,
       votable_type: 'post',
       vote_type: 'upvote'
     });
   ```

---

## 🐛 Troubleshooting

### Issue 1: Supabase Won't Start

**Symptom:** `supabase start` fails

**Solutions:**
```bash
# 1. Ensure Docker is running
docker ps

# 2. Stop and reset Supabase
supabase stop
supabase db reset

# 3. Clear Docker volumes (nuclear option)
supabase stop --no-backup
docker system prune -a --volumes
supabase start
```

### Issue 2: Schema Changes Not Applied

**Symptom:** Changes to schema files don't appear in database

**Solutions:**
```bash
# 1. Generate a new migration
supabase db diff -f my_changes

# 2. Apply migrations
supabase migration up

# 3. Or reset completely (local only)
supabase db reset
```

### Issue 3: Seed Data Not Loading

**Symptom:** Tables are empty after `supabase start`

**Solutions:**
```bash
# 1. Check seed.sql exists
cat supabase/seed.sql

# 2. Manually run seed
supabase db reset  # This automatically runs seed.sql

# 3. Or run seed directly
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
```

### Issue 4: RLS Blocking Queries

**Symptom:** "new row violates row-level security policy" errors

**Solutions:**
```sql
-- Temporarily disable RLS for testing (local only)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Or use service_role key in your queries
const supabaseAdmin = createClient(
  'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Issue 5: Port Already in Use

**Symptom:** "Port 54321 is already allocated"

**Solutions:**
```bash
# 1. Stop Supabase
supabase stop

# 2. Check what's using the port
lsof -i :54321

# 3. Kill the process
kill -9 <PID>

# 4. Restart Supabase
supabase start
```

---

## 📚 Additional Resources

### Supabase Documentation
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Declarative Schemas](https://supabase.com/docs/guides/cli/declarative-database-schemas)
- [Database Migrations](https://supabase.com/docs/guides/cli/managing-environments)

### Better Auth Documentation
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Integration](https://www.better-auth.com/docs/integrations/next-js)

### Internal Documentation
- [Schema Guide](./SCHEMA_GUIDE.md) - Detailed schema documentation
- [API Integration](./API_INTEGRATION.md) - How to use the database from your app

---

## 🎯 Next Steps

Once your local environment is set up:

1. **Read the Schema Guide** - Understand the database structure
2. **Build the Frontend** - Connect your Next.js app to the local Supabase
3. **Test Core Flows** - User signup, posting, voting, etc.
4. **Add Features** - Extend the schema as needed using declarative schemas

---

## 🔥 Quick Commands Reference

```bash
# Start/Stop
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase stop --backup  # Stop and backup data

# Schema Management
supabase db diff -f <name>    # Generate migration from schema changes
supabase migration up         # Apply pending migrations
supabase migration list       # List all migrations
supabase db reset             # Reset DB and apply all migrations + seed

# Database Access
supabase db push              # Push migrations to remote (production)
supabase db pull              # Pull migrations from remote
supabase db dump              # Dump current schema to SQL file

# Studio
open http://localhost:54323   # Open Supabase Studio

# Logs
supabase logs                 # View all logs
supabase logs -f postgres     # Follow Postgres logs
```

---

**Happy coding! 🚀**
