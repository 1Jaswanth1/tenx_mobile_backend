/**
 * UploadThing Core Configuration
 *
 * Defines file upload endpoints and their validation rules.
 * Uses BetterAuth for authentication and authorization.
 *
 * Endpoints:
 * - imageUploader: Handles image uploads for post creation
 *
 * Stack:
 * - UploadThing for file management
 * - BetterAuth for authentication
 * - Next.js 16 App Router
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth/auth-server';

const f = createUploadthing();

/**
 * UploadThing File Router
 *
 * Defines all upload endpoints with their configurations.
 */
export const ourFileRouter = {
  /**
   * Image Uploader for Post Creation
   *
   * Accepts: Image files (png, jpg, jpeg, webp)
   * Max Size: 4MB
   * Auth: Required (BetterAuth session)
   */
  imageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    // Authentication middleware
    .middleware(async () => {
      // Get user session from BetterAuth
      const session = await auth();
      const user = session?.user;

      // Throw error if not authenticated
      if (!user) throw new Error('Unauthorized');

      // Pass user data to onUploadComplete
      return { userId: user.id };
    })
    // Completion callback
    .onUploadComplete(async ({ metadata, file }) => {
      // Log successful upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);

      // Return file URL to client
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
