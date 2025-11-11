# 10xR Community Platform - Complete Development Guide

**Version:** 2.1  
**Last Updated:** November 2025  
**Status:** Production Ready with Declarative Schemas

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Architecture](#database-architecture)
4. [Supabase Client Integration](#supabase-client-integration)
5. [Local Development Workflow](#local-development-workflow)
6. [Database Schema Management](#database-schema-management)
7. [Domain Entities & Usage](#domain-entities--usage)
8. [Testing](#testing)
9. [Type Generation](#type-generation)
10. [Troubleshooting](#troubleshooting)

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
├── lib/
│   └── supabase/           # Supabase client integration
│       ├── types.ts        # Auto-generated database types
│       ├── client.ts       # Browser client with domain entities
│       └── server.ts       # Server client with repositories
│
├── supabase/
│   ├── config.toml         # Supabase configuration
│   ├── seed.sql            # Seed data for local dev
│   ├── migrations/         # Generated migration files (auto-created)
│   └── schemas/            # Declarative schema files
│       ├── 01_auth.sql     # Better Auth tables
│       ├── 02_types.sql    # Custom ENUM types
│       ├── 03_community_core.sql  # Users, communities, memberships
│       ├── 04_content.sql  # Posts, comments, votes
│       ├── 05_engagement.sql      # Saved posts, follows, notifications
│       ├── 06_messaging.sql       # Direct messages
│       ├── 07_b2b_sales.sql       # Agencies, aide profiles
│       ├── 08_analytics.sql       # Activity logs, stats
│       └── 09_functions.sql       # Triggers and functions
│
├── app/
│   └── actions/            # Server actions using domain repositories
│
└── docs/
    ├── LOCAL_SETUP.md      # This file
    └── SCHEMA_GUIDE.md     # Schema documentation
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

### Step 6: Generate TypeScript Types

```bash
# Add to package.json scripts
"db:types": "supabase gen types typescript --local > lib/supabase/types.ts"

# Generate types
npm run db:types
```

This creates `lib/supabase/types.ts` with full type definitions for your database.

### Step 7: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# .env.local

# Supabase (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-step-4>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-step-4>

# Database URL (for Better Auth)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Better Auth
BETTER_AUTH_SECRET=your-local-secret-key-here
BETTER_AUTH_URL=http://localhost:3000/api/auth

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🏗️ Database Architecture

### The Three-Layer System

Our architecture uses a **decoupled identity system** with three distinct layers:

```
┌─────────────────────────────────────────┐
│   Layer 1: Better Auth (Security)       │
│   ├── auth_users (UUID primary key)     │
│   ├── auth_sessions                     │
│   ├── auth_accounts (OAuth)             │
│   ├── auth_verification_tokens          │
│   └── auth_two_factor                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Layer 2: Community (The "Bait")       │
│   ├── users (anonymous identity)        │
│   ├── communities (subreddits)          │
│   ├── posts (is_anonymous flag)         │
│   ├── comments (nested threading)       │
│   ├── votes (engagement)                │
│   ├── memberships (flair_text)          │
│   ├── notifications                     │
│   ├── direct_messages (DMs)             │
│   └── saved_posts, follows, reports     │
└─────────────────────────────────────────┘
              ↓
    [THE BRIDGE: aide_profiles]
              ↓
┌─────────────────────────────────────────┐
│   Layer 3: B2B Sales (The "Payload")    │
│   ├── agencies (CRM target list)        │
│   ├── aide_profiles (user → agency)     │
│   ├── agency_leads (inbound funnel)     │
│   ├── evangelist_rewards ($1K)          │
│   └── sales_activities (CRM log)        │
└─────────────────────────────────────────┘
```

### Key Strategic Features

| Feature | Database Implementation | Business Impact |
|---------|-------------------------|-----------------|
| **Catharsis Engine** | `posts.is_anonymous = TRUE` | Drive acquisition from Facebook |
| **Data Engine** | `memberships.flair_text` | Collect role data voluntarily |
| **Sales Engine** | `direct_messages` | Activate evangelists privately |
| **Data Bomb** | `aide_profiles` bridge | "94 of your staff are here" |

---

## 🔌 Supabase Client Integration

### Architecture: Domain-Driven Design

Instead of generic database operations, we use **domain-specific entities**:

```typescript
// ❌ Old way (generic)
const { data } = await supabase.from('users').select('*');

// ✅ New way (domain-driven)
const users = await db.users.getMany();
const user = await db.users.getOne(userId);
```

### Client Types

| Client | Use For | Import From |
|--------|---------|-------------|
| **Browser Client** | React components, client-side | `lib/supabase/client.ts` |
| **Server Client** | Server components, API routes | `lib/supabase/server.ts` |
| **Service Role** | Admin operations (bypasses RLS) | `createServiceRoleClient()` |

### Setup Domain Clients

The client integration files (`lib/supabase/client.ts` and `lib/supabase/server.ts`) provide:

1. **Type-Safe Operations** - Full TypeScript support
2. **Clean API** - Organized methods per domain
3. **RLS Compliance** - Respects Row Level Security
4. **Real-time Support** - Built-in subscriptions

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

### Quick Commands Reference

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

# Type Generation
npm run db:types              # Generate TypeScript types

# Database Access
supabase db push              # Push migrations to remote (production)
supabase db pull              # Pull migrations from remote
supabase db dump              # Dump current schema to SQL file

# Studio & Logs
open http://localhost:54323   # Open Supabase Studio
supabase logs                 # View all logs
supabase logs -f postgres     # Follow Postgres logs
```

---

## 🗄️ Database Schema Management

### Making Schema Changes with Declarative Schemas

We use **declarative schemas** - you edit schema files, and migrations are auto-generated.

#### Scenario 1: Adding a Column

1. **Edit the schema file**
   ```bash
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

   Creates: `supabase/migrations/<timestamp>_add_phone_to_users.sql`

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

5. **Update types**
   ```bash
   npm run db:types
   ```

6. **Verify in Studio**
    - Check that the `phone` column exists in the `users` table

#### Scenario 2: Creating a New Table

1. **Create new schema file**
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

2. **Update `config.toml`**
   ```toml
   [db.migrations]
   schema_paths = [
     "./schemas/01_auth.sql",
     # ... existing files ...
     "./schemas/09_functions.sql",
     "./schemas/10_user_preferences.sql",  # 👈 ADD THIS
   ]
   ```

3. **Generate and apply migration**
   ```bash
   supabase db diff -f create_user_preferences
   supabase migration up
   npm run db:types
   ```

#### Scenario 3: Rolling Back (Local Only)

```bash
# Reset to specific migration
supabase db reset --version <timestamp>

# Or reset to clean state
supabase db reset
```

**Warning:** Only reset locally! Never reset production.

---

## 🎯 Domain Entities & Usage

### Browser Client (Client Components)

Use in React components for client-side operations:

```typescript
import { db } from '@/lib/supabase/client';

// Users Domain
const user = await db.users.getOne(userId);
const userByUsername = await db.users.getByUsername(username);
const users = await db.users.getMany(page, limit);
const searchResults = await db.users.search(query);
const topUsers = await db.users.getTopByKarma(limit);

// Communities Domain
const community = await db.communities.getOne(communityId);
const communityBySlug = await db.communities.getBySlug(slug);
const communities = await db.communities.getMany(page, limit);
const trending = await db.communities.getTrending(limit);
const searchResults = await db.communities.search(query);

// Posts Domain
const post = await db.posts.getOne(postId);
const communityPosts = await db.posts.getByCommunity(communityId, page, limit);
const userPosts = await db.posts.getByAuthor(authorId, page, limit);
const hotPosts = await db.posts.getHot(communityId, limit);
const recentPosts = await db.posts.getRecent(limit);
const searchResults = await db.posts.search(query, limit);

// Comments Domain
const comment = await db.comments.getOne(commentId);
const postComments = await db.comments.getByPost(postId, limit);
const replies = await db.comments.getReplies(parentId, limit);
const userComments = await db.comments.getByAuthor(authorId, limit);

// Votes Domain
const userVote = await db.votes.getByUser(userId, votableId, 'post');
const allVotes = await db.votes.getByUserId(userId);

// Memberships Domain
const membership = await db.memberships.getOne(userId, communityId);
const userCommunities = await db.memberships.getCommunitiesByUser(userId);
const communityMembers = await db.memberships.getByCommunity(communityId);

// Notifications Domain
const unread = await db.notifications.getUnread(userId, limit);
const all = await db.notifications.getByUser(userId, limit);
await db.notifications.markAsRead(notificationId);

// Real-time Subscriptions
db.realtime.onNewPost(communityId, (post) => {
  console.log('New post:', post);
});
```

### Server Client (Server Components & Actions)

Use repositories for server-side operations:

```typescript
import {
  getUserRepository,
  getCommunityRepository,
  getPostRepository,
  getCommentRepository,
  getCommunityMemberRepository,
  getAdminRepository,
  getCurrentUser,
  getSession,
} from '@/lib/supabase/server';

// Authentication
const user = await getCurrentUser();
const session = await getSession();

// User Repository
const userRepo = await getUserRepository();
const user = await userRepo.getOne(userId);
const user = await userRepo.getByUsername(username);
await userRepo.create({ email, username });
await userRepo.update(userId, { bio });

// Community Repository
const communityRepo = await getCommunityRepository();
const community = await communityRepo.getOne(communityId);
await communityRepo.create({ name, slug, created_by });
await communityRepo.update(communityId, { description });

// Post Repository
const postRepo = await getPostRepository();
const post = await postRepo.getOne(postId);
await postRepo.create({ title, content, author_id, community_id });
await postRepo.update(postId, { title, content });

// Comment Repository
const commentRepo = await getCommentRepository();
const comment = await commentRepo.getOne(commentId);
await commentRepo.create({ content, author_id, post_id });

// Membership Repository
const memberRepo = await getCommunityMemberRepository();
await memberRepo.join(userId, communityId);
await memberRepo.leave(userId, communityId);

// Admin Repository (requires service_role)
const adminRepo = await getAdminRepository();
await adminRepo.banUser(userId, 'spam', 3600);
await adminRepo.removePost(postId, 'violates rules', adminId);
```

---

## 📚 Complete Usage Examples

### Example 1: User Profile Page (Client Component)

```typescript
// app/profile/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase/client';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get user by username
        const userData = await db.users.getByUsername(params.username);
        setUser(userData);

        // Get user's posts
        const userPosts = await db.posts.getByAuthor(userData.id);
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [params.username]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.display_name}</h1>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
      <p>Karma: {user.karma}</p>

      <h2>Posts</h2>
      {posts?.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Create Post (Server Action)

```typescript
// app/actions/posts.ts
'use server';

import { getPostRepository, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createPost(
  title: string,
  content: string,
  communityId: string,
  isAnonymous: boolean = false
) {
  // Get current user
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Create post
  const postRepo = await getPostRepository();
  const post = await postRepo.create({
    title,
    content,
    author_id: user.id,
    community_id: communityId,
    content_type: 'text',
    is_anonymous: isAnonymous,  // 👈 Catharsis Engine
  });

  return post;
}
```

### Example 3: Join Community (Server Action)

```typescript
// app/actions/communities.ts
'use server';

import {
  getCommunityMemberRepository,
  getCurrentUser,
} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function joinCommunity(
  communityId: string,
  flairText?: string
) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const memberRepo = await getCommunityMemberRepository();
  await memberRepo.join(user.id, communityId);
  
  // Set flair if provided (Data Engine)
  if (flairText) {
    // Update membership with flair
    // This will be in your membership repo methods
  }
}
```

### Example 4: Real-Time Feed (Client Component)

```typescript
// components/live-feed.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase/client';

export function LiveFeed({ communityId }: { communityId: string }) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    // Load initial posts
    const loadPosts = async () => {
      const data = await db.posts.getByCommunity(communityId);
      setPosts(data);
    };

    loadPosts();

    // Subscribe to new posts
    const subscription = db.realtime.onNewPost(communityId, (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [communityId]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p className="text-sm text-gray-500">
            {post.is_anonymous ? (
              <span>by AnonymousAide</span>
            ) : (
              <span>by {post.author.username}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Example 5: Admin Moderation (Server Action)

```typescript
// app/actions/admin.ts
'use server';

import { getAdminRepository, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function banUserAction(
  userId: string,
  reason: string,
  durationSeconds: number = 3600
) {
  const admin = await getCurrentUser();
  if (!admin) redirect('/login');

  // TODO: Verify admin permissions
  
  const adminRepo = await getAdminRepository();
  await adminRepo.banUser(userId, reason, durationSeconds);
}

export async function removePostAction(
  postId: string,
  reason: string
) {
  const admin = await getCurrentUser();
  if (!admin) redirect('/login');

  const adminRepo = await getAdminRepository();
  await adminRepo.removePost(postId, reason, admin.id);
}
```

---

## 🧪 Testing

### Test User Accounts

The seed data creates three test accounts (password: `password123`):

| Email | Username | Role | Karma |
|-------|----------|------|-------|
| `aide1@test.com` | `test_aide_1` | CNA - 3 Yrs | 150 |
| `nurse1@test.com` | `experienced_rn` | RN - 10 Yrs | 500 |
| `don1@test.com` | `director_johnson` | DON - 20 Yrs | 1000 |

### Manual Testing Flow

1. **Test Authentication**
   ```bash
   # Open your app
   http://localhost:3000/login
   
   # Login with test account
   Email: aide1@test.com
   Password: password123
   ```

2. **Test Community Features**
    - Join a community (s/aides)
    - Set flair ("CNA - 3 Yrs")
    - Create a post
    - Create an anonymous post
    - Comment on posts
    - Vote on content

3. **Test Database Queries**
   ```sql
   -- In Supabase Studio SQL Editor
   
   -- Check anonymous posts
   SELECT title, is_anonymous, author_id 
   FROM posts 
   WHERE is_anonymous = TRUE;
   
   -- Check user flairs
   SELECT u.username, m.flair_text, c.name as community
   FROM memberships m
   JOIN users u ON m.user_id = u.id
   JOIN communities c ON m.community_id = c.id;
   
   -- Check karma updates
   SELECT username, karma 
   FROM users 
   ORDER BY karma DESC;
   ```

---

## 🔧 Type Generation

### Auto-Generate Types

Setup the script in `package.json`:

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --local > lib/supabase/types.ts"
  }
}
```

Run after any schema changes:

```bash
npm run db:types
```

### Manual Type Updates

If CLI doesn't work:

1. Go to Supabase Studio → Settings → API
2. Copy "Type Definitions"
3. Paste into `lib/supabase/types.ts`

---

## 🐛 Troubleshooting

### Issue 1: Supabase Won't Start

**Symptom:** `supabase start` fails

**Solutions:**
```bash
# 1. Ensure Docker is running
docker ps

# 2. Stop and reset
supabase stop
supabase db reset

# 3. Nuclear option
supabase stop --no-backup
docker system prune -a --volumes
supabase start
```

### Issue 2: Schema Changes Not Applied

**Symptom:** Changes don't appear in database

**Solutions:**
```bash
# Generate new migration
supabase db diff -f my_changes

# Apply migrations
supabase migration up

# Update types
npm run db:types

# Or reset completely (local only)
supabase db reset
```

### Issue 3: Type Errors

**Symptom:** TypeScript errors in domain client usage

**Solutions:**
```bash
# Regenerate types
npm run db:types

# Restart TypeScript server in VSCode
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue 4: RLS Blocking Queries

**Symptom:** "new row violates row-level security policy"

**Solutions:**
```typescript
// For admin operations, use service role
import { createServiceRoleClient } from '@/lib/supabase/server';

const adminClient = createServiceRoleClient();
// This bypasses RLS
```

### Issue 5: Port Already in Use

**Symptom:** "Port 54321 is already allocated"

**Solutions:**
```bash
# Stop Supabase
supabase stop

# Check port usage
lsof -i :54321

# Kill process
kill -9 <PID>

# Restart
supabase start
```

### Issue 6: Missing Environment Variables

**Symptom:** "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Solutions:**
```bash
# Check .env.local exists
cat .env.local

# Restart dev server
npm run dev
```

---

## 📚 Additional Resources

### Supabase Documentation
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Declarative Schemas](https://supabase.com/docs/guides/cli/declarative-database-schemas)
- [Database Migrations](https://supabase.com/docs/guides/cli/managing-environments)

### Better Auth Documentation
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Next.js Integration](https://www.better-auth.com/docs/integrations/next-js)

### Internal Documentation
- [Schema Guide](./SCHEMA_GUIDE.md) - Database architecture deep dive
- [Architecture Doc](../ARCHITECTURE.md) - System design overview

---

## ✨ Best Practices

### 1. Use Server Components for Data Loading

```typescript
// ✅ Good - Server Component
async function UserProfile({ userId }: { userId: string }) {
  const userRepo = await getUserRepository();
  const user = await userRepo.getOne(userId);
  return <div>{user.display_name}</div>;
}

// ❌ Avoid - Client Component with useEffect
'use client';
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Loading in client component
  }, []);
}
```

### 2. Handle Errors Gracefully

```typescript
try {
  const user = await db.users.getOne(userId);
} catch (error: any) {
  if (error.code === 'PGRST116') {
    console.error('User not found');
  } else {
    console.error('Database error:', error);
  }
}
```

### 3. Validate Authentication

```typescript
export async function protectedAction() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  // Proceed
}
```

### 4. Use Domain Methods Over Raw Queries

```typescript
// ✅ Good - Domain method
const posts = await db.posts.getByCommunity(communityId);

// ❌ Avoid - Raw query
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('community_id', communityId);
```

---

## 🎯 Next Steps

Once your local environment is set up:

1. ✅ **Verify Setup** - All tables created, seed data loaded
2. ✅ **Generate Types** - Run `npm run db:types`
3. ✅ **Test Domain Clients** - Try the usage examples above
4. ⏭️ **Build Features** - Start building your first feature
5. ⏭️ **Extend Schema** - Add new tables using declarative schemas
6. ⏭️ **Deploy to Production** - When ready, push to Supabase cloud

---

**Version:** 2.1  
**Last Updated:** November 2025  
**Status:** ✅ Production Ready with Domain-Driven Architecture

**Happy coding! 🚀**