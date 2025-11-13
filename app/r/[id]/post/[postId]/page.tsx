/**
 * Individual Post Page for 10xR Community Platform
 *
 * Displays a single post with full content, voting, and comments.
 * Server-side data fetching with relational Supabase queries.
 *
 * Features:
 * - Full post content display (text or image)
 * - Voting functionality
 * - Comment creation and display
 * - Author and community information
 * - Share link functionality
 * - Two-column layout with community sidebar
 *
 * Stack:
 * - Next.js 16 Async Server Component
 * - Supabase for data queries
 * - BetterAuth for authentication
 * - Shadcn UI components
 */

import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth-server';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, MessageSquare, CakeIcon } from 'lucide-react';
import { handleVote } from '@/app/actions';
import CommentForm from '@/app/components/comment-form';
import CopyLink from '@/app/components/copy-link';

/**
 * Data Fetching Function
 *
 * Fetches post with related data: community, author, votes, comments.
 *
 * @param postId - Post ID from URL params
 * @returns Post data or null if not found
 */
async function getData(postId: string) {
  // Disable caching for always-fresh data
  noStore();

  // Create Supabase client
  const supabase = await createClient();

  // Fetch post with related data
  const { data: post, error } = await supabase
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
        slug,
        description,
        created_at
      ),
      users!posts_author_id_fkey (
        username,
        avatar_url
      ),
      votes (
        vote_type,
        user_id
      ),
      comments (
        id,
        content,
        created_at,
        author_id,
        users!comments_author_id_fkey (
          username,
          avatar_url
        )
      )
    `
    )
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    return null;
  }

  return post;
}

/**
 * Post Page Component
 *
 * Main page displaying a single post with comments.
 *
 * @param params - Route parameters (community slug and post ID)
 */
export default async function PostPage({
  params,
}: {
  params: { id: string; postId: string };
}) {
  // ============================================================================
  // Fetch Data
  // ============================================================================
  const post = await getData(params.postId);

  // Return 404 if post not found
  if (!post) {
    return notFound();
  }

  // ============================================================================
  // Calculate Vote Score
  // ============================================================================
  const voteCount = post.votes
    ? post.votes.reduce(
        (acc: number, vote: any) =>
          acc + (vote.vote_type === 'upvote' ? 1 : -1),
        0
      )
    : 0;

  // ============================================================================
  // Check User's Vote Status and Authentication
  // ============================================================================
  const session = await auth();
  const authUser = session?.user;

  let userVote: string | null = null;
  if (authUser && post.votes) {
    const vote = post.votes.find((v: any) => v.user_id === authUser.id);
    userVote = vote ? vote.vote_type : null;
  }

  // ============================================================================
  // Format Timestamp
  // ============================================================================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ============================================================================
  // Extract Content from TipTap JSON
  // ============================================================================
  const renderContent = () => {
    if (post.content_type === 'image') {
      return null; // Image is shown separately
    }

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
            return node.content
              .map((child: any) => {
                if (child.type === 'paragraph') {
                  return extractText(child) + '\n\n';
                }
                if (child.type === 'heading') {
                  return '## ' + extractText(child) + '\n\n';
                }
                if (child.type === 'bulletList') {
                  return (
                    child.content
                      .map((item: any) => '• ' + extractText(item))
                      .join('\n') + '\n\n'
                  );
                }
                if (child.type === 'orderedList') {
                  return (
                    child.content
                      .map((item: any, i: number) => `${i + 1}. ${extractText(item)}`)
                      .join('\n') + '\n\n'
                  );
                }
                return extractText(child);
              })
              .join('');
          }
          return '';
        };

        const text = extractText(contentObj);
        return (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {text}
          </div>
        );
      } catch (e) {
        console.error('Error parsing content:', e);
        return <p className="text-sm text-muted-foreground">Error loading content</p>;
      }
    }

    return null;
  };

  // Generate full URL for sharing
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${post.communities?.slug}/post/${post.id}`;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex gap-x-10 mt-8">
          {/* ========================================================================
              Left Column - Post and Comments (70%)
              ======================================================================== */}
          <div className="w-full lg:w-[70%] flex flex-col gap-y-5">
            {/* Post Card */}
            <Card>
              <CardContent className="p-6">
                {/* Post Metadata */}
                <div className="flex items-center gap-x-2 text-xs text-muted-foreground mb-4">
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
                  <span>Posted by u/{post.users?.username}</span>
                  <span>•</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>

                {/* Post Title */}
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

                {/* Post Content */}
                {post.content_type === 'image' && post.media_url && (
                  <img
                    src={post.media_url}
                    alt={post.title}
                    className="max-w-full h-auto rounded-md mb-4"
                  />
                )}

                {post.content_type === 'text' && (
                  <div className="mb-4">{renderContent()}</div>
                )}

                <Separator className="my-4" />

                {/* Post Actions */}
                <div className="flex items-center gap-x-4">
                  {/* Voting */}
                  <div className="flex items-center gap-x-2 border rounded-full px-3 py-1">
                    <form action={handleVote}>
                      <input type="hidden" name="postId" value={post.id} />
                      <Button
                        type="submit"
                        name="voteType"
                        value="upvote"
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${
                          userVote === 'upvote'
                            ? 'text-brand-orange'
                            : 'text-muted-foreground'
                        }`}
                        disabled={!authUser}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </form>

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

                    <form action={handleVote}>
                      <input type="hidden" name="postId" value={post.id} />
                      <Button
                        type="submit"
                        name="voteType"
                        value="downvote"
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${
                          userVote === 'downvote'
                            ? 'text-blue-500'
                            : 'text-muted-foreground'
                        }`}
                        disabled={!authUser}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Comments Count */}
                  <div className="flex items-center gap-x-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">
                      {post.comments?.length || 0} Comments
                    </span>
                  </div>

                  {/* Share Link */}
                  <CopyLink url={fullUrl} />
                </div>
              </CardContent>
            </Card>

            {/* Comment Form */}
            {authUser ? (
              <CommentForm postId={post.id} />
            ) : (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  <Link href="/login" className="text-brand-orange hover:underline">
                    Log in
                  </Link>{' '}
                  or{' '}
                  <Link href="/signup" className="text-brand-orange hover:underline">
                    sign up
                  </Link>{' '}
                  to comment
                </p>
              </Card>
            )}

            {/* Comments Section */}
            <div className="flex flex-col gap-y-4">
              <h2 className="text-xl font-semibold">
                Comments ({post.comments?.length || 0})
              </h2>

              {post.comments && post.comments.length > 0 ? (
                <div className="flex flex-col gap-y-4">
                  {post.comments.map((comment: any) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-x-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {comment.users?.avatar_url ? (
                              <img
                                src={comment.users.avatar_url}
                                alt={comment.users.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {comment.users?.username?.charAt(0).toUpperCase() ||
                                    'U'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-x-2 mb-2">
                              <span className="text-sm font-semibold">
                                u/{comment.users?.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No comments yet. Be the first to comment!
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* ========================================================================
              Right Column - Community Sidebar (30%)
              ======================================================================== */}
          <div className="hidden lg:block w-[30%]">
            <div className="sticky top-20">
              <Card>
                <CardHeader className="bg-muted font-medium text-sm py-3 px-4">
                  About Community
                </CardHeader>
                <CardContent className="py-4 px-4">
                  {post.communities && (
                    <div className="flex flex-col gap-y-4">
                      {/* Community Name */}
                      <div className="flex items-center gap-x-3">
                        <img
                          src={`https://api.dicebear.com/9.x/identicon/svg?seed=${post.communities.name}`}
                          alt={post.communities.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <Link
                          href={`/r/${post.communities.slug}`}
                          className="font-semibold text-lg hover:underline"
                        >
                          r/{post.communities.name}
                        </Link>
                      </div>

                      {/* Description */}
                      {post.communities.description && (
                        <p className="text-sm text-muted-foreground">
                          {post.communities.description}
                        </p>
                      )}

                      {/* Created Date */}
                      <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                        <CakeIcon className="h-4 w-4" />
                        <span>
                          Created{' '}
                          {new Date(post.communities.created_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>

                      <Separator />

                      {/* Create Post Button */}
                      {authUser && (
                        <Link href={`/r/${post.communities.slug}/create`}>
                          <Button className="w-full">Create Post</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
