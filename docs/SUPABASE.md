# 10xR Community Platform - Supabase Integration Guide

**Version:** 3.0  
**Last Updated:** November 2025  
**Supabase Version:** v2 (Declarative Schema)

Technical documentation for how we use Supabase in the 10xR Community Platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Declarative Schema Management](#declarative-schema-management)
4. [Database Configuration](#database-configuration)
5. [RLS Policies](#rls-policies)
6. [Storage](#storage)
7. [Realtime](#realtime)
8. [Edge Functions](#edge-functions)
9. [Client Integration](#client-integration)
10. [Performance Optimization](#performance-optimization)
11. [Security Best Practices](#security-best-practices)

---

## Overview

### Why Supabase?

We chose Supabase for the 10xR Community Platform because:

1. **Postgres Foundation:**
    - Industry-standard relational database
    - ACID compliance for data integrity
    - Rich SQL feature set (triggers, functions, views)
    - Mature ecosystem and tooling

2. **Built-in Features:**
    - Row-Level Security (RLS) for data access control
    - Realtime subscriptions for live updates
    - Storage API for media files
    - Auto-generated REST API
    - Auto-generated TypeScript types

3. **Developer Experience:**
    - Local development with Docker
    - **Declarative Schema Management** (v2 feature)
    - CLI for migrations and deployment
    - Studio for visual database management
    - Excellent documentation

4. **Scalability:**
    - Connection pooling (PgBouncer)
    - Read replicas (production)
    - Automatic backups
    - CDN for static assets

5. **Cost-Effective:**
    - Free tier: 500MB database, 2 simultaneous connections
    - Pro tier: $25/month for production needs
    - Predictable pricing as we scale

---

## Architecture

### Supabase Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                         │
│                   (Next.js 16 App Router)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Supabase Client    │  │   Better Auth        │
│   (@supabase/ssr)    │  │   (Authentication)   │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │   Supabase API Layer    │
           ├─────────────────────────┤
           │  PostgREST (REST API)   │
           │  Realtime (WebSockets)  │
           │  Storage (S3-like)      │
           │  Edge Functions         │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │   PostgreSQL Database   │
           ├─────────────────────────┤
           │  • Declarative Schema   │
           │  • RLS Policies         │
           │  • Triggers & Functions │
           │  • Full-text Search     │
           └─────────────────────────┘
```

### Data Flow

**User Action → Database:**
```
User clicks "Create Post"
  ↓
Next.js Server Action
  ↓
Supabase Client (with user session)
  ↓
PostgREST API (auto-generated from schema)
  ↓
RLS Policy Check (is user authenticated?)
  ↓
Trigger: update_updated_at_column()
  ↓
Trigger: update_community_post_count()
  ↓
Database Write
  ↓
Return Result
```

**Real-time Update:**
```
Database Write (post created)
  ↓
Realtime Server detects change
  ↓
Broadcast to subscribed clients
  ↓
Client updates UI (new post appears)
```

---

## Declarative Schema Management

### What is Declarative Schema?

**Traditional Imperative Migrations:**
```sql
-- Migration 001
CREATE TABLE posts (id UUID PRIMARY KEY);

-- Migration 002
ALTER TABLE posts ADD COLUMN title TEXT;

-- Migration 003
ALTER TABLE posts ADD COLUMN content TEXT;
```
**Problem:** Schema scattered across 100+ files

**Declarative Approach:**
```sql
-- supabase/schemas/content.sql (single source of truth)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Benefit:** Complete table definition in one file

### Our Schema Organization

```
supabase/
├── schemas/                    # SOURCE OF TRUTH
│   ├── types.sql              # ENUMs and custom types
│   ├── auth.sql               # Better Auth tables
│   ├── community_core.sql     # users, communities, memberships
│   ├── content.sql            # posts, comments, votes
│   ├── engagement.sql         # saved_posts, follows, notifications
│   ├── messaging.sql          # direct_conversations, direct_messages
│   ├── b2b_sales.sql          # agencies, aide_profiles, leads
│   ├── analytics.sql          # user_activity_log, daily_stats
│   └── functions.sql          # Triggers and stored procedures
│   └── rls_policies.sql       # Row Level Security Policies
│   └── direct_chat.sql        # Direct Chat tables
│
├── migrations/                 # AUTO-GENERATED (don't edit manually)
│   ├── 20241101000000_initial_schema.sql
│   ├── 20241105120000_add_post_tags.sql
│   └── ... (timestamped)
│
├── seed.sql                   # Test data for local development
└── config.toml                # Supabase configuration
```

### Schema Loading Order

Declared in `supabase/config.toml`:

```toml
[db.migrations]
enabled = true
schema_paths = [
  "./schemas/types.sql",          # 1. Types first
  "./schemas/auth.sql",            # 2. Auth layer
  "./schemas/community_core.sql",  # 3. Core tables
  "./schemas/content.sql",         # 4. Content tables
  "./schemas/engagement.sql",      # 5. Engagement
  "./schemas/messaging.sql",       # 6. Messaging
  "./schemas/b2b_sales.sql",       # 7. B2B CRM
  "./schemas/analytics.sql",       # 8. Analytics
  "./schemas/functions.sql",       # 9. Functions 
  "./schemas/rls_policies.sql",    # 10. Row Level Security Policies
  "./schemas/direct_chat.sql"      # 11. Direct Chat tables last
]
```

**Why this order?**
- ENUMs must exist before being referenced
- Foreign keys require parent tables to exist first
- Triggers/functions reference tables, so come last

### Workflow: Making Schema Changes

#### 1. Edit Schema File

```bash
vim supabase/schemas/content.sql

# Add new column:
posts.slug TEXT
```

#### 2. Generate Migration

```bash
supabase db diff -f add_post_slug

# Output:
# Created new migration at supabase/migrations/20241107120000_add_post_slug.sql
```

#### 3. Review Generated Migration

```bash
cat supabase/migrations/20241107120000_add_post_slug.sql

# Expected content:
ALTER TABLE "public"."posts" ADD COLUMN "slug" TEXT;
```

#### 4. Apply Locally

```bash
supabase migration up

# Or reset completely:
supabase db reset
```

#### 5. Deploy to Production

```bash
supabase db push

# Shows diff, asks for confirmation
```

### Benefits for Our Project

1. **Single Source of Truth:**
    - One file per schema area
    - Easy to understand table structure
    - No hunting through 50 migration files

2. **Merge Conflict Reduction:**
    - Multiple devs can edit same schema file
    - Git conflicts easier to resolve
    - No duplicate migration timestamps

3. **Fast Onboarding:**
    - New devs read `schemas/` folder
    - Complete picture in ~500 lines
    - vs 3000+ lines scattered across migrations

4. **Safe Refactoring:**
    - Change schema, auto-generate migration
    - Review before deploying
    - Rollback by reverting schema change

---

## Database Configuration

### config.toml Settings

```toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
max_rows = 1000

[db]
port = 54322
major_version = 17  # Postgres 17

[db.pooler]
enabled = false  # Enable in production
port = 54329
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100

[db.seed]
enabled = true
sql_paths = ["./seed.sql"]

[auth]
enabled = true
site_url = "http://localhost:3000"
jwt_expiry = 3600  # 1 hour
enable_refresh_token_rotation = true
enable_signup = true
minimum_password_length = 8

[storage]
enabled = true
file_size_limit = "50MiB"

[realtime]
enabled = true
```

### Connection Strings

**Local Development:**
```
postgresql://postgres:postgres@localhost:54322/postgres
```

**Production:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection Pooler (Production):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Environment Variables

```env
# Client-side (Next.js)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-side (Next.js Server Actions, Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Direct Database (for migrations, background jobs)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

## RLS Policies

### Row-Level Security Overview

RLS allows us to control data access at the database level, not application level. This provides:

1. **Security:** Policies enforced by Postgres, not our code
2. **Simplicity:** No need to add WHERE clauses to every query
3. **Performance:** Postgres optimizes policy checks
4. **Multi-tenancy:** Users can only see their own data

### Policy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                       │
│  Better Auth validates user, creates JWT with auth.uid()    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      RLS POLICIES                             │
│  Postgres checks policies using auth.uid() from JWT         │
├─────────────────────────────────────────────────────────────┤
│  Public Content:                                             │
│    • Anyone can SELECT unremoved posts/comments             │
│    • Users can INSERT/UPDATE their own content              │
│                                                              │
│  Private Data (aide_profiles):                              │
│    • Users can SELECT only their own profile                │
│    • Admins (service_role) bypass RLS, see all             │
│                                                              │
│  Admin-Only (agencies, CRM):                                │
│    • No public RLS policies                                 │
│    • Only service_role can access                           │
└─────────────────────────────────────────────────────────────┘
```

### Example: Posts Table Policies

```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read public posts
CREATE POLICY "posts_select_public" ON posts
FOR SELECT
USING (
  is_removed = FALSE AND is_spam = FALSE
);

-- Policy 2: Users can insert their own posts
CREATE POLICY "posts_insert_own" ON posts
FOR INSERT
WITH CHECK (
  auth.uid() = auth_user_id
  -- auth_user_id references users.auth_user_id which links to auth_users.id
);

-- Policy 3: Users can update their own posts
CREATE POLICY "posts_update_own" ON posts
FOR UPDATE
USING (
  auth.uid() = (
    SELECT auth_user_id FROM users WHERE id = posts.author_id
  )
);

-- Policy 4: Users can delete their own posts
CREATE POLICY "posts_delete_own" ON posts
FOR DELETE
USING (
  auth.uid() = (
    SELECT auth_user_id FROM users WHERE id = posts.author_id
  )
);
```

### Example: Aide Profiles (Private Data)

```sql
-- Enable RLS
ALTER TABLE aide_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own aide profile
CREATE POLICY "aide_profiles_select_own" ON aide_profiles
FOR SELECT
USING (
  auth.uid() = (
    SELECT auth_user_id FROM users WHERE id = aide_profiles.user_id
  )
);

-- Users can update their own aide profile
CREATE POLICY "aide_profiles_update_own" ON aide_profiles
FOR UPDATE
USING (
  auth.uid() = (
    SELECT auth_user_id FROM users WHERE id = aide_profiles.user_id
  )
);

-- Service role bypasses RLS (for admin dashboard)
-- No policy needed - service_role has BYPASSRLS permission
```

### Example: Agencies (Admin-Only)

```sql
-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- NO public policies defined
-- Only service_role can access this table
-- Used in admin dashboard with server-side queries

-- Example admin query:
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Service role key
  { auth: { persistSession: false } }
);

const { data: agencies } = await supabaseAdmin
  .from('agencies')
  .select('*');  // Works because service_role bypasses RLS
```

### Anonymous Posting Privacy

For anonymous posts, we use application logic + RLS:

```sql
-- posts.is_anonymous = TRUE hides author_id in frontend
-- But RLS still allows user to see their own posts

CREATE POLICY "posts_select_own_anonymous" ON posts
FOR SELECT
USING (
  -- User can always see their own posts (even if anonymous)
  auth.uid() = (
    SELECT auth_user_id FROM users WHERE id = posts.author_id
  )
  OR
  -- Everyone else can see public posts (but not author_id if anonymous)
  (is_removed = FALSE AND is_spam = FALSE)
);
```

### Testing RLS Policies

```sql
-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub = '<auth-user-uuid>';

-- Try queries
SELECT * FROM posts;  -- Should work (public posts)
SELECT * FROM aide_profiles;  -- Should only show own profile
SELECT * FROM agencies;  -- Should fail (no policy)

-- Reset
RESET ROLE;

-- Test as anonymous user
SET ROLE anon;

SELECT * FROM posts;  -- Should work (public posts)
SELECT * FROM aide_profiles;  -- Should fail (no policy)

RESET ROLE;
```

---

## Storage

### Storage Buckets

We use Supabase Storage for user-generated media:

```typescript
// Storage bucket configuration
const buckets = {
  avatars: {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,  // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  banners: {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,  // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  post_media: {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,  // 10MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
    ],
  },
  dm_attachments: {
    public: false,  // Private, requires auth
    fileSizeLimit: 10 * 1024 * 1024,  // 10MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'application/pdf',
    ],
  },
};
```

### Storage RLS Policies

```sql
-- avatars bucket: Anyone can read, users can upload their own
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

-- dm_attachments bucket: Private, auth required
CREATE POLICY "Users can only see their own DM attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dm_attachments'
  AND auth.uid() = owner
);
```

### Upload Example

```typescript
// Upload avatar
async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return publicUrl;
}
```

---

## Realtime

### Realtime Subscriptions

We use Supabase Realtime for live updates:

```typescript
// Subscribe to new posts in a community
const channel = supabase
  .channel('community_posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: `community_id=eq.${communityId}`,
    },
    (payload) => {
      console.log('New post:', payload.new);
      // Update UI with new post
      setPosts((prev) => [payload.new, ...prev]);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => {
  supabase.removeChannel(channel);
};
```

### Use Cases

1. **Live Feed Updates:**
    - New posts appear without refresh
    - New comments appear in real-time

2. **DM Notifications:**
    - Instant message delivery
    - Typing indicators

3. **Community Activity:**
    - Live user count
    - Active discussions

4. **Admin Dashboard:**
    - New leads appear instantly
    - Sales activity updates

### Performance Considerations

- Limit subscriptions to visible data only
- Use filters to reduce payload size
- Unsubscribe when component unmounts
- Consider using presence for user status

---

## Edge Functions

### When to Use Edge Functions

Use Edge Functions for:

1. **Webhooks:** External API callbacks
2. **Scheduled Tasks:** Cron jobs (daily stats)
3. **Complex Business Logic:** Multi-step operations
4. **External API Calls:** Third-party integrations
5. **Email Sending:** Transactional emails

### Example: Daily Stats Aggregation

```typescript
// supabase/functions/daily-stats/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  // Aggregate stats
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, created_at');
  
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('id, created_at, is_anonymous');
  
  // Insert into daily_community_stats
  const { error } = await supabaseAdmin
    .from('daily_community_stats')
    .insert({
      date: yesterday.toISOString().split('T')[0],
      total_users: users?.length || 0,
      new_users: users?.filter(u => 
        new Date(u.created_at).toDateString() === yesterday.toDateString()
      ).length || 0,
      total_posts: posts?.length || 0,
      new_posts: posts?.filter(p =>
        new Date(p.created_at).toDateString() === yesterday.toDateString()
      ).length || 0,
      anonymous_posts_created: posts?.filter(p =>
        new Date(p.created_at).toDateString() === yesterday.toDateString() &&
        p.is_anonymous
      ).length || 0,
    });
  
  return new Response(
    JSON.stringify({ success: !error, error }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Deploying Edge Functions

```bash
# Deploy function
supabase functions deploy daily-stats

# Set up cron schedule (in Supabase Dashboard)
# Schedule: 0 5 * * * (5 AM UTC daily)
```

---

## Client Integration

### Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server-Side Client (Next.js Server Actions)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### Admin Client (Service Role)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### Type-Safe Queries

```typescript
// Queries are fully typed thanks to database.types.ts
const { data: posts, error } = await supabase
  .from('posts')  // TypeScript knows this is the posts table
  .select('id, title, author:users(username, karma)')  // Autocomplete works!
  .eq('community_id', communityId)
  .order('created_at', { ascending: false })
  .limit(20);

// posts is typed as:
// { id: string; title: string; author: { username: string; karma: number } | null }[]
```

---

## Performance Optimization

### Query Optimization

1. **Use Indexes:**
   ```sql
   -- Index for feed queries
   CREATE INDEX idx_posts_community_created 
   ON posts(community_id, created_at DESC);
   
   -- Partial index for active posts
   CREATE INDEX idx_posts_active
   ON posts(created_at DESC)
   WHERE is_removed = FALSE AND is_spam = FALSE;
   ```

2. **Limit Result Sets:**
   ```typescript
   // Always paginate
   const { data } = await supabase
     .from('posts')
     .select('*')
     .range(0, 19);  // First 20 results
   ```

3. **Select Only Needed Columns:**
   ```typescript
   // Bad
   const { data } = await supabase
     .from('posts')
     .select('*');
   
   // Good
   const { data } = await supabase
     .from('posts')
     .select('id, title, created_at');
   ```

### Connection Pooling

Production configuration:

```toml
[db.pooler]
enabled = true
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

Use pooler for serverless functions:

```typescript
// Use pooler connection string
const DATABASE_URL = process.env.POOLER_URL;
```

### Caching Strategy

1. **React Query (Frontend):**
   ```typescript
   const { data: posts } = useQuery({
     queryKey: ['posts', communityId],
     queryFn: () => fetchPosts(communityId),
     staleTime: 60_000,  // Cache for 1 minute
   });
   ```

2. **Next.js Cache (Server):**
   ```typescript
   export const revalidate = 60;  // Revalidate every 60 seconds
   ```

3. **Database-Level (Materialized Views):**
   ```sql
   CREATE MATERIALIZED VIEW hot_posts AS
   SELECT * FROM posts
   WHERE created_at > NOW() - INTERVAL '7 days'
   ORDER BY score DESC;
   
   -- Refresh hourly via cron
   REFRESH MATERIALIZED VIEW CONCURRENTLY hot_posts;
   ```

---

## Security Best Practices

### 1. Never Expose Service Role Key

```typescript
// ❌ BAD - Service role key in client code
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER do this!
);

// ✅ GOOD - Service role only in server code
// app/admin/actions.ts (Server Action)
'use server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getAgencies() {
  const { data } = await supabaseAdmin
    .from('agencies')
    .select('*');
  return data;
}
```

### 2. Enable RLS on All Tables

```sql
-- ✅ GOOD
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...

-- ❌ BAD - No RLS, anyone can access
-- (Don't forget to enable RLS!)
```

### 3. Validate Input

```typescript
// ✅ GOOD
const title = input.title.trim().substring(0, 300);

const { error } = await supabase
  .from('posts')
  .insert({ title, author_id: user.id });

if (error) {
  // Handle constraint violations
}
```

### 4. Use Prepared Statements

Supabase automatically uses prepared statements, but avoid string interpolation:

```typescript
// ❌ BAD - SQL injection risk
const { data } = await supabase
  .rpc('search_posts', { query: userInput });  // If RPC doesn't sanitize

// ✅ GOOD - Use parameters
const { data } = await supabase
  .from('posts')
  .select('*')
  .ilike('title', `%${userInput}%`);  // Supabase sanitizes
```

### 5. Rate Limiting

Implement rate limiting for auth endpoints:

```toml
[auth.rate_limit]
email_sent = 2  # Max 2 emails per hour
sign_in_sign_ups = 30  # Max 30 sign-ins per 5 min per IP
```

---

## Monitoring & Debugging

### Query Performance

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT 
  mean_exec_time,
  calls,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Logs

View logs in Supabase Dashboard:
- **Database Logs:** Query performance, errors
- **API Logs:** Request/response logs
- **Realtime Logs:** Subscription events

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    return Response.json({
      status: 'healthy',
      database: { status: 'connected' },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      database: { status: 'disconnected', error: error.message },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

---

## Resources

### Official Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Declarative Schema Guide](https://supabase.com/docs/guides/local-development/declarative-schema)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [CLI Reference](https://supabase.com/docs/reference/cli)

### Internal Documentation

- `SCHEMA.md` - Complete schema reference
- `SETUP.md` - Setup instructions
- `README.md` - Project overview

---

**Integration Status:** ✅ Production Ready  
**Last Updated:** November 2025  
**Maintained By:** 10xR Engineering Team