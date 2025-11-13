/**
 * Loading Skeleton for Community Page
 *
 * Displays a skeleton UI while the community page data is being fetched.
 * Matches the layout structure of the main page for smooth transitions.
 *
 * Features:
 * - Two-column layout matching the actual page
 * - Skeleton components from Shadcn UI
 * - Responsive design
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Loading Component
 *
 * Shows animated skeleton placeholders while data loads.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto mt-8 px-6">
        <div className="flex gap-x-6 lg:gap-x-10">
          {/* ========================================================================
              Left Column - Posts Loading Skeleton
              ======================================================================== */}
          <div className="w-full lg:w-[65%] flex flex-col gap-y-5">
            {/* Title Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>

            <Separator />

            {/* Posts Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ========================================================================
              Right Column - Sidebar Loading Skeleton
              ======================================================================== */}
          <div className="hidden lg:block w-[35%]">
            <Card>
              {/* Card Header */}
              <CardHeader className="bg-muted py-3 px-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>

              {/* Card Content */}
              <CardContent className="py-4 px-4">
                <div className="flex flex-col gap-y-4">
                  {/* Avatar and Name Skeleton */}
                  <div className="flex items-center gap-x-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>

                  {/* Date Skeleton */}
                  <div className="flex items-center gap-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>

                  <Separator className="my-2" />

                  {/* Description Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
