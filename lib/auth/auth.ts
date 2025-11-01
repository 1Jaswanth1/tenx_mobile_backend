import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";

/**
 * Better Auth Server Configuration
 * 
 * This file configures Better Auth for the application.
 * It sets up:
 * - Database adapter (Drizzle + PostgreSQL)
 * - Authentication methods (email/password)
 * - Session management
 * - Security settings
 * 
 * Environment Variables Required:
 * - BETTER_AUTH_SECRET: Secret key for encryption (generate with: openssl rand -base64 32)
 * - BETTER_AUTH_URL: Base URL of your application (e.g., http://localhost:3000)
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * @see https://www.better-auth.com/docs/installation
 */

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is not set");
}

export const auth = betterAuth({
  /**
   * Database Configuration
   * Using Drizzle ORM adapter with PostgreSQL
   */
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL provider
  }),

  /**
   * Email and Password Authentication
   * Enables traditional email/password sign-up and sign-in
   */
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in users after registration
    requireEmailVerification: false, // Set to true for production
  },

  /**
   * Session Configuration
   * Manage user sessions with secure cookies
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache cookies for 5 minutes
    },
  },

  /**
   * Advanced Session Configuration
   * Additional security and tracking features
   */
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "healthcare-auth",
  },

  /**
   * Social Providers Configuration
   * Add OAuth providers here (Google, GitHub, etc.)
   * Example:
   * 
   * socialProviders: {
   *   google: {
   *     clientId: process.env.GOOGLE_CLIENT_ID!,
   *     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   *   },
   *   github: {
   *     clientId: process.env.GITHUB_CLIENT_ID!,
   *     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
   *   },
   * },
   */

  /**
   * Plugins can be added here for additional functionality:
   * - Two-factor authentication
   * - Magic link authentication
   * - Username/password authentication
   * - Organization management
   * 
   * Example:
   * plugins: [
   *   twoFactor(),
   *   magicLink(),
   * ],
   */
});

/**
 * Type-safe auth instance for server-side usage
 * Use this in API routes and server components
 */
export type Auth = typeof auth;
