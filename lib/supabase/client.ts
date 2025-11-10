// lib/supabase/client.ts
// Client-side Supabase instance for browser operations

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Supabase Client for Client-Side Operations
 *
 * This creates a Supabase client for use in React components and client-side code.
 * It automatically handles cookie-based authentication.
 *
 * Features:
 * - Automatic session management
 * - Cookie-based auth persistence
 * - Type-safe database queries
 * - Real-time subscriptions
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase/client';
 *
 * // Fetch data
 * const { data, error } = await supabase
 *   .from('posts')
 *   .select('*')
 *   .limit(10);
 *
 * // Subscribe to changes
 * supabase
 *   .channel('posts')
 *   .on('postgres_changes', {
 *     event: 'INSERT',
 *     schema: 'public',
 *     table: 'posts',
 *   }, (payload) => {
 *     console.log('New post:', payload);
 *   })
 *   .subscribe();
 * ```
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Export type-safe table helpers
 */
export const db = {
  users: () => supabase.from('users'),
  communities: () => supabase.from('communities'),
  posts: () => supabase.from('posts'),
  comments: () => supabase.from('comments'),
  votes: () => supabase.from('votes'),
  memberships: () => supabase.from('memberships'),
  follows: () => supabase.from('follows'),
  notifications: () => supabase.from('notifications'),
  reports: () => supabase.from('reports'),
  savedPosts: () => supabase.from('saved_posts'),
} as const;