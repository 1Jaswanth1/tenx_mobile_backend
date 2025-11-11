# Supabase Domain-Based Architecture Guide

> Complete guide to using the refactored Supabase clients with domain-specific entities

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Client Setup](#client-setup)
4. [Domain Entities](#domain-entities)
5. [Usage Examples](#usage-examples)
6. [Type Generation](#type-generation)

---

## Overview

The Supabase integration now uses a **domain-driven** approach instead of generic database operations. This means:

- ✅ **Functional Entities**: Users, Communities, Posts, Comments, Admins (not generic database tables)
- ✅ **Type-Safe Operations**: Full TypeScript support with auto-generated types
- ✅ **Clean API**: Organized methods for each domain entity
- ✅ **Server & Client**: Separate implementations for different contexts

### Why Domain-Driven?

```typescript
// ❌ Old way (generic)
const { data } = await supabase.from('users').select('*');

// ✅ New way (domain-driven)
const users = await db.users.getMany();
const user = await db.users.getOne(userId);
```

---

## Architecture

### File Structure

```
lib/supabase/
├── types.ts              # Auto-generated database types
├── client.ts             # Browser client with domain entities
└── server.ts             # Server client with repositories
```

### Client Types

| Client | Use For | Location |
|--------|---------|----------|
| **Browser Client** | React components, client-side logic | `lib/supabase/client.ts` |
| **Server Client** | API routes, server components, server actions | `lib/supabase/server.ts` |
| **Service Role** | Admin operations, bypasses RLS | `createServiceRoleClient()` |

---

## Client Setup

### 1. Generate Types from Supabase

First, get the types from your Supabase schema:

```bash
# Update this command with your project ID
pnpm db:types

# Or run manually:
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

**Alternative: Manually create types file**

If CLI doesn't work, use the generated `lib/supabase/types.ts` file provided in this guide.

### 2. Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Verify Installation

Create a test file:

```typescript
// lib/supabase/__test__.ts
import { supabase, db } from './client';

console.log('Client initialized:', !!supabase);
console.log('DB methods:', Object.keys(db));
```

---

## Domain Entities

### Browser Client (Client-Side)

Use these in React components:

```typescript
import { db } from '@/lib/supabase/client';

// Users Domain
await db.users.getOne(userId);
await db.users.getByUsername(username);
await db.users.getMany(page, limit);
await db.users.search(query);
await db.users.getTopByKarma(limit);

// Communities Domain
await db.communities.getOne(communityId);
await db.communities.getBySlug(slug);
await db.communities.getMany(page, limit);
await db.communities.getTrending(limit);
await db.communities.search(query);

// Posts Domain
await db.posts.getOne(postId);
await db.posts.getByCommunity(communityId, page, limit);
await db.posts.getByAuthor(authorId, page, limit);
await db.posts.getHot(communityId, limit);
await db.posts.getRecent(limit);
await db.posts.search(query, limit);

// Comments Domain
await db.comments.getOne(commentId);
await db.comments.getByPost(postId, limit);
await db.comments.getReplies(parentId, limit);
await db.comments.getByAuthor(authorId, limit);

// Votes Domain
await db.votes.getByUser(userId, votableId, 'post' | 'comment');
await db.votes.getByUserId(userId);

// Memberships Domain
await db.memberships.getOne(userId, communityId);
await db.memberships.getCommunitiesByUser(userId);
await db.memberships.getByCommunit(communityId);

// Notifications Domain
await db.notifications.getUnread(userId, limit);
await db.notifications.getByUser(userId, limit);
await db.notifications.markAsRead(notificationId);

// Reports Domain
await db.reports.getPending();
await db.reports.getByReporter(reporterId);

// Real-time Subscriptions
db.realtime.onNewPost(communityId, (post) => {
  console.log('New post:', post);
});
```

### Server Client (Server-Side)

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

// Get current user
const user = await getCurrentUser();
const session = await getSession();

// User Operations
const userRepo = await getUserRepository();
await userRepo.getOne(userId);
await userRepo.getByUsername(username);
await userRepo.create({ email, username });
await userRepo.update(userId, { bio });
await userRepo.search(query);

// Community Operations
const communityRepo = await getCommunityRepository();
await communityRepo.getOne(communityId);
await communityRepo.getBySlug(slug);
await communityRepo.create({ name, slug, created_by });
await communityRepo.update(communityId, { description });
await communityRepo.search(query);

// Post Operations
const postRepo = await getPostRepository();
await postRepo.getOne(postId);
await postRepo.create({ title, content, author_id, community_id });
await postRepo.update(postId, { title, content });
await postRepo.getByCommunity(communityId, page, limit);
await postRepo.getByAuthor(authorId, page, limit);

// Comment Operations
const commentRepo = await getCommentRepository();
await commentRepo.getOne(commentId);
await commentRepo.create({ content, author_id, post_id });
await commentRepo.update(commentId, { content });
await commentRepo.getByPost(postId);

// Community Membership
const memberRepo = await getCommunityMemberRepository();
await memberRepo.getOne(userId, communityId);
await memberRepo.getCommunitiesByUser(userId);
await memberRepo.getByCommunity(communityId);
await memberRepo.join(userId, communityId);
await memberRepo.leave(userId, communityId);

// Admin Operations (requires service role key)
const adminRepo = await getAdminRepository();
await adminRepo.banUser(userId, 'spam', 3600); // Ban for 1 hour
await adminRepo.unbanUser(userId);
await adminRepo.removePost(postId, 'violates rules', currentUserId);
await adminRepo.restorePost(postId);
await adminRepo.getPendingReports();
await adminRepo.resolveReport(reportId, 'resolved', 'action taken', currentUserId);
```

---

## Usage Examples

### Example 1: Fetch User Profile (Client Component)

```typescript
// app/profile/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase/client';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
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

### Example 2: Create a Post (Server Action)

```typescript
// app/actions/posts.ts
'use server';

import { getPostRepository, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createPost(
  title: string,
  content: string,
  communityId: string
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
  });

  return post;
}
```

### Example 3: Join a Community (Server Action)

```typescript
// app/actions/communities.ts
'use server';

import {
  getCommunityMemberRepository,
  getCurrentUser,
} from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function joinCommunity(communityId: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const memberRepo = await getCommunityMemberRepository();
  await memberRepo.join(user.id, communityId);
}

export async function leaveCommunity(communityId: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const memberRepo = await getCommunityMemberRepository();
  await memberRepo.leave(user.id, communityId);
}
```

### Example 4: Real-Time Feed Updates (Client Component)

```typescript
// components/live-feed.tsx
'use client';

import { useEffect, useState } from 'react';
import { db, realtime } from '@/lib/supabase/client';

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
            by {post.author.username} in {post.community.name}
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

export async function banUserAction(userId: string, reason: string) {
  const admin = await getCurrentUser();
  if (!admin) redirect('/login');

  // TODO: Check if user is admin
  
  const adminRepo = await getAdminRepository();
  await adminRepo.banUser(userId, reason, 3600); // 1 hour
}

export async function removePostAction(
  postId: string,
  reason: string
) {
  const admin = await getCurrentUser();
  if (!admin) redirect('/login');

  // TODO: Check if user is moderator/admin

  const adminRepo = await getAdminRepository();
  await adminRepo.removePost(postId, reason, admin.id);
}
```

---

## Type Generation

### Auto-Generate Types from Supabase

The `lib/supabase/types.ts` file should be auto-generated whenever your schema changes.

**Setup once:**

```bash
# Add to package.json scripts
"db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts"
```

**Run before each deployment:**

```bash
pnpm db:types
```

### Manual Type Updates

If CLI doesn't work, you can:

1. Go to your Supabase dashboard
2. Click "Settings" → "API"
3. Copy the TypeScript types from "Type Definitions"
4. Paste into `lib/supabase/types.ts`

---

## Best Practices

### 1. Use Server Components for Data Loading

```typescript
// ✅ Good
async function UserProfile({ userId }: { userId: string }) {
  const userRepo = await getUserRepository();
  const user = await userRepo.getOne(userId);

  return <div>{user.display_name}</div>;
}

// ❌ Bad
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

### 3. Validate User Authentication

```typescript
export async function protectedAction() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Proceed with operation
}
```

### 4. Use Transactions for Multiple Operations

```typescript
// For related operations, consider using Supabase transactions
const postRepo = await getPostRepository();
const post = await postRepo.create({...});

const memberRepo = await getCommunityMemberRepository();
if (!(await memberRepo.getOne(userId, communityId))) {
  await memberRepo.join(userId, communityId);
}
```

---

## Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Solution**: Check `.env.local` has correct environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Error: "Cannot find module 'lib/supabase/types'"

**Solution**: Generate types file

```bash
pnpm db:types
```

Or copy the provided `lib/supabase/types.ts` file.

### Error: "User is not authenticated"

**Solution**: Ensure user is logged in before calling protected methods

```typescript
const user = await getCurrentUser();
if (!user) {
  redirect('/login');
}
```

### Real-time subscriptions not working

**Solution**: Ensure Realtime is enabled in Supabase settings

1. Go to Supabase Dashboard
2. Click "Realtime" in sidebar
3. Enable for your tables

---

## Next Steps

1. ✅ Generate types: `pnpm db:types`
2. ✅ Copy client files to your project
3. ✅ Update environment variables
4. ✅ Test with the examples above
5. ✅ Build your features using the domain entities

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Documentation**: Complete