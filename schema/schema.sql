-- 10xR Community Platform Database Schema
-- Supabase PostgreSQL Schema
-- Version: 1.0
-- Last Updated: November 2025

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Content types for posts
CREATE TYPE content_type AS ENUM ('text', 'image', 'link', 'poll', 'video');

-- Vote types
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');

-- Votable types
CREATE TYPE votable_type AS ENUM ('post', 'comment');

-- Community member roles
CREATE TYPE member_role AS ENUM ('member', 'moderator', 'admin');

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'post_reply',
  'comment_reply',
  'post_upvote',
  'comment_upvote',
  'new_follower',
  'mention',
  'community_invite'
);

-- Report types
CREATE TYPE report_type AS ENUM ('spam', 'harassment', 'misinformation', 'other');

-- Report status
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,

    -- Stats
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    karma INTEGER DEFAULT 0,

    -- Settings
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_until TIMESTAMP WITH TIME ZONE,
    ban_reason TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
    );

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_karma ON users(karma DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- COMMUNITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communities (
                                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    icon_url TEXT,
    banner_url TEXT,

    -- Community settings
    rules JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    is_private BOOLEAN DEFAULT FALSE,
    allow_posts BOOLEAN DEFAULT TRUE,
    require_approval BOOLEAN DEFAULT FALSE,

    -- Stats
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,

    -- Creator
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 50),
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
    );

-- Indexes for communities
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);

-- ============================================================================
-- POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS posts (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    content_type content_type DEFAULT 'text',

    -- Media
    media_url TEXT,
    media_thumbnail_url TEXT,

    -- Link posts
    link_url TEXT,
    link_metadata JSONB,

    -- Poll posts
    poll_options JSONB,
    poll_expires_at TIMESTAMP WITH TIME ZONE,

                                  -- Relationships
                                  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,

    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    -- Moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_removed BOOLEAN DEFAULT FALSE,
    removed_reason TEXT,
    removed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,

                                  -- Constraints
                                  CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 300)
    );

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON posts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts((upvotes - downvotes) DESC, created_at DESC);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,

    -- Relationships
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

    -- Thread depth tracking
    depth INTEGER DEFAULT 0,
    path TEXT,

    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,

    -- Moderation
    is_removed BOOLEAN DEFAULT FALSE,
    removed_reason TEXT,
    removed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,

                                                     -- Constraints
                                                     CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000)
    );

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_path ON comments(path);

-- ============================================================================
-- VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS votes (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    votable_id UUID NOT NULL,
    votable_type votable_type NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint: one vote per user per item
    CONSTRAINT unique_vote UNIQUE (user_id, votable_id, votable_type)
    );

-- Indexes for votes
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_votable ON votes(votable_id, votable_type);

-- ============================================================================
-- MEMBERSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS memberships (
                                           user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Primary key
    PRIMARY KEY (user_id, community_id)
    );

-- Indexes for memberships
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community_id ON memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);

-- ============================================================================
-- FOLLOWS TABLE (User Following)
-- ============================================================================

CREATE TABLE IF NOT EXISTS follows (
                                       follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Primary key
    PRIMARY KEY (follower_id, following_id),

    -- Constraint: users can't follow themselves
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
    );

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
                                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,

    -- Content
    title TEXT NOT NULL,
    message TEXT,

    -- Links
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
                                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

    -- Report details
    type report_type NOT NULL,
    reason TEXT NOT NULL,
    additional_info TEXT,

    -- Status
    status report_status DEFAULT 'pending',
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_note TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraint: must report either a user, post, or comment
    CONSTRAINT valid_report CHECK (
(reported_user_id IS NOT NULL)::int +
(post_id IS NOT NULL)::int +
(comment_id IS NOT NULL)::int = 1
    )
    );

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- SAVED POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_posts (
                                           user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Primary key
    PRIMARY KEY (user_id, post_id)
    );

-- Indexes for saved posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id, saved_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update member count when user joins/leaves community
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
UPDATE communities
SET member_count = member_count + 1
WHERE id = NEW.community_id;
ELSIF TG_OP = 'DELETE' THEN
UPDATE communities
SET member_count = member_count - 1
WHERE id = OLD.community_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_membership_count AFTER INSERT OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Update comment count on posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
UPDATE posts
SET comment_count = comment_count + 1
WHERE id = NEW.post_id;
ELSIF TG_OP = 'DELETE' THEN
UPDATE posts
SET comment_count = comment_count - 1
WHERE id = OLD.post_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.votable_type = 'post' THEN
      IF NEW.vote_type = 'upvote' THEN
UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.votable_id;
ELSE
UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.votable_id;
END IF;
    ELSIF NEW.votable_type = 'comment' THEN
      IF NEW.vote_type = 'upvote' THEN
UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.votable_id;
ELSE
UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.votable_id;
END IF;
END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.votable_type = 'post' THEN
      IF OLD.vote_type = 'upvote' THEN
UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.votable_id;
ELSE
UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.votable_id;
END IF;
    ELSIF OLD.votable_type = 'comment' THEN
      IF OLD.vote_type = 'upvote' THEN
UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.votable_id;
ELSE
UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.votable_id;
END IF;
END IF;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_votes AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
                          USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
                          USING (auth.uid() = id);

-- Communities policies
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT
                                USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update communities"
  ON communities FOR UPDATE
                                       USING (
                                       EXISTS (
                                       SELECT 1 FROM memberships
                                       WHERE memberships.community_id = communities.id
                                       AND memberships.user_id = auth.uid()
                                       AND memberships.role = 'admin'
                                       )
                                       );

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
                          USING (NOT is_removed OR author_id = auth.uid());

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
                                 USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
                             USING (NOT is_removed OR author_id = auth.uid());

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
                                    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
                          USING (true);

CREATE POLICY "Users can manage their own votes"
  ON votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Memberships policies
CREATE POLICY "Memberships are viewable by everyone"
  ON memberships FOR SELECT
                                       USING (true);

CREATE POLICY "Users can join communities"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON memberships FOR DELETE
USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
                            USING (true);

CREATE POLICY "Users can manage their own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
                                         USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
                                  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
                            USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Saved posts policies
CREATE POLICY "Users can view their own saved posts"
  ON saved_posts FOR SELECT
                                       USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved posts"
  ON saved_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get hot posts (algorithm: upvotes - downvotes, weighted by time)
CREATE OR REPLACE FUNCTION get_hot_posts(
  p_community_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  community_id UUID,
  upvotes INTEGER,
  downvotes INTEGER,
  comment_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  hot_score NUMERIC
) AS $$
BEGIN
RETURN QUERY
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.community_id,
    p.upvotes,
    p.downvotes,
    p.comment_count,
    p.created_at,
    (p.upvotes - p.downvotes)::NUMERIC / POWER(
      EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 2,
      1.5
    ) AS hot_score
FROM posts p
WHERE
    (p_community_id IS NULL OR p.community_id = p_community_id)
  AND NOT p.is_removed
ORDER BY hot_score DESC
    LIMIT p_limit
OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get user karma
CREATE OR REPLACE FUNCTION calculate_user_karma(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
total_karma INTEGER;
BEGIN
SELECT
    COALESCE(SUM(upvotes - downvotes), 0)
INTO total_karma
FROM (
         SELECT upvotes, downvotes FROM posts WHERE author_id = p_user_id
         UNION ALL
         SELECT upvotes, downvotes FROM comments WHERE author_id = p_user_id
     ) AS combined;

RETURN total_karma;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default communities (optional, uncomment if needed)
-- INSERT INTO communities (name, slug, description, created_by) VALUES
--   ('General', 'general', 'General discussion', '00000000-0000-0000-0000-000000000000'),
--   ('Healthcare', 'healthcare', 'Healthcare discussions', '00000000-0000-0000-0000-000000000000'),
--   ('Technology', 'technology', 'Technology news and discussions', '00000000-0000-0000-0000-000000000000');

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. This schema is designed for Supabase PostgreSQL
-- 2. All tables have Row Level Security (RLS) enabled
-- 3. Policies are configured for public read, authenticated write
-- 4. Triggers automatically update counts and timestamps
-- 5. Functions provide common queries (hot posts, karma calculation)
-- 6. Custom types ensure data consistency
-- 7. Indexes optimize common queries

-- To apply this schema:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- 4. Verify tables in the Table Editor

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================