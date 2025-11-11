// lib/supabase/server.ts
// Server-side Supabase instance for API routes and server components
//
// Location: lib/supabase/server.ts
//
// This creates a Supabase client for use in:
// - Server Components
// - Server Actions
// - Route Handlers (API routes)
// - Middleware
//
// Features:
// - Cookie-based authentication
// - Automatic session refresh
// - Type-safe database queries
// - Service role access (admin operations)

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Validate required environment variables
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
 * Domain-specific database access helpers for server operations
 *
 * These provide convenient, type-safe access to domain entities on the server.
 * Use these instead of raw Supabase calls where possible.
 */

export class UserRepository {
  constructor(private supabase: ReturnType<typeof createServerClient>) {}

  async getOne(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getByUsername(username: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  async create(userData: Partial<Database['public']['Tables']['users']['Insert']>) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(userId: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMany(page: number = 1, limit: number = 20) {
    const start = (page - 1) * limit;
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;
    return data;
  }

  async search(query: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }
}

export class CommunityRepository {
  constructor(private supabase: ReturnType<typeof createServerClient>) {}

  async getOne(communityId: string) {
    const { data, error } = await this.supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('communities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  async create(communityData: Partial<Database['public']['Tables']['communities']['Insert']>) {
    const { data, error } = await this.supabase
      .from('communities')
      .insert([communityData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(communityId: string, updates: Partial<Database['public']['Tables']['communities']['Update']>) {
    const { data, error } = await this.supabase
      .from('communities')
      .update(updates)
      .eq('id', communityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMany(page: number = 1, limit: number = 20) {
    const start = (page - 1) * limit;
    const { data, error } = await this.supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;
    return data;
  }

  async search(query: string) {
    const { data, error } = await this.supabase
      .from('communities')
      .select('*')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }
}

export class PostRepository {
  constructor(private supabase: ReturnType<typeof createServerClient>) {}

  async getOne(postId: string) {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url, karma),
        community:communities(id, name, slug)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(postData: Database['public']['Tables']['posts']['Insert']) {
    const { data, error } = await this.supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(postId: string, updates: Partial<Database['public']['Tables']['posts']['Update']>) {
    const { data, error } = await this.supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getByCommunity(communityId: string, page: number = 1, limit: number = 20) {
    const start = (page - 1) * limit;
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url, karma),
        community:communities(id, name, slug)
      `)
      .eq('community_id', communityId)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;
    return data;
  }

  async getByAuthor(authorId: string, page: number = 1, limit: number = 20) {
    const start = (page - 1) * limit;
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url, karma),
        community:communities(id, name, slug)
      `)
      .eq('author_id', authorId)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;
    return data;
  }

  async search(query: string, limit: number = 20) {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        author:users(id, username, avatar_url, karma),
        community:communities(id, name, slug)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('is_removed', false)
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export class CommentRepository {
  constructor(private supabase: ReturnType<typeof createServerClient>) {}

  async getOne(commentId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        author:users(id, username, avatar_url, karma),
        post:posts(id, title)
      `)
      .eq('id', commentId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(commentData: Database['public']['Tables']['comments']['Insert']) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(commentId: string, updates: Partial<Database['public']['Tables']['comments']['Update']>) {
    const { data, error } = await this.supabase
      .from('comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getByPost(postId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        author:users(id, username, avatar_url, karma)
      `)
      .eq('post_id', postId)
      .eq('is_removed', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getByAuthor(authorId: string, limit: number = 20) {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        post:posts(id, title, community_id)
      `)
      .eq('author_id', authorId)
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export class CommunityMemberRepository {
  constructor(private supabase: ReturnType<typeof createServerClient>) {}

  async getOne(userId: string, communityId: string) {
    const { data, error } = await this.supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async getCommunitiesByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('memberships')
      .select(`
        community_id,
        role,
        communities(id, name, slug, icon_url)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async getByCommunity(communityId: string) {
    const { data, error } = await this.supabase
      .from('memberships')
      .select(`
        user_id,
        role,
        users(id, username, avatar_url)
      `)
      .eq('community_id', communityId);

    if (error) throw error;
    return data;
  }

  async join(userId: string, communityId: string) {
    const { data, error } = await this.supabase
      .from('memberships')
      .insert([{ user_id: userId, community_id: communityId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async leave(userId: string, communityId: string) {
    const { error } = await this.supabase
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .eq('community_id', communityId);

    if (error) throw error;
  }
}

export class AdminRepository {
  constructor(private supabase: ReturnType<typeof createServiceRoleClient>) {}

  /**
   * Ban a user
   */
  async banUser(userId: string, reason: string, duration?: number) {
    const bannedUntil = duration ? new Date(Date.now() + duration * 1000).toISOString() : null;

    const { data, error } = await this.supabase
      .from('users')
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_until: bannedUntil,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_until: null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove a post (by moderators/admins)
   */
  async removePost(postId: string, reason: string, removedBy: string) {
    const { data, error } = await this.supabase
      .from('posts')
      .update({
        is_removed: true,
        removed_reason: reason,
        removed_by: removedBy,
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Restore a removed post
   */
  async restorePost(postId: string) {
    const { data, error } = await this.supabase
      .from('posts')
      .update({
        is_removed: false,
        removed_reason: null,
        removed_by: null,
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending reports
   */
  async getPendingReports() {
    const { data, error } = await this.supabase
      .from('reports')
      .select(`
        *,
        reporter:users(id, username),
        post:posts(id, title),
        comment:comments(id, content)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Resolve a report
   */
  async resolveReport(reportId: string, resolution: string, note: string, resolvedBy: string) {
    const { data, error } = await this.supabase
      .from('reports')
      .update({
        status: resolution,
        resolution_note: note,
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Initialize repositories for server-side use
 *
 * Usage in server components or API routes:
 * ```typescript
 * import { getUserRepository, getCommunityRepository } from '@/lib/supabase/server';
 *
 * const userRepo = await getUserRepository();
 * const user = await userRepo.getOne(userId);
 * ```
 */
export async function getUserRepository() {
  const supabase = await createClient();
  return new UserRepository(supabase);
}

export async function getCommunityRepository() {
  const supabase = await createClient();
  return new CommunityRepository(supabase);
}

export async function getPostRepository() {
  const supabase = await createClient();
  return new PostRepository(supabase);
}

export async function getCommentRepository() {
  const supabase = await createClient();
  return new CommentRepository(supabase);
}

export async function getCommunityMemberRepository() {
  const supabase = await createClient();
  return new CommunityMemberRepository(supabase);
}

export async function getAdminRepository() {
  const supabase = await createServiceRoleClient();
  return new AdminRepository(supabase);
}