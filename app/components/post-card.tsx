/**
 * Post Card Component
 *
 * Displays a single post with voting functionality, metadata, and content preview.
 * Integrates with the handleVote server action for upvote/downvote operations.
 *
 * Features:
 * - Upvote/downvote buttons with vote count
 * - Post title and content preview
 * - Author and community information
 * - Timestamp display
 * - Link to full post view
 * - Responsive design
 *
 * Stack:
 * - Next.js Server Component
 * - Server Actions for voting
 * - Shadcn UI components
 * - Supabase data
 */

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { handleVote } from '@/app/actions';
import { auth } from '@/lib/auth/auth-server';

/**
 * Post type based on Supabase schema
 */
type Post = {
  id: string;
  title: string;
  content: any; // TipTap JSON
  media_url: string | null;
  content_type: string | null;
  created_at: string;
  author_id: string;
  community_id: string;
  slug: string | null;
  comment_count: number | null;
  upvotes: number | null;
  downvotes: number | null;
  // Joined data
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
 * PostCard Component
 *
 * Renders a single post card with voting controls.
 *
 * @param post - Post data from Supabase
 */
export default async function PostCard({ post }: { post: Post }) {
  // ============================================================================
  // Calculate Vote Score
  // ============================================================================
  const voteCount = post.votes
    ? post.votes.reduce(
        (acc, vote) => acc + (vote.vote_type === 'upvote' ? 1 : -1),
        0
      )
    : 0;

  // ============================================================================
  // Check User's Vote Status
  // ============================================================================
  const session = await auth();
  const authUser = session?.user;

  let userVote: string | null = null;
  if (authUser && post.votes) {
    // Find if current user has voted on this post
    const vote = post.votes.find((v) => v.user_id === authUser.id);
    userVote = vote ? vote.vote_type : null;
  }

  // ============================================================================
  // Format Timestamp
  // ============================================================================
  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // ============================================================================
  // Extract Content Preview
  // ============================================================================
  const getContentPreview = () => {
    if (post.content_type === 'image') {
      return '[Image Post]';
    }

    // For text posts, extract plain text from TipTap JSON
    if (post.content) {
      try {
        const contentObj =
          typeof post.content === 'string'
            ? JSON.parse(post.content)
            : post.content;

        // Extract text from TipTap JSON structure
        const extractText = (node: any): string => {
          if (node.text) return node.text;
          if (node.content) {
            return node.content.map(extractText).join(' ');
          }
          return '';
        };

        const text = extractText(contentObj);
        return text.length > 150 ? `${text.substring(0, 150)}...` : text;
      } catch (e) {
        return '';
      }
    }

    return '';
  };

  const contentPreview = getContentPreview();

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <Card className="flex gap-x-4 p-4 hover:bg-accent/50 transition-colors">
      {/* Vote Section */}
      <div className="flex flex-col items-center gap-y-1">
        {/* Upvote Button */}
        <form action={handleVote}>
          <input type="hidden" name="postId" value={post.id} />
          <Button
            type="submit"
            name="voteType"
            value="upvote"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              userVote === 'upvote' ? 'text-brand-orange' : 'text-muted-foreground'
            }`}
            disabled={!authUser}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>

        {/* Vote Count */}
        <span
          className={`text-sm font-medium ${
            voteCount > 0
              ? 'text-brand-orange'
              : voteCount < 0
                ? 'text-blue-500'
                : 'text-muted-foreground'
          }`}
        >
          {voteCount}
        </span>

        {/* Downvote Button */}
        <form action={handleVote}>
          <input type="hidden" name="postId" value={post.id} />
          <Button
            type="submit"
            name="voteType"
            value="downvote"
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              userVote === 'downvote' ? 'text-blue-500' : 'text-muted-foreground'
            }`}
            disabled={!authUser}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-y-2 flex-1">
        {/* Post Metadata */}
        <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
          {post.communities && (
            <>
              <Link
                href={`/r/${post.communities.slug}`}
                className="font-medium hover:underline"
              >
                r/{post.communities.name}
              </Link>
              <span>•</span>
            </>
          )}
          {post.users && (
            <>
              <span>Posted by u/{post.users.username}</span>
              <span>•</span>
            </>
          )}
          <span>{timeAgo(post.created_at)}</span>
        </div>

        {/* Post Title */}
        <Link
          href={`/r/${post.communities?.slug}/post/${post.id}`}
          className="font-semibold text-lg hover:underline"
        >
          {post.title}
        </Link>

        {/* Content Preview */}
        {contentPreview && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contentPreview}
          </p>
        )}

        {/* Image Preview */}
        {post.content_type === 'image' && post.media_url && (
          <Link href={`/r/${post.communities?.slug}/post/${post.id}`}>
            <img
              src={post.media_url}
              alt={post.title}
              className="max-h-[300px] w-auto rounded-md object-cover mt-2"
            />
          </Link>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-x-4 text-xs text-muted-foreground mt-2">
          <Link
            href={`/r/${post.communities?.slug}/post/${post.id}`}
            className="flex items-center gap-x-1 hover:bg-accent px-2 py-1 rounded"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comment_count || 0} Comments</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
