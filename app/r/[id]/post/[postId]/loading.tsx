/**
 * Loading Skeleton for Individual Post Page
 *
 * Displays a skeleton UI while the post data is being fetched.
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
 * Shows animated skeleton placeholders while post data loads.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex gap-x-10 mt-8">
          {/* ========================================================================
              Left Column - Post and Comments Loading Skeleton (70%)
              ======================================================================== */}
          <div className="w-full lg:w-[70%] flex flex-col gap-y-5">
            {/* Post Card Skeleton */}
            <Card>
              <CardContent className="p-6">
                {/* Metadata Skeleton */}
                <div className="flex items-center gap-x-2 mb-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* Title Skeleton */}
                <Skeleton className="h-8 w-3/4 mb-4" />

                {/* Content Skeleton */}
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>

                <Separator className="my-4" />

                {/* Actions Skeleton */}
                <div className="flex items-center gap-x-4">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>

            {/* Comment Form Skeleton */}
            <Card className="p-4">
              <Skeleton className="h-24 w-full mb-3" />
              <Skeleton className="h-10 w-24" />
            </Card>

            {/* Comments Section Skeleton */}
            <div className="flex flex-col gap-y-4">
              <Skeleton className="h-6 w-32" />

              {/* Comment Cards Skeleton */}
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ========================================================================
              Right Column - Sidebar Loading Skeleton (30%)
              ======================================================================== */}
          <div className="hidden lg:block w-[30%]">
            <Card>
              <CardHeader className="bg-muted py-3 px-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="py-4 px-4">
                <div className="flex flex-col gap-y-4">
                  {/* Community Info Skeleton */}
                  <div className="flex items-center gap-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>

                  {/* Date Skeleton */}
                  <Skeleton className="h-4 w-40" />

                  <Separator />

                  {/* Button Skeleton */}
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
