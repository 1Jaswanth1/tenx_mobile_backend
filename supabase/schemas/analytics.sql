-- ============================================================================
-- FILE: supabase/schemas/analytics.sql
-- SECTION: Analytics & Metrics
-- 
-- Tables for tracking user activity and aggregated stats
-- ============================================================================

-- ============================================================================
-- User Activity Log
-- ============================================================================
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Activity Type
  activity_type TEXT NOT NULL,
  activity_metadata JSONB,
  
  -- Session Info
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type, created_at DESC);
CREATE INDEX idx_user_activity_created_at ON user_activity_log(created_at DESC);

-- ============================================================================
-- Daily Community Stats (Aggregated Metrics)
-- ============================================================================
CREATE TABLE daily_community_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  
  -- User Metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  dau INTEGER DEFAULT 0,
  
  -- Content Metrics
  total_posts INTEGER DEFAULT 0,
  new_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  new_comments INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  total_votes INTEGER DEFAULT 0,
  new_votes INTEGER DEFAULT 0,
  total_dms INTEGER DEFAULT 0,
  new_dms INTEGER DEFAULT 0,
  
  -- Community Metrics
  total_communities INTEGER DEFAULT 0,
  
  -- Anonymous Usage (Catharsis Engine Metrics)
  anonymous_posts_created INTEGER DEFAULT 0,
  anonymous_comments_created INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_stats_date ON daily_community_stats(date DESC);
