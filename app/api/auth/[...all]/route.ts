// app/api/auth/[...all]/route.ts
// Better Auth API Route Handler for Next.js
//
// This catch-all route handles all Better Auth API requests for:
// - Email/Password authentication
// - Google OAuth
// - Facebook OAuth
// - Session management
// - User operations

import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth/auth-server';

/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all Better Auth API requests.
 *
 * Endpoints handled:
 *
 * Authentication:
 * - POST /api/auth/sign-up/email          Sign up with email/password
 * - POST /api/auth/sign-in/email          Sign in with email/password
 * - POST /api/auth/sign-out               Sign out
 * - GET  /api/auth/session                Get current session
 * - POST /api/auth/session/refresh        Refresh session
 *
 * OAuth:
 * - GET  /api/auth/sign-in/social/google   Initiate Google OAuth
 * - GET  /api/auth/callback/google         Google OAuth callback
 * - GET  /api/auth/sign-in/social/facebook Initiate Facebook OAuth
 * - GET  /api/auth/callback/facebook       Facebook OAuth callback
 *
 * User Operations:
 * - POST /api/auth/user/update            Update user profile
 * - POST /api/auth/user/change-email      Change email address
 * - POST /api/auth/user/change-password   Change password
 * - POST /api/auth/user/delete            Delete account
 *
 * Account Linking:
 * - POST /api/auth/link-social            Link social account
 * - POST /api/auth/unlink-account         Unlink account
 *
 * @see https://www.better-auth.com/docs/installation#mount-handler
 */

export const { POST, GET } = toNextJsHandler(auth);