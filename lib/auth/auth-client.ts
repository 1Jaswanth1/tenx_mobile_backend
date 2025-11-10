// lib/auth/auth-client.ts
// BetterAuth client configuration for client-side authentication operations

import { createAuthClient } from 'better-auth/react';

/**
 * BetterAuth Client Configuration
 *
 * This file creates the auth client for client-side authentication operations.
 * Use this in React components, client-side hooks, and forms.
 *
 * Features:
 * - Sign up / Sign in / Sign out
 * - Session management
 * - User profile updates
 * - OAuth social authentication
 * - React hooks for reactive state
 *
 * Usage Examples:
 *
 * 1. Sign Up
 * ```typescript
 * import { authClient } from '@/lib/auth/auth-client';
 *
 * await authClient.signUp.email({
 *   email: 'user@example.com',
 *   password: 'secure-password',
 *   name: 'John Doe',
 * });
 * ```
 *
 * 2. Sign In
 * ```typescript
 * await authClient.signIn.email({
 *   email: 'user@example.com',
 *   password: 'secure-password',
 * });
 * ```
 *
 * 3. Social OAuth
 * ```typescript
 * await authClient.signIn.social({
 *   provider: 'google',
 *   callbackURL: '/dashboard',
 * });
 * ```
 *
 * 4. Get Session (React Hook)
 * ```typescript
 * import { useSession } from '@/lib/auth/auth-client';
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Welcome {session.user.name}!</div>;
 * }
 * ```
 *
 * 5. Sign Out
 * ```typescript
 * await authClient.signOut();
 * ```
 *
 * @see https://www.better-auth.com/docs/basic-usage
 */

export const authClient = createAuthClient({
  /**
   * Base URL for authentication endpoints
   * This should point to your Next.js API route that handles BetterAuth
   *
   * The API route is located at: /app/api/auth/[...all]/route.ts
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Fetch options
   * Configure how the client makes HTTP requests
   */
  fetchOptions: {
    credentials: 'include', // Include cookies in requests
  },
});

/**
 * Export individual methods for convenience
 * This allows you to import specific methods instead of the entire client
 *
 * Example usage:
 * import { signIn, signOut, useSession } from '@/lib/auth/auth-client';
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
} = authClient;

/**
 * Helper Hooks
 */

/**
 * Check if user is authenticated
 *
 * @returns boolean - True if user is authenticated
 *
 * Usage:
 * ```typescript
 * const isAuthenticated = useIsAuthenticated();
 * ```
 */
export function useIsAuthenticated() {
  const { data: session } = useSession();
  return !!session?.user;
}

/**
 * Get current user
 *
 * @returns User | null - Current user or null if not authenticated
 *
 * Usage:
 * ```typescript
 * const user = useCurrentUser();
 * if (!user) return <div>Not logged in</div>;
 * return <div>Welcome {user.name}!</div>;
 * ```
 */
export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user || null;
}

/**
 * Require authentication
 * Redirects to login if not authenticated
 *
 * Usage:
 * ```typescript
 * function ProtectedPage() {
 *   useRequireAuth();
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { data: session, isPending } = useSession();

  if (!isPending && !session?.user) {
    window.location.href = redirectTo;
  }

  return { session, isPending };
}

/**
 * Auth State Type
 * Use this for typing auth state in components
 */
export type AuthSession = NonNullable<
  ReturnType<typeof useSession>['data']
>;

export type AuthUser = NonNullable<AuthSession['user']>;