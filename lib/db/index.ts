import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database Connection Setup
 * 
 * Creates a PostgreSQL connection pool and initializes Drizzle ORM.
 * This is a singleton pattern to ensure only one connection pool is created.
 * 
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * @see https://orm.drizzle.team/docs/get-started-postgresql
 */

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Initialize Drizzle ORM with the connection pool
export const db = drizzle(pool, { schema });

/**
 * Graceful shutdown handler
 * Ensures all database connections are properly closed
 */
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
