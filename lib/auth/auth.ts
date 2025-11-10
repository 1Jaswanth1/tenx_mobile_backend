// lib/auth/auth.ts
// Better Auth Server Configuration with Supabase Integration

import { betterAuth } from "better-auth";
import { env } from "@/env.mjs";
import { createClient } from "@supabase/supabase-js";

/**
 * Better Auth Server Configuration
 *
 * This file configures Better Auth for the application with Supabase as the backend.
 * It sets up:
 * - Supabase database integration
 * - Authentication methods (email/password, OAuth)
 * - Session management
 * - Security settings
 *
 * Environment Variables Required:
 * - BETTER_AUTH_SECRET: Secret key for encryption (generate with: openssl rand -base64 32)
 * - BETTER_AUTH_URL: Base URL of your application (e.g., http://localhost:3000)
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key for database operations
 *
 * @see https://www.better-auth.com/docs/installation
 */

if (!env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}

if (!env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is not set");
}

// Create Supabase client for Better Auth database operations
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const auth = betterAuth({
  /**
   * Database Configuration
   * Using Supabase's PostgreSQL database
   */
  database: {
    type: "postgres",
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    // Better Auth will use Supabase's REST API for database operations
    adapter: {
      async create(table: string, data: any) {
        const { data: result, error } = await supabaseAdmin
          .from(table)
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result;
      },

      async findOne(table: string, where: any) {
        let query = supabaseAdmin.from(table).select();

        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data, error } = await query.single();
        if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
        return data;
      },

      async findMany(table: string, where?: any) {
        let query = supabaseAdmin.from(table).select();

        if (where) {
          Object.entries(where).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },

      async update(table: string, where: any, data: any) {
        let query = supabaseAdmin.from(table).update(data);

        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data: result, error } = await query.select().single();
        if (error) throw error;
        return result;
      },

      async delete(table: string, where: any) {
        let query = supabaseAdmin.from(table).delete();

        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { error } = await query;
        if (error) throw error;
      },
    },
  },

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
    useSecureCookies: env.NODE_ENV === "production",
    cookiePrefix: "10xr-auth",
  },

  /**
   * Social Providers Configuration
   * Add OAuth providers here (Google, GitHub, etc.)
   *
   * Uncomment and configure as needed:
   */
  // socialProviders: {
  //   google: {
  //     clientId: env.GOOGLE_CLIENT_ID!,
  //     clientSecret: env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: env.GITHUB_CLIENT_ID!,
  //     clientSecret: env.GITHUB_CLIENT_SECRET!,
  //   },
  // },

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