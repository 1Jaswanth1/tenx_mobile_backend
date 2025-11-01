import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration
 * 
 * This file configures Drizzle Kit for database migrations and schema management.
 * It reads the database URL from environment variables and sets up the schema path.
 * 
 * @see https://orm.drizzle.team/kit-docs/overview
 */
export default defineConfig({
  // Database connection string from environment variables
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Enable verbose logging for debugging (optional)
  verbose: true,
  // Enable strict mode to catch potential issues early
  strict: true,
});
