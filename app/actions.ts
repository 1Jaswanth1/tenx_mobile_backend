/**
 * Server Actions for 10xR Community Platform
 *
 * This file contains all server actions for data mutations.
 * Server actions run on the server and provide secure, type-safe mutations.
 *
 * Features:
 * - Server-side execution (secure, no client-side exposure)
 * - BetterAuth session validation
 * - Direct Supabase database mutations
 * - Revalidation and cache management
 *
 * Stack:
 * - Next.js 16 Server Actions
 * - BetterAuth for authentication
 * - Supabase for database operations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-server';
import { createClient } from '@/lib/supabase/server';

/**
 * Server Action: Update Username
 *
 * Securely updates a user's username in the Supabase users table.
 * Validates session, checks for duplicates, and enforces constraints.
 *
 * @param prevState - Previous form state (for useFormState hook)
 * @param formData - Form data containing the new username
 * @returns Object with status and message for UI feedback
 */
export async function updateUsername(prevState: any, formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Extract and Validate Input
  // ============================================================================
  // Extract username from form data
  const username = formData.get('username') as string;

  // Basic validation: check if username exists
  if (!username || username.trim() === '') {
    return {
      status: 'error',
      message: 'Username is required.',
    };
  }

  // Normalize username (lowercase and trim)
  const normalizedUsername = username.toLowerCase().trim();

  // Length validation
  if (normalizedUsername.length < 3) {
    return {
      status: 'error',
      message: 'Username must be at least 3 characters long.',
    };
  }

  if (normalizedUsername.length > 20) {
    return {
      status: 'error',
      message: 'Username must be no more than 20 characters.',
    };
  }

  // Format validation (alphanumeric with underscores and hyphens only)
  const usernameRegex = /^[a-z0-9_-]+$/;
  if (!usernameRegex.test(normalizedUsername)) {
    return {
      status: 'error',
      message: 'Username can only contain letters, numbers, underscores, and hyphens.',
    };
  }

  // ============================================================================
  // STEP 3: Database Operations
  // ============================================================================
  try {
    // Create Supabase client for server-side operations
    const supabase = await createClient();

    // First, get the user's profile to check current username and ID
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('id, username')
      .eq('auth_user_id', authUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return {
        status: 'error',
        message: 'Failed to fetch user profile. Please try again.',
      };
    }

    // Check if username is unchanged
    if (currentProfile.username === normalizedUsername) {
      return {
        status: 'info',
        message: 'No changes detected. Username is already set to this value.',
      };
    }

    // Check for duplicate username
    const { data: existingUser, error: duplicateError } = await supabase
      .from('users')
      .select('id')
      .eq('username', normalizedUsername)
      .maybeSingle();

    // Handle query errors
    if (duplicateError) {
      console.error('Error checking for duplicate username:', duplicateError);
      return {
        status: 'error',
        message: 'Failed to validate username. Please try again.',
      };
    }

    // Check if username is taken by another user
    if (existingUser && existingUser.id !== currentProfile.id) {
      return {
        status: 'error',
        message: 'This username is already taken. Please choose another.',
      };
    }

    // Perform the username update
    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: normalizedUsername,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentProfile.id);

    // Handle update errors
    if (updateError) {
      console.error('Error updating username:', updateError);

      // Handle unique constraint violation (extra safety)
      if (updateError.code === '23505') {
        return {
          status: 'error',
          message: 'This username is already taken. Please choose another.',
        };
      }

      return {
        status: 'error',
        message: 'Failed to update username. Please try again.',
      };
    }

    // ============================================================================
    // STEP 4: Revalidation and Success Response
    // ============================================================================
    // Revalidate the settings page to reflect the changes
    revalidatePath('/settings');

    // Revalidate any profile pages that might display the username
    revalidatePath('/profile');

    return {
      status: 'success',
      message: 'Username updated successfully!',
    };
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during username update:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Create Community
 *
 * Creates a new community (subreddit) in the 10xR platform.
 * Validates session, checks for duplicates, and generates a URL-friendly slug.
 *
 * @param prevState - Previous form state (for useFormState hook)
 * @param formData - Form data containing community details
 * @returns Object with status and message, or redirects on success
 */
export async function createCommunity(prevState: any, formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  // We need the user's ID from the 'users' table (not auth_users)
  // because 'communities.created_by' references 'users(id)'
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return {
      status: 'error',
      message: 'Failed to verify user account. Please try again.',
    };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  // Extract community name from form data
  const name = (formData.get('name') as string)?.trim();

  // Basic validation: check if name exists
  if (!name || name === '') {
    return {
      status: 'error',
      message: 'Community name is required.',
    };
  }

  // Length validation (per schema constraints)
  if (name.length < 3) {
    return {
      status: 'error',
      message: 'Community name must be at least 3 characters long.',
    };
  }

  if (name.length > 50) {
    return {
      status: 'error',
      message: 'Community name must be no more than 50 characters.',
    };
  }

  // Generate slug from name (lowercase, replace spaces with hyphens)
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-');          // Replace multiple hyphens with single

  // Validate slug format (alphanumeric and hyphens only)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return {
      status: 'error',
      message: 'Community name can only contain letters, numbers, spaces, and hyphens.',
    };
  }

  // ============================================================================
  // STEP 4: Database Operations
  // ============================================================================
  try {
    // Check for duplicate community name
    const { data: existingByName, error: nameCheckError } = await supabase
      .from('communities')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (nameCheckError) {
      console.error('Error checking for duplicate name:', nameCheckError);
      return {
        status: 'error',
        message: 'Failed to validate community name. Please try again.',
      };
    }

    if (existingByName) {
      return {
        status: 'error',
        message: 'A community with this name already exists.',
      };
    }

    // Check for duplicate slug
    const { data: existingBySlug, error: slugCheckError } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (slugCheckError) {
      console.error('Error checking for duplicate slug:', slugCheckError);
      return {
        status: 'error',
        message: 'Failed to validate community URL. Please try again.',
      };
    }

    if (existingBySlug) {
      return {
        status: 'error',
        message: 'A community with this URL already exists. Please try a different name.',
      };
    }

    // Create the new community
    const { data: newCommunity, error: createError } = await supabase
      .from('communities')
      .insert({
        name: name,
        slug: slug,
        created_by: userProfile.id,
        // Default values from schema will be applied:
        // - theme_color: '#568AFF'
        // - member_count: 0
        // - post_count: 0
        // - is_private: false
        // - is_nsfw: false
        // - allow_anonymous_posts: true
      })
      .select('slug')
      .single();

    if (createError) {
      console.error('Error creating community:', createError);

      // Handle unique constraint violation (extra safety)
      if (createError.code === '23505') {
        return {
          status: 'error',
          message: 'A community with this name already exists.',
        };
      }

      return {
        status: 'error',
        message: 'Failed to create community. Please try again.',
      };
    }

    // ============================================================================
    // STEP 5: Revalidation and Success Response
    // ============================================================================
    // Revalidate the home page to show the new community
    revalidatePath('/');

    // Redirect to the newly created community page
    return redirect(`/r/${newCommunity.slug}`);
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during community creation:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Update Community Description
 *
 * Updates the description of a community. Only the creator can edit.
 * Validates session and ownership before updating.
 *
 * @param prevState - Previous form state (for useFormState hook)
 * @param formData - Form data containing community slug and new description
 * @returns Object with status and message for UI feedback
 */
export async function updateSubDescription(prevState: any, formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  // We need the user's ID from the 'users' table for ownership check
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return {
      status: 'error',
      message: 'Failed to verify user account. Please try again.',
    };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  // Extract community slug and description from form data
  const slug = formData.get('slug') as string;
  const description = (formData.get('description') as string)?.trim();

  // Validate slug
  if (!slug || slug === '') {
    return {
      status: 'error',
      message: 'Community identifier is required.',
    };
  }

  // Description can be empty (user might want to clear it)
  // But we'll limit the length
  if (description && description.length > 500) {
    return {
      status: 'error',
      message: 'Description must be no more than 500 characters.',
    };
  }

  // ============================================================================
  // STEP 4: Database Operations
  // ============================================================================
  try {
    // First, fetch the community to verify ownership
    const { data: community, error: fetchError } = await supabase
      .from('communities')
      .select('id, created_by')
      .eq('slug', slug)
      .single();

    if (fetchError || !community) {
      console.error('Error fetching community:', fetchError);
      return {
        status: 'error',
        message: 'Community not found.',
      };
    }

    // Check if the user is the creator of this community
    if (community.created_by !== userProfile.id) {
      return {
        status: 'error',
        message: 'You are not authorized to edit this community.',
      };
    }

    // Update the community description
    const { error: updateError } = await supabase
      .from('communities')
      .update({
        description: description || null, // Store null if empty
        updated_at: new Date().toISOString(),
      })
      .eq('id', community.id);

    if (updateError) {
      console.error('Error updating description:', updateError);
      return {
        status: 'error',
        message: 'Failed to update description. Please try again.',
      };
    }

    // ============================================================================
    // STEP 5: Revalidation and Success Response
    // ============================================================================
    // Revalidate the community page to reflect the changes
    revalidatePath(`/r/${slug}`);

    return {
      status: 'success',
      message: 'Description updated successfully!',
    };
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during description update:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Create Post
 *
 * Creates a new post (text or image) in a community.
 * Validates session, community membership, and post content.
 *
 * @param prevState - Previous form state (for useFormState hook)
 * @param formData - Form data containing post details (title, content, etc.)
 * @returns Object with status and message, or redirects on success
 */
export async function createPost(prevState: any, formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  // We need the user's ID from the 'users' table (not auth_users)
  // because 'posts.author_id' references 'users(id)'
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return {
      status: 'error',
      message: 'Failed to verify user account. Please try again.',
    };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  // Extract post data from form data
  const communitySlug = formData.get('communitySlug') as string;
  const title = (formData.get('title') as string)?.trim();
  const contentType = formData.get('contentType') as 'text' | 'image';
  const contentJson = formData.get('content') as string; // TipTap JSON
  const imageUrl = formData.get('imageUrl') as string | null;

  // Validate community slug
  if (!communitySlug || communitySlug === '') {
    return {
      status: 'error',
      message: 'Community identifier is required.',
    };
  }

  // Validate title
  if (!title || title === '') {
    return {
      status: 'error',
      message: 'Post title is required.',
    };
  }

  if (title.length < 3) {
    return {
      status: 'error',
      message: 'Title must be at least 3 characters long.',
    };
  }

  if (title.length > 300) {
    return {
      status: 'error',
      message: 'Title must be no more than 300 characters.',
    };
  }

  // Validate content type
  if (!contentType || !['text', 'image'].includes(contentType)) {
    return {
      status: 'error',
      message: 'Invalid post type.',
    };
  }

  // Validate content for text posts
  if (contentType === 'text') {
    if (!contentJson || contentJson === '') {
      return {
        status: 'error',
        message: 'Post content is required for text posts.',
      };
    }
  }

  // Validate image URL for image posts
  if (contentType === 'image' && (!imageUrl || imageUrl === '')) {
    return {
      status: 'error',
      message: 'Image is required for image posts.',
    };
  }

  // ============================================================================
  // STEP 4: Database Operations
  // ============================================================================
  try {
    // First, fetch the community to get its ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', communitySlug)
      .single();

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      return {
        status: 'error',
        message: 'Community not found.',
      };
    }

    // Generate a slug from the title (for SEO-friendly URLs)
    const postSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-\s]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .substring(0, 100);            // Limit length

    // Create the new post
    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert({
        title: title,
        content: contentType === 'text' ? contentJson : null,
        content_type: contentType,
        media_url: contentType === 'image' ? imageUrl : null,
        author_id: userProfile.id,
        community_id: community.id,
        slug: postSlug,
        // Default values from schema will be applied:
        // - upvotes: 0
        // - downvotes: 0
        // - score: 0
        // - comment_count: 0
        // - is_anonymous: false
        // - is_locked: false
        // - is_removed: false
      })
      .select('id, slug')
      .single();

    if (createError) {
      console.error('Error creating post:', createError);
      return {
        status: 'error',
        message: 'Failed to create post. Please try again.',
      };
    }

    // ============================================================================
    // STEP 5: Revalidation and Success Response
    // ============================================================================
    // Revalidate the community page to show the new post
    revalidatePath(`/r/${communitySlug}`);

    // Redirect to the newly created post
    return redirect(`/r/${communitySlug}/post/${newPost.id}`);
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during post creation:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Handle Vote
 *
 * Handles upvote/downvote on posts. Toggles vote or changes vote type.
 * Requires authentication via BetterAuth.
 *
 * @param formData - Form data containing postId and voteType
 */
export async function handleVote(formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  // We need the user's ID from the 'users' table (not auth_users)
  // because 'votes.user_id' references 'users(id)'
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return { status: 'error', message: 'Failed to verify user account.' };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  const postId = formData.get('postId') as string;
  const voteType = formData.get('voteType') as string;

  // Validate inputs
  if (!postId || !voteType) {
    return { status: 'error', message: 'Invalid vote data.' };
  }

  // Validate vote type
  if (!['upvote', 'downvote'].includes(voteType.toLowerCase())) {
    return { status: 'error', message: 'Invalid vote type.' };
  }

  // ============================================================================
  // STEP 4: Database Operations
  // ============================================================================
  try {
    // Check for existing vote
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('votable_id', postId)
      .eq('user_id', userProfile.id)
      .eq('votable_type', 'post')
      .maybeSingle();

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError);
      return { status: 'error', message: 'Failed to check vote status.' };
    }

    // Case 1: No existing vote - Create new vote
    if (!existingVote) {
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          votable_id: postId,
          votable_type: 'post',
          user_id: userProfile.id,
          vote_type: voteType.toLowerCase(),
        });

      if (insertError) {
        console.error('Error inserting vote:', insertError);
        return { status: 'error', message: 'Failed to register vote.' };
      }

      // Revalidate homepage to show updated vote count
      revalidatePath('/');
      return { status: 'success', message: 'Vote registered!' };
    }

    // Case 2: Same vote again - Remove vote (toggle off)
    if (existingVote.vote_type === voteType.toLowerCase()) {
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);

      if (deleteError) {
        console.error('Error deleting vote:', deleteError);
        return { status: 'error', message: 'Failed to remove vote.' };
      }

      // Revalidate homepage to show updated vote count
      revalidatePath('/');
      return { status: 'success', message: 'Vote removed!' };
    }

    // Case 3: Different vote - Update vote type
    const { error: updateError } = await supabase
      .from('votes')
      .update({ vote_type: voteType.toLowerCase() })
      .eq('id', existingVote.id);

    if (updateError) {
      console.error('Error updating vote:', updateError);
      return { status: 'error', message: 'Failed to update vote.' };
    }

    // Revalidate homepage to show updated vote count
    revalidatePath('/');
    return { status: 'success', message: 'Vote updated!' };
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during vote operation:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Create Comment
 *
 * Creates a new comment on a post.
 * Requires authentication via BetterAuth.
 *
 * @param formData - Form data containing postId and comment text
 */
export async function createComment(formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  // Fetch the current user session using BetterAuth
  const session = await auth();
  const authUser = session?.user;

  // Redirect to login if no authenticated session exists
  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  // We need the user's ID from the 'users' table (not auth_users)
  // because 'comments.author_id' references 'users(id)'
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return { status: 'error', message: 'Failed to verify user account.' };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  const postId = formData.get('postId') as string;
  const commentText = (formData.get('comment') as string)?.trim();

  // Validate inputs
  if (!postId) {
    return { status: 'error', message: 'Post ID is required.' };
  }

  if (!commentText || commentText === '') {
    return { status: 'error', message: 'Comment text is required.' };
  }

  if (commentText.length > 10000) {
    return { status: 'error', message: 'Comment is too long (max 10,000 characters).' };
  }

  // ============================================================================
  // STEP 4: Database Operations
  // ============================================================================
  try {
    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, community_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return { status: 'error', message: 'Post not found.' };
    }

    // Insert comment
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        content: commentText,
        post_id: postId,
        author_id: userProfile.id,
      });

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return { status: 'error', message: 'Failed to create comment.' };
    }

    // Get community slug for revalidation
    const { data: community } = await supabase
      .from('communities')
      .select('slug')
      .eq('id', post.community_id)
      .single();

    // ============================================================================
    // STEP 5: Revalidation and Success Response
    // ============================================================================
    // Revalidate the post page to show the new comment
    if (community) {
      revalidatePath(`/r/${community.slug}/post/${postId}`);
    }

    return { status: 'success', message: 'Comment posted!' };
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unexpected error during comment creation:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Server Action: Create or Get Chat Room
 *
 * Creates a new 1-on-1 chat room between current user and target user.
 * Returns existing room if one already exists between the two users.
 *
 * @param targetUserId - ID of the user to chat with
 * @returns Room ID
 */
export async function createOrGetChatRoom(targetUserId: string) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  const session = await auth();
  const authUser = session?.user;

  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    throw new Error('Failed to verify user account.');
  }

  // ============================================================================
  // STEP 3: Validate Target User
  // ============================================================================
  if (!targetUserId || targetUserId === userProfile.id) {
    throw new Error('Invalid target user.');
  }

  // Verify target user exists
  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', targetUserId)
    .single();

  if (targetError || !targetUser) {
    console.error('Error fetching target user:', targetError);
    throw new Error('Target user not found.');
  }

  // ============================================================================
  // STEP 4: Check if Room Already Exists
  // ============================================================================
  // Query for existing room between these two users
  const { data: existingRooms, error: existingError } = await supabase
    .from('chat_room_member')
    .select(
      `
      chat_room_id,
      chat_room:chat_room!inner (
        id,
        is_direct
      )
    `
    )
    .eq('member_id', userProfile.id);

  if (existingError) {
    console.error('Error checking existing rooms:', existingError);
    throw new Error('Failed to check existing chat rooms.');
  }

  // Find room where both users are members
  for (const membership of existingRooms || []) {
    const { data: otherMember } = await supabase
      .from('chat_room_member')
      .select('member_id')
      .eq('chat_room_id', membership.chat_room_id)
      .eq('member_id', targetUserId)
      .single();

    if (otherMember) {
      // Room already exists, revalidate and return
      revalidatePath('/chat');
      return { roomId: membership.chat_room_id };
    }
  }

  // ============================================================================
  // STEP 5: Create New Chat Room
  // ============================================================================
  try {
    // Use the helper function from database schema
    const { data: roomId, error: createError } = await supabase.rpc(
      'get_or_create_chat_room',
      {
        user1_id: userProfile.id,
        user2_id: targetUserId,
      }
    );

    if (createError) {
      console.error('Error creating chat room:', createError);
      throw new Error('Failed to create chat room.');
    }

    // Revalidate chat list
    revalidatePath('/chat');

    return { roomId };
  } catch (error: any) {
    console.error('Unexpected error creating chat room:', error);
    throw new Error('An unexpected error occurred. Please try again later.');
  }
}

/**
 * Server Action: Send Message
 *
 * Sends a message to a chat room.
 * Validates user is a member of the room before allowing message send.
 *
 * @param formData - Form data containing roomId and message text
 */
export async function sendMessage(formData: FormData) {
  // ============================================================================
  // STEP 1: Authentication Check
  // ============================================================================
  const session = await auth();
  const authUser = session?.user;

  if (!authUser) {
    return redirect('/login');
  }

  // ============================================================================
  // STEP 2: Get User Profile from Supabase
  // ============================================================================
  const supabase = await createClient();

  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (userError || !userProfile) {
    console.error('Error fetching user profile:', userError);
    return { status: 'error', message: 'Failed to verify user account.' };
  }

  // ============================================================================
  // STEP 3: Extract and Validate Input
  // ============================================================================
  const roomId = formData.get('roomId') as string;
  const messageText = (formData.get('message') as string)?.trim();

  if (!roomId) {
    return { status: 'error', message: 'Room ID is required.' };
  }

  if (!messageText || messageText === '') {
    return { status: 'error', message: 'Message text is required.' };
  }

  if (messageText.length > 10000) {
    return { status: 'error', message: 'Message is too long (max 10,000 characters).' };
  }

  // ============================================================================
  // STEP 4: Verify User is Member of Room
  // ============================================================================
  const { data: membership, error: membershipError } = await supabase
    .from('chat_room_member')
    .select('chat_room_id')
    .eq('chat_room_id', roomId)
    .eq('member_id', userProfile.id)
    .single();

  if (membershipError || !membership) {
    console.error('Error verifying membership:', membershipError);
    return { status: 'error', message: 'You are not a member of this chat room.' };
  }

  // ============================================================================
  // STEP 5: Insert Message
  // ============================================================================
  try {
    const { error: insertError } = await supabase.from('message').insert({
      chat_room_id: roomId,
      author_id: userProfile.id,
      text: messageText,
    });

    if (insertError) {
      console.error('Error sending message:', insertError);
      return { status: 'error', message: 'Failed to send message.' };
    }

    // Revalidate chat room page
    revalidatePath(`/chat/${roomId}`);

    return { status: 'success', message: 'Message sent!' };
  } catch (error: any) {
    console.error('Unexpected error sending message:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

/**
 * Type definition for server action responses
 * Use this for type-safe handling in components
 */
export type ActionResponse = {
  status: 'success' | 'error' | 'info';
  message: string;
};
