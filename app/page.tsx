/**
 * Homepage for 10xR Community Platform
 *
 * Displays a feed of posts from all communities with voting and pagination.
 * Server-side data fetching with Suspense streaming for optimal performance.
 *
 * Features:
 * - Server-side post fetching with pagination
 * - Vote counting and display
 * - Suspense streaming with loading skeletons
 * - Two-column layout (posts + sidebar)
 * - BetterAuth session awareness
 * - Responsive design
 *
 * Stack:
 * - Next.js 16 Async Server Component
 * - Supabase for data queries
 * - BetterAuth for authentication
 * - Shadcn UI components
 */

import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth-server';
import ShowItems from './components/show-items';
import SuspenseCard from './components/suspense-card';
import Pagination from './components/pagination';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home as HomeIcon, Plus } from 'lucide-react';

/**
 * Page Metadata
 */
export const metadata: Metadata = {
  title: '10xR - Community Platform for Healthcare Professionals',
  description: 'Join the conversation, share experiences, and connect with healthcare professionals.',
};

/**
 * Data Fetching Function
 *
 * Fetches posts with pagination, vote counts, and related data.
 *
 * @param pageParam - Current page number from URL query params
 * @returns Object with posts array and total count
 */
async function getData(pageParam: string | undefined) {
  // Disable caching for always-fresh data
  noStore();

  // Create Supabase client
  const supabase = await createClient();

  // Pagination setup
  const take = 10; // Posts per page
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const offset = (page - 1) * take;

  // Fetch posts with related data
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      content,
      media_url,
      content_type,
      created_at,
      author_id,
      community_id,
      slug,
      comment_count,
      upvotes,
      downvotes,
      communities (
        name,
        slug
      ),
      users (
        username
      ),
      votes (
        vote_type,
        user_id
      )
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + take - 1);

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  if (countError) {
    console.error('Error fetching count:', countError);
  }

  return {
    posts: posts ?? [],
    totalCount: count ?? 0,
  };
}

/**
 * Homepage Component
 *
 * Main page displaying the feed of posts with voting and pagination.
 *
 * @param searchParams - URL search parameters (page number)
 */
export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // ============================================================================
  // Fetch Data
  // ============================================================================
  const { posts, totalCount } = await getData(searchParams.page);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 10);

  // ============================================================================
  // Check Authentication Status
  // ============================================================================
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex gap-x-10 mt-8">
          {/* ========================================================================
              Left Column - Posts Feed (65%)
              ======================================================================== */}
          <div className="w-full lg:w-[65%] flex flex-col gap-y-5">
            {/* Suspense Boundary for Streaming */}
            <Suspense
              key={searchParams.page || '1'}
              fallback={<SuspenseCard />}
            >
              <ShowItems posts={posts} />
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && <Pagination totalPages={totalPages} />}
          </div>

          {/* ========================================================================
              Right Column - Sidebar (35%)
              ======================================================================== */}
          <div className="hidden lg:block w-[35%]">
            <div className="sticky top-20 flex flex-col gap-y-4">
              {/* Welcome Card */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-brand-orange to-brand-cornflower text-white py-4 px-4 rounded-t-lg">
                  <div className="flex items-center gap-x-2">
                    <HomeIcon className="h-5 w-5" />
                    <h2 className="font-semibold">Home</h2>
                  </div>
                </CardHeader>
                <CardContent className="py-4 px-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Your personal 10xR homepage. Share your experiences, ask
                    questions, and connect with healthcare professionals.
                  </p>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-y-2">
                    {isAuthenticated ? (
                      <>
                        <Link href="/r/create">
                          <Button className="w-full gap-x-2">
                            <Plus className="h-4 w-4" />
                            Create Community
                          </Button>
                        </Link>
                        <Link href="/communities">
                          <Button variant="outline" className="w-full">
                            Browse Communities
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/signup">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                        <Link href="/login">
                          <Button variant="outline" className="w-full">
                            Log In
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Community Guidelines Card */}
              <Card>
                <CardHeader className="py-3 px-4 bg-muted">
                  <h3 className="font-medium text-sm">Community Guidelines</h3>
                </CardHeader>
                <CardContent className="py-4 px-4">
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex items-start gap-x-2">
                      <span className="text-brand-orange">1.</span>
                      <span>Be respectful and professional</span>
                    </li>
                    <li className="flex items-start gap-x-2">
                      <span className="text-brand-orange">2.</span>
                      <span>Protect patient privacy (HIPAA compliance)</span>
                    </li>
                    <li className="flex items-start gap-x-2">
                      <span className="text-brand-orange">3.</span>
                      <span>Share accurate information</span>
                    </li>
                    <li className="flex items-start gap-x-2">
                      <span className="text-brand-orange">4.</span>
                      <span>Support fellow professionals</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Platform Info Card */}
              <Card>
                <CardContent className="py-4 px-4">
                  <div className="flex flex-col gap-y-2 text-xs text-muted-foreground">
                    <Link href="/about" className="hover:underline">
                      About
                    </Link>
                    <Link href="/help" className="hover:underline">
                      Help
                    </Link>
                    <Link href="/terms" className="hover:underline">
                      Terms
                    </Link>
                    <Link href="/privacy" className="hover:underline">
                      Privacy Policy
                    </Link>
                    <Separator className="my-2" />
                    <p className="text-[10px]">
                      10xR Community Platform © 2025
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
