/**
 * Suspense Card Loading Skeleton
 *
 * Displays skeleton placeholders while posts are loading.
 * Matches the layout of actual PostCard components for smooth transitions.
 *
 * Features:
 * - Multiple card skeletons (5 items)
 * - Shadcn UI Skeleton components
 * - Matches PostCard dimensions
 *
 * Usage:
 * Used as fallback in Suspense boundaries on the homepage.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * SuspenseCard Component
 *
 * Renders loading skeletons for posts while data is being fetched.
 */
export default function SuspenseCard() {
  return (
    <div className="flex flex-col gap-y-5">
      {[...Array(5)].map((_, index) => (
        <Card key={index} className="flex gap-x-4 p-4">
          {/* Vote section skeleton */}
          <div className="flex flex-col items-center gap-y-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-8 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>

          {/* Content section skeleton */}
          <div className="flex flex-col gap-y-2 flex-1">
            {/* Post metadata */}
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>

            {/* Post title */}
            <Skeleton className="h-6 w-3/4 rounded" />

            {/* Post content preview */}
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />

            {/* Post actions */}
            <div className="flex items-center gap-x-4 mt-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
