// env.mjs
// Environment Variables Validation for 10xR Community Platform

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment Variables Validation
 *
 * This file validates all environment variables at build time using Zod.
 * It ensures type safety and catches configuration errors early.
 *
 * @see https://env.t3.gg/docs/introduction
 */

export const env = createEnv({
  /**
   * Server-side Environment Variables
   * These are only available on the server and never exposed to the client
   */
  server: {
    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Supabase Service Role (Server-side only - full database access)
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

    // Better Auth Configuration
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().url().min(1, "BETTER_AUTH_URL is required"),

    // Redis Configuration (for BullMQ job queues)
    REDIS_URL: z.string().url().optional(),

    // Bundle Analyzer
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),

    // OAuth Providers (Optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
  },

  /**
   * Client-side Environment Variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Supabase Client Configuration
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

    // Application URL
    NEXT_PUBLIC_APP_URL: z.string().url().min(1, "NEXT_PUBLIC_APP_URL is required"),

    // Feature Flags (Optional)
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_FLAGSMITH_ENV_ID: z.string().optional(),

    // Sentry (Optional)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  /**
   * Runtime Environment Variables
   * Maps process.env to the validated schema
   */
  runtimeEnv: {
    // Server-side
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    REDIS_URL: process.env.REDIS_URL,
    ANALYZE: process.env.ANALYZE,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    // Client-side
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_FLAGSMITH_ENV_ID: process.env.NEXT_PUBLIC_FLAGSMITH_ENV_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  /**
   * Skip validation during build time on Vercel
   * This allows builds to succeed even with placeholder values
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
