-- ============================================================================
-- FILE: supabase/schemas/types.sql
-- SECTION: Custom Types
-- 
-- All ENUM types and custom types used throughout the platform.
-- Keeping these in one file makes it easy to see all type definitions.
-- ============================================================================

-- Community Content Types
CREATE TYPE content_type AS ENUM ('text', 'image', 'link', 'poll', 'video');

-- Voting System
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
CREATE TYPE votable_type AS ENUM ('post', 'comment');

-- Community Roles
CREATE TYPE member_role AS ENUM ('member', 'moderator', 'admin');

-- Notification System
CREATE TYPE notification_type AS ENUM (
  'post_reply',
  'comment_reply',
  'post_upvote',
  'comment_upvote',
  'new_follower',
  'mention',
  'community_invite',
  'dm_received',
  'evangelist_reward'
);

-- Moderation & Reporting
CREATE TYPE report_type AS ENUM (
  'spam', 
  'harassment', 
  'misinformation', 
  'inappropriate_content',
  'hipaa_violation',
  'other'
);
CREATE TYPE report_status AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');

-- B2B Sales Engine Types
CREATE TYPE agency_status AS ENUM (
  'prospect',
  'lead', 
  'contacted',
  'demo_scheduled',
  'negotiation',
  'customer',
  'churned',
  'lost'
);

CREATE TYPE professional_role AS ENUM (
  'aide',
  'cna',
  'lpn',
  'rn',
  'don',
  'case_manager',
  'social_worker',
  'chaplain',
  'admin_staff',
  'owner',
  'other'
);

CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'invalid');
CREATE TYPE reward_status AS ENUM ('pending', 'approved', 'paid', 'denied', 'cancelled');
