/**
 * UploadThing Route Handler
 *
 * Handles POST and GET requests for file uploads.
 * Automatically created by UploadThing using the file router configuration.
 *
 * Endpoints:
 * - POST: Upload files
 * - GET: Retrieve upload status
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

/**
 * Export route handlers for Next.js App Router
 *
 * This creates both GET and POST handlers automatically
 * based on the file router configuration.
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
