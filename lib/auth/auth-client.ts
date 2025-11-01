import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client Configuration
 * 
 * This file creates the auth client for client-side authentication operations.
 * Use this in React components, client-side hooks, and forms.
 * 
 * Features:
 * - Sign up / Sign in / Sign out
 * - Session management
 * - User profile updates
 * - OAuth social authentication
 * 
 * @see https://www.better-auth.com/docs/basic-usage
 */

export const authClient = createAuthClient({
  /**
   * Base URL for authentication endpoints
   * This should point to your Next.js API route that handles Better Auth
   * 
   * If running on the same domain, you can omit this or use a relative path
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Export individual methods for convenience
 * This allows you to import specific methods instead of the entire client
 * 
 * Example usage:
 * import { signIn, signOut, useSession } from "@/lib/auth/auth-client";
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
