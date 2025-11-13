// lib/auth/auth-server.ts
// Better Auth Server Configuration with Supabase Integration
//
// This file configures Better Auth to work with your existing Supabase schema
// and enables Google, Facebook, and username/password authentication.

import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Better Auth Configuration
 *
 * Integrates with existing Supabase auth schema and provides:
 * - Email/Password authentication
 * - Google OAuth
 * - Facebook OAuth
 * - Session management
 * - Cookie-based authentication
 *
 * Environment Variables Required:
 * - BETTER_AUTH_SECRET: Secret key for encryption (generate with: openssl rand -base64 32)
 * - BETTER_AUTH_URL: Base URL of your application
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - FACEBOOK_CLIENT_ID: Facebook OAuth client ID
 * - FACEBOOK_CLIENT_SECRET: Facebook OAuth client secret
 */

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

// Extract database connection string from Supabase URL
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = supabaseUrl.hostname.split('.')[0];

// Construct database URL for direct Postgres connection
// You'll need to get the database password from Supabase Dashboard → Settings → Database
const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;

export const auth = betterAuth({
  /**
   * Database Configuration
   * Using direct PostgreSQL connection for Better Auth operations
   */
  database: new Pool({
    connectionString: DATABASE_URL,
  }),

  /**
   * Base URL Configuration
   * This should match your application's domain
   */
  baseURL: process.env.BETTER_AUTH_URL,

  /**
   * Secret Key for Cookie Signing and Token Encryption
   */
  secret: process.env.BETTER_AUTH_SECRET,

  /**
   * Email and Password Authentication
   * Traditional username/password sign-up and sign-in
   */
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in users after registration
    requireEmailVerification: false, // Set to true in production

    /**
     * Minimum password requirements
     */
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  /**
   * Session Configuration
   * Manage user sessions with secure cookies
   */
  session: {
    /**
     * Session expiration (7 days in seconds)
     */
    expiresIn: 60 * 60 * 24 * 7,

    /**
     * Update session age (update session every 24 hours)
     */
    updateAge: 60 * 60 * 24,

    /**
     * Cookie Cache Configuration
     * Reduces database queries by caching session in cookies
     */
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache cookies for 5 minutes
    },

    /**
     * Fresh session requirement for sensitive operations
     * Users must re-authenticate for actions like changing password
     */
    freshAge: 60 * 60, // 1 hour
  },

  /**
   * User Configuration
   * Define additional user fields and validation
   */
  user: {
    /**
     * Additional Fields
     * Extend the base user model with custom fields
     */
    additionalFields: {
      /**
       * Display name for the user
       */
      displayName: {
        type: "string",
        required: false,
        input: true,
        maxLength: 50,
      },

      /**
       * Username (unique identifier)
       */
      username: {
        type: "string",
        required: true,
        unique: true,
        input: true,
        maxLength: 30,
        transform: {
          input: (value: string) => value.toLowerCase().trim(),
        },
      },

      /**
       * User bio
       */
      bio: {
        type: "string",
        required: false,
        input: true,
        maxLength: 500,
      },

      /**
       * Avatar URL
       */
      avatarUrl: {
        type: "string",
        required: false,
        input: true,
      },

      /**
       * Location
       */
      location: {
        type: "string",
        required: false,
        input: true,
        maxLength: 100,
      },

      /**
       * Website URL
       */
      website: {
        type: "string",
        required: false,
        input: true,
      },

      /**
       * Karma points
       */
      karma: {
        type: "number",
        required: false,
        input: false,
        defaultValue: 0,
      },

      /**
       * Post count
       */
      postCount: {
        type: "number",
        required: false,
        input: false,
        defaultValue: 0,
      },

      /**
       * Comment count
       */
      commentCount: {
        type: "number",
        required: false,
        input: false,
        defaultValue: 0,
      },

      /**
       * Account status
       */
      isActive: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: true,
      },

      /**
       * Ban status
       */
      isBanned: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: false,
      },

      /**
       * Ban reason
       */
      banReason: {
        type: "string",
        required: false,
        input: false,
      },

      /**
       * Banned until timestamp
       */
      bannedUntil: {
        type: "date",
        required: false,
        input: false,
      },

      /**
       * Last seen timestamp
       */
      lastSeenAt: {
        type: "date",
        required: false,
        input: false,
      },
    },

    /**
     * Change Email Configuration
     * Allow users to change their email address
     */
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
        // TODO: Implement email sending logic
        console.log(`Email change verification for ${user.email} to ${newEmail}`);
        console.log(`Verification URL: ${url}`);
        console.log(`Token: ${token}`);

        // Example implementation (you'll need to set up your email service):
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Approve email change',
        //   html: `
        //     <h1>Email Change Request</h1>
        //     <p>Click the link below to approve changing your email to ${newEmail}:</p>
        //     <a href="${url}">${url}</a>
        //   `
        // });
      },
    },

    /**
     * Delete User Configuration
     * Allow users to delete their accounts
     */
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        // TODO: Implement email sending logic
        console.log(`Account deletion verification for ${user.email}`);
        console.log(`Verification URL: ${url}`);
        console.log(`Token: ${token}`);

        // Example implementation:
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Confirm account deletion',
        //   html: `
        //     <h1>Account Deletion Request</h1>
        //     <p>Click the link below to permanently delete your account:</p>
        //     <a href="${url}">${url}</a>
        //     <p><strong>Warning:</strong> This action cannot be undone.</p>
        //   `
        // });
      },
    },
  },

  /**
   * Account Configuration
   * Manage linked accounts and OAuth connections
   */
  account: {
    /**
     * Account Linking Configuration
     * Allow users to link multiple authentication methods
     */
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "facebook"], // Auto-link verified providers
    },
  },

  /**
   * Social Providers Configuration
   * OAuth authentication with Google and Facebook
   */
  socialProviders: {
    /**
     * Google OAuth Configuration
     *
     * Setup Instructions:
     * 1. Go to Google Cloud Console (https://console.cloud.google.com)
     * 2. Create a new project or select existing
     * 3. Enable Google+ API
     * 4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
     * 5. Add authorized redirect URI: {BETTER_AUTH_URL}/api/auth/callback/google
     * 6. Copy Client ID and Client Secret to .env.local
     */
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

      /**
       * Requested scopes from Google
       */
      scope: ["email", "profile"],

      /**
       * Always get refresh token from Google
       */
      accessType: "offline",
      prompt: "select_account consent",

      /**
       * Map Google profile to user fields
       */
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          name: profile.name,
          emailVerified: profile.email_verified,
          image: profile.picture,
          // Map to custom fields
          displayName: profile.name,
          username: profile.email.split('@')[0].toLowerCase(), // Temporary username
          avatarUrl: profile.picture,
        };
      },
    },

    /**
     * Facebook OAuth Configuration
     *
     * Setup Instructions:
     * 1. Go to Facebook Developers (https://developers.facebook.com)
     * 2. Create a new app or select existing
     * 3. Add Facebook Login product
     * 4. Go to Settings → Basic → Get App ID and App Secret
     * 5. Add OAuth redirect URI: {BETTER_AUTH_URL}/api/auth/callback/facebook
     * 6. Copy App ID and App Secret to .env.local
     */
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",

      /**
       * Requested scopes from Facebook
       */
      scope: ["email", "public_profile"],

      /**
       * Requested fields from Facebook user profile
       */
      fields: ["id", "name", "email", "picture"],

      /**
       * Map Facebook profile to user fields
       */
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          name: profile.name,
          emailVerified: true, // Facebook provides verified emails
          image: profile.picture?.data?.url,
          // Map to custom fields
          displayName: profile.name,
          username: profile.email?.split('@')[0].toLowerCase() || `user_${profile.id}`,
          avatarUrl: profile.picture?.data?.url,
        };
      },
    },
  },

  /**
   * Advanced Configuration
   * Security and cookie settings
   */
  advanced: {
    /**
     * Use secure cookies in production
     */
    useSecureCookies: process.env.NODE_ENV === "production",

    /**
     * Cookie prefix for all Better Auth cookies
     */
    cookiePrefix: "10xr-auth",

    /**
     * Cross-subdomain cookie configuration
     * Enable if you need to share auth across subdomains
     */
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: process.env.NEXT_PUBLIC_APP_DOMAIN, // e.g., "example.com"
    // },
  },

  /**
   * Trusted Origins
   * List of allowed origins for CORS
   */
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    // Add production domains here
  ].filter(Boolean) as string[],

  /**
   * Plugins
   * Extend Better Auth with additional functionality
   *
   * Uncomment and configure as needed:
   */
  // plugins: [
  //   twoFactor(),        // Two-factor authentication
  //   magicLink(),        // Passwordless magic link authentication
  //   anonymous(),        // Anonymous user support
  //   organization(),     // Organization/team management
  // ],
});

/**
 * Type-safe auth instance for server-side usage
 */
export type Auth = typeof auth;