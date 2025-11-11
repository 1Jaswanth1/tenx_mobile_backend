-- ============================================================================
-- FILE: supabase/schemas/content.sql
-- SECTION: Posts, Comments, and Votes
-- 
-- Content tables for the community platform
-- ============================================================================

-- ============================================================================
-- Posts Table
-- ============================================================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  title TEXT NOT NULL,
  content TEXT,
  content_type content_type DEFAULT 'text',
  media_url TEXT,
  media_thumbnail_url TEXT,
  link_url TEXT,
  link_metadata JSONB,
  
  -- Poll Data (if content_type = 'poll')
  poll_options JSONB,
  poll_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Ownership
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- [STRATEGIC: Catharsis Engine] Anonymous posting toggle
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Engagement Metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT FALSE, -- [STRATEGIC: $0 Event Engine]
  is_locked BOOLEAN DEFAULT FALSE,
  is_removed BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  removed_reason TEXT,
  
  -- SEO & Discovery
  slug TEXT,
  tags TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 300),
  CONSTRAINT content_length CHECK (char_length(content) <= 40000)
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_score ON posts(score DESC);
CREATE INDEX idx_posts_last_activity ON posts(last_activity_at DESC);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned, created_at DESC) WHERE is_pinned = TRUE;
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_slug ON posts(slug) WHERE slug IS NOT NULL;

-- ============================================================================
-- Comments Table (Nested Threading)
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  content TEXT NOT NULL,
  
  -- Ownership
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Threading (Nested Comments)
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  root_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  depth INTEGER DEFAULT 0,
  path TEXT, -- Materialized path: "1.5.23"
  
  -- [STRATEGIC: Catharsis Engine] Anonymous commenting
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Engagement Metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  score INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  reply_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_removed BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  removed_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000),
  CONSTRAINT max_depth CHECK (depth <= 10)
);

CREATE INDEX idx_comments_post_id ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_root_id ON comments(root_id);
CREATE INDEX idx_comments_path ON comments(path);
CREATE INDEX idx_comments_score ON comments(score DESC);

-- ============================================================================
-- Votes Table
-- ============================================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Voter
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Target (Polymorphic: post or comment)
  votable_id UUID NOT NULL,
  votable_type votable_type NOT NULL,
  
  -- Vote Direction
  vote_type vote_type NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_vote UNIQUE (user_id, votable_id, votable_type)
);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_votable ON votes(votable_id, votable_type);
CREATE INDEX idx_votes_votable_type ON votes(votable_type, votable_id);
