/**
 * Show Items Component
 *
 * Renders a list of posts using the PostCard component.
 * Server component that receives posts data from the parent page.
 *
 * Features:
 * - Maps over posts array
 * - Renders PostCard for each post
 * - Handles empty state
 * - Gap spacing between cards
 *
 * Usage:
 * Used inside Suspense boundary on the homepage.
 */

import PostCard from './post-card';

/**
 * Post type based on Supabase schema
 */
type Post = {
  id: string;
  title: string;
  content: any;
  media_url: string | null;
  content_type: string | null;
  created_at: string;
  author_id: string;
  community_id: string;
  slug: string | null;
  comment_count: number | null;
  upvotes: number | null;
  downvotes: number | null;
  communities?: {
    name: string;
    slug: string;
  };
  users?: {
    username: string;
  };
  votes?: Array<{
    vote_type: string;
    user_id: string;
  }>;
};

/**
 * ShowItems Component
 *
 * Displays a list of posts in a vertical stack.
 *
 * @param posts - Array of post data from Supabase
 */
export default async function ShowItems({ posts }: { posts: Post[] }) {
  // ============================================================================
  // Empty State
  // ============================================================================
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No posts yet</p>
        <p className="text-sm text-muted-foreground">
          Be the first to create a post!
        </p>
      </div>
    );
  }

  // ============================================================================
  // Render Posts
  // ============================================================================
  return (
    <div className="flex flex-col gap-y-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
