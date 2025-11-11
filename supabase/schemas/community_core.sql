-- ============================================================================
-- FILE: supabase/schemas/community_core.sql
-- SECTION: Community Platform Core Tables (THE "BAIT")
-- 
-- Core tables for the Reddit-style community platform:
-- - users (anonymous community identity)
-- - communities (subreddits)
-- - memberships (user ↔ community)
-- ============================================================================

-- ============================================================================
-- Users Table (Anonymous Community Identity)
-- ============================================================================
-- CRITICAL: This is the PUBLIC persona linked 1:1 to auth_users
-- Represents anonymous community identity (username, karma, avatar)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Public Community Identity
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  
  -- Community Metrics
  karma INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_karma ON users(karma DESC);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- Communities Table (The "Subreddits")
-- ============================================================================
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  
  -- Branding
  icon_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#568AFF',
  
  -- Configuration
  rules JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  is_private BOOLEAN DEFAULT FALSE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  allow_anonymous_posts BOOLEAN DEFAULT TRUE, -- [STRATEGIC: Catharsis Engine]
  require_flair BOOLEAN DEFAULT FALSE, -- [STRATEGIC: Data Engine]
  
  -- Stats
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  active_member_count INTEGER DEFAULT 0, -- Active in last 30 days
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 50),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT description_length CHECK (char_length(description) <= 500)
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX idx_communities_tags ON communities USING GIN(tags);

-- ============================================================================
-- Memberships Table (User ↔ Community Join)
-- ============================================================================
CREATE TABLE memberships (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Role & Status
  role member_role DEFAULT 'member',
  is_muted BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  
  -- [STRATEGIC: Data Engine] User-selected flair
  flair_text TEXT,
  flair_color TEXT DEFAULT '#568AFF',
  
  -- Activity Tracking
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (user_id, community_id),
  CONSTRAINT flair_length CHECK (char_length(flair_text) <= 50)
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_community_id ON memberships(community_id);
CREATE INDEX idx_memberships_role ON memberships(role);
CREATE INDEX idx_memberships_last_active ON memberships(last_active_at DESC);
