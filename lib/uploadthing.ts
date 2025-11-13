/**
 * UploadThing Client Utilities
 *
 * Provides type-safe hooks and components for file uploads.
 * Automatically generates utilities based on the file router configuration.
 *
 * Exports:
 * - useUploadThing: Hook for programmatic uploads
 * - uploadFiles: Helper function for direct uploads
 *
 * Usage:
 * ```tsx
 * import { useUploadThing } from '@/lib/uploadthing';
 *
 * const { startUpload, isUploading } = useUploadThing('imageUploader');
 * ```
 */

import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

/**
 * Type-safe UploadThing hooks
 *
 * Generated from the file router configuration.
 * Provides full TypeScript support for all endpoints.
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
