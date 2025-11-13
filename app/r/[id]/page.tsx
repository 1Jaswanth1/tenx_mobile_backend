/**
 * Dynamic Community (Subreddit) Page for 10xR Community Platform
 *
 * Displays a single community with its details, posts, and sidebar information.
 * Allows the creator to edit the community description.
 *
 * Features:
 * - Dynamic routing based on community slug
 * - Server-side data fetching from Supabase
 * - Creator-only description editing
 * - Responsive two-column layout
 * - Avatar generation using DiceBear API
 *
 * Stack:
 * - Next.js 16 Server Component
 * - BetterAuth for authentication
 * - Supabase for database queries
 * - Shadcn UI components
 */

import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/lib/auth/auth-server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CakeIcon } from 'lucide-react';
import Link from 'next/link';
import { SubDescriptionForm } from '@/app/components/sub-description-form';

/**
 * Community Page Component
 *
 * Fetches and displays community data based on the slug in the URL.
 * Shows different UI depending on whether the user is the creator.
 *
 * @param params - Route parameters containing the community slug
 */
export default async function SubredditRoute({
  params,
}: {
  params: { id: string };
}) {
  // Disable caching for this page to always show fresh data
  noStore();

  // ============================================================================
  // STEP 1: Fetch Community Data from Supabase
  // ============================================================================
  const supabase = await createClient();

  // Query the communities table by slug
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id, name, slug, description, created_at, created_by')
    .eq('slug', params.id)
    .single();

  // Return 404 if community doesn't exist
  if (communityError || !community) {
    return notFound();
  }

  // ============================================================================
  // STEP 2: Check User Authentication and Ownership
  // ============================================================================
  // Fetch the current user session
  const session = await auth();
  const authUser = session?.user;

  // Get user profile if authenticated
  let isOwner = false;
  if (authUser) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    // Check if the current user is the creator
    if (userProfile) {
      isOwner = userProfile.id === community.created_by;
    }
  }

  // ============================================================================
  // STEP 3: Render Page Layout
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto mt-8 px-6">
        <div className="flex gap-x-6 lg:gap-x-10">
          {/* ========================================================================
              Left Column - Posts Section (65%)
              ======================================================================== */}
          <div className="w-full lg:w-[65%] flex flex-col gap-y-5">
            <div>
              <h1 className="text-2xl font-semibold mb-2">r/{community.name}</h1>
              <p className="text-sm text-muted-foreground">
                Posts from this community
              </p>
            </div>

            <Separator />

            {/* Placeholder for posts */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">No posts yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to create a post in this community!
              </p>
            </div>
          </div>

          {/* ========================================================================
              Right Column - About Community Sidebar (35%)
              ======================================================================== */}
          <div className="hidden lg:block w-[35%]">
            <Card>
              {/* Card Header */}
              <CardHeader className="bg-muted font-medium text-sm py-3 px-4">
                About Community
              </CardHeader>

              {/* Card Content */}
              <CardContent className="py-4 px-4">
                <div className="flex flex-col gap-y-4">
                  {/* Community Name and Avatar */}
                  <div className="flex items-center gap-x-3">
                    <img
                      src={`https://api.dicebear.com/9.x/identicon/svg?seed=${community.name}`}
                      alt={community.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <Link
                      href={`/r/${community.slug}`}
                      className="font-semibold text-lg hover:underline"
                    >
                      r/{community.name}
                    </Link>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                    <CakeIcon className="h-4 w-4" />
                    <span>
                      Created{' '}
                      {new Date(community.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  {/* Description Section */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Description</h4>

                    {/* Show editable form if user is the creator */}
                    {isOwner ? (
                      <SubDescriptionForm
                        slug={community.slug}
                        description={community.description}
                      />
                    ) : (
                      /* Show read-only description for non-creators */
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {community.description || 'No description yet.'}
                      </p>
                    )}
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

/**
 * Generate metadata for the page
 * Used for SEO and social sharing
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: community } = await supabase
    .from('communities')
    .select('name, description')
    .eq('slug', params.id)
    .single();

  if (!community) {
    return {
      title: 'Community Not Found | 10xR',
    };
  }

  return {
    title: `r/${community.name} | 10xR Community`,
    description: community.description || `Join the ${community.name} community on 10xR`,
  };
}
