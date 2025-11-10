// lib/supabase/server.ts
// Server-side Supabase instance for API routes and server components

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Supabase Server Client for Server-Side Operations
 *
 * This creates a Supabase client for use in:
 * - Server Components
 * - Server Actions
 * - Route Handlers (API routes)
 * - Middleware
 *
 * Features:
 * - Cookie-based authentication
 * - Automatic session refresh
 * - Type-safe database queries
 * - Service role access (admin operations)
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server';
 *
 * // In a Server Component or Server Action
 * export async function getPosts() {
 *   const supabase = await createClient();
 *
 *   const { data, error } = await supabase
 *     .from('posts')
 *     .select('*')
 *     .limit(10);
 *
 *   return data;
 * }
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

/**
 * Create a Supabase client for server-side operations
 *
 * This function creates a new client instance with cookie-based auth.
 * Call this in Server Components, Server Actions, or API routes.
 *
 * @returns Promise<SupabaseClient> - Type-safe Supabase client
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Handle errors in middleware or other contexts where cookies can't be set
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client with service role access
 *
 * WARNING: This bypasses Row Level Security (RLS)!
 * Only use for admin operations and background tasks.
 * Never expose this client to the frontend.
 *
 * @returns Promise<SupabaseClient> - Admin Supabase client
 */
export async function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );
}

/**
 * Get the current user from the session
 *
 * @returns Promise<User | null>
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session
 *
 * @returns Promise<Session | null>
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Type-safe table helpers for server-side operations
 */
export async function getDb() {
  const supabase = await createClient();

  return {
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
}