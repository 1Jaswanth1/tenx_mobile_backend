import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

/**
 * Better Auth API Route Handler
 * 
 * This catch-all route handles all Better Auth API requests.
 * 
 * Endpoints handled:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET  /api/auth/session
 * - And more...
 * 
 * @see https://www.better-auth.com/docs/installation#mount-handler
 */

export const { POST, GET } = toNextJsHandler(auth);
