// lib/auth/auth-client.ts
// Better Auth Client Configuration for React
//
// This file creates the auth client for client-side authentication operations
// with support for Google, Facebook, and username/password authentication.

import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client Configuration
 *
 * This client provides authentication functionality for:
 * - Email/Password sign up and sign in
 * - Google OAuth
 * - Facebook OAuth
 * - Session management
 * - User profile updates
 * - React hooks for reactive state
 *
 * Usage Examples:
 *
 * 1. Email/Password Sign Up
 * ```typescript
 * import { authClient } from '@/lib/auth/auth-client';
 *
 * await authClient.signUp.email({
 *   email: 'user@example.com',
 *   password: 'secure-password',
 *   name: 'John Doe',
 *   username: 'johndoe',
 * });
 * ```
 *
 * 2. Email/Password Sign In
 * ```typescript
 * await authClient.signIn.email({
 *   email: 'user@example.com',
 *   password: 'secure-password',
 * });
 * ```
 *
 * 3. Google OAuth
 * ```typescript
 * await authClient.signIn.social({
 *   provider: 'google',
 *   callbackURL: '/dashboard',
 * });
 * ```
 *
 * 4. Facebook OAuth
 * ```typescript
 * await authClient.signIn.social({
 *   provider: 'facebook',
 *   callbackURL: '/dashboard',
 * });
 * ```
 *
 * 5. Get Session (React Hook)
 * ```typescript
 * import { useSession } from '@/lib/auth/auth-client';
 *
 * function MyComponent() {
 *   const { data: session, isPending, error } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Welcome {session.user.name}!</div>;
 * }
 * ```
 *
 * 6. Sign Out
 * ```typescript
 * await authClient.signOut();
 * ```
 *
 * @see https://www.better-auth.com/docs/basic-usage
 */

export const authClient = createAuthClient({
  /**
   * Base URL for authentication endpoints
   * Points to Next.js API route that handles Better Auth
   *
   * The API route is located at: /app/api/auth/[...all]/route.ts
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Fetch Configuration
   * Configure how the client makes HTTP requests
   */
  fetchOptions: {
    /**
     * Include credentials (cookies) in all requests
     * Required for cookie-based authentication
     */
    credentials: 'include',

    /**
     * Default headers for all requests
     */
    headers: {
      'Content-Type': 'application/json',
    },

    /**
     * Request timeout (30 seconds)
     */
    timeout: 30000,

    /**
     * Retry configuration for failed requests
     */
    retry: {
      attempts: 3,
      delay: 1000, // 1 second
      statusCodes: [408, 429, 500, 502, 503, 504], // Retry on these status codes
    },
  },
});

/**
 * Export individual methods for convenience
 * Allows importing specific methods instead of entire client
 *
 * Example:
 * import { signIn, signOut, useSession } from '@/lib/auth/auth-client';
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changeEmail,
  changePassword,
  linkSocial,
  unlinkAccount,
  deleteUser,
} = authClient;

/**
 * Helper Hooks
 * Convenient hooks for common authentication patterns
 */

/**
 * Check if user is authenticated
 *
 * @returns boolean - True if user is authenticated
 *
 * Usage:
 * ```typescript
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) {
 *   return <LoginPrompt />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
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
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }

  return { session, isPending };
}

/**
 * Authentication Error Handler
 * Standardized error handling for auth operations
 *
 * Usage:
 * ```typescript
 * const { error } = await authClient.signIn.email({...});
 * if (error) {
 *   handleAuthError(error);
 * }
 * ```
 */
export function handleAuthError(error: any) {
  const errorMessages: Record<string, string> = {
    USER_ALREADY_EXISTS: 'An account with this email already exists.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_NOT_FOUND: 'No account found with this email.',
    EMAIL_NOT_VERIFIED: 'Please verify your email before signing in.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    ACCOUNT_BANNED: 'Your account has been banned.',
    PASSWORD_TOO_WEAK: 'Password is too weak. Please use a stronger password.',
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  const message = errorMessages[error.code] || errorMessages.UNKNOWN_ERROR;
  return message;
}

/**
 * Social Provider Configuration
 * Helper to get provider-specific settings
 */
export const socialProviders = {
  google: {
    name: 'Google',
    icon: 'google',
    color: '#DB4437',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
  },
} as const;

/**
 * Form Validation Helpers
 * Client-side validation for authentication forms
 */

export const validation = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * Minimum 8 characters, at least one uppercase, one lowercase, one number
   */
  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long.' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }

    return { valid: true };
  },

  /**
   * Validate username
   * Alphanumeric, underscores, hyphens only. 3-30 characters.
   */
  username: (username: string): { valid: boolean; message?: string } => {
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters long.' };
    }

    if (username.length > 30) {
      return { valid: false, message: 'Username must be no more than 30 characters.' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens.' };
    }

    return { valid: true };
  },
};

/**
 * Auth State Type Definitions
 * Use these for typing auth state in components
 */
export type AuthSession = NonNullable<ReturnType<typeof useSession>['data']>;
export type AuthUser = NonNullable<AuthSession['user']>;
export type AuthError = { code: string; message: string };

/**
 * Authentication Status Enum
 * Use for conditional rendering based on auth state
 */
export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

/**
 * Get current authentication status
 *
 * Usage:
 * ```typescript
 * const status = useAuthStatus();
 *
 * switch (status) {
 *   case AuthStatus.LOADING:
 *     return <Spinner />;
 *   case AuthStatus.AUTHENTICATED:
 *     return <Dashboard />;
 *   case AuthStatus.UNAUTHENTICATED:
 *     return <LoginPage />;
 *   case AuthStatus.ERROR:
 *     return <ErrorMessage />;
 * }
 * ```
 */
export function useAuthStatus(): AuthStatus {
  const { data: session, isPending, error } = useSession();

  if (isPending) return AuthStatus.LOADING;
  if (error) return AuthStatus.ERROR;
  if (session?.user) return AuthStatus.AUTHENTICATED;
  return AuthStatus.UNAUTHENTICATED;
}