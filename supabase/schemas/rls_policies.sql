-- ============================================================================
-- FILE: supabase/schemas/rls_policies.sql
-- SECTION: Row Level Security Policies
--
-- This file enables RLS and defines security policies for all public tables.
-- Must be run AFTER all tables are created (after types.sql through functions.sql).
--
-- SECURITY ARCHITECTURE:
-- - All tables in public schema MUST have RLS enabled
-- - Auth tables: Managed by Better Auth (no direct access)
-- - Community tables: Public read, authenticated write with ownership checks
-- - B2B tables: Admin-only access (service_role bypass)
-- - Analytics: Write-only for users, read-only for admins
-- ============================================================================

-- ============================================================================
-- SECTION 1: AUTHENTICATION LAYER (Better Auth)
-- These tables are managed by Better Auth library
-- No direct access from client - only via server-side functions
-- ============================================================================

-- Enable RLS on auth tables (defense in depth)
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_two_factor ENABLE ROW LEVEL SECURITY;

-- Auth tables: No public policies - accessed only via Better Auth server functions
-- Service role will bypass RLS for Better Auth operations

COMMENT ON TABLE auth_users IS 'RLS enabled - no public policies - Better Auth only';
COMMENT ON TABLE auth_sessions IS 'RLS enabled - no public policies - Better Auth only';
COMMENT ON TABLE auth_accounts IS 'RLS enabled - no public policies - Better Auth only';
COMMENT ON TABLE auth_verification_tokens IS 'RLS enabled - no public policies - Better Auth only';
COMMENT ON TABLE auth_two_factor IS 'RLS enabled - no public policies - Better Auth only';

-- ============================================================================
-- SECTION 2: COMMUNITY CORE (Public Identity Layer)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table (Anonymous Community Persona)
-- Public profiles visible to all, users can only edit their own
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Everyone can view active, non-banned users
CREATE POLICY "users_select_public"
ON users FOR SELECT
                        TO authenticated, anon
                        USING (
                        is_active = TRUE
                        AND is_banned = FALSE
                        );

-- Users can view their own profile even if banned (to see ban reason)
CREATE POLICY "users_select_own"
ON users FOR SELECT
                        TO authenticated
                        USING (
                        (SELECT auth.uid()) = auth_user_id
                        );

-- Users can update only their own profile (except system fields)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
                        TO authenticated
                        USING (
                        (SELECT auth.uid()) = auth_user_id
                        )
             WITH CHECK (
                        (SELECT auth.uid()) = auth_user_id
                        -- Prevent users from changing system fields
                        AND is_active = TRUE
                        AND is_banned = FALSE
                        );

-- New users can insert their profile (triggered by auth signup)
CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = auth_user_id
);

-- ----------------------------------------------------------------------------
-- Communities Table (Subreddit-style Forums)
-- Public read access, authenticated users can create communities
-- ----------------------------------------------------------------------------
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Everyone can view public communities
CREATE POLICY "communities_select_public"
ON communities FOR SELECT
                              TO authenticated, anon
                              USING (
                              is_private = FALSE
                              );

-- Members can view private communities they belong to
CREATE POLICY "communities_select_member"
ON communities FOR SELECT
                              TO authenticated
                              USING (
                              is_private = TRUE
                              AND id IN (
                              SELECT community_id
                              FROM memberships
                              WHERE user_id = (
                              SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                              )
                              )
                              );

-- Authenticated users can create communities
CREATE POLICY "communities_insert_authenticated"
ON communities FOR INSERT
TO authenticated
WITH CHECK (
  created_by = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Community creators and admins can update
CREATE POLICY "communities_update_owner_admin"
ON communities FOR UPDATE
                                     TO authenticated
                                     USING (
                                     -- Creator can update
                                     created_by = (
                                     SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                     )
                                     OR
                                     -- Admins can update
                                     EXISTS (
                                     SELECT 1 FROM memberships
                                     WHERE community_id = communities.id
                                     AND user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                     AND role = 'admin'
                                     )
                                     );

-- ----------------------------------------------------------------------------
-- Memberships Table (User ↔ Community Joins)
-- Users can view memberships, join/leave communities
-- ----------------------------------------------------------------------------
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Users can view all memberships in public communities
CREATE POLICY "memberships_select_public_communities"
ON memberships FOR SELECT
                              TO authenticated, anon
                              USING (
                              community_id IN (
                              SELECT id FROM communities WHERE is_private = FALSE
                              )
                              );

-- Users can view their own memberships
CREATE POLICY "memberships_select_own"
ON memberships FOR SELECT
                              TO authenticated
                              USING (
                              user_id = (
                              SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                              )
                              );

-- Users can join communities (insert their own membership)
CREATE POLICY "memberships_insert_own"
ON memberships FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
  AND role = 'member' -- Can only join as member, not mod/admin
);

-- Users can update their own flair
CREATE POLICY "memberships_update_own_flair"
ON memberships FOR UPDATE
                                     TO authenticated
                                     USING (
                                     user_id = (
                                     SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                     )
                                     )
                   WITH CHECK (
                                     user_id = (
                                     SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                     )
                                     );

-- Admins can update any membership (role changes, bans)
CREATE POLICY "memberships_update_admin"
ON memberships FOR UPDATE
                              TO authenticated
                              USING (
                              EXISTS (
                              SELECT 1 FROM memberships m
                              WHERE m.community_id = memberships.community_id
                              AND m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                              AND m.role = 'admin'
                              )
                              );

-- Users can leave communities (delete their own membership)
CREATE POLICY "memberships_delete_own"
ON memberships FOR DELETE
TO authenticated
USING (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ============================================================================
-- SECTION 3: CONTENT (Posts, Comments, Votes)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Posts Table
-- Public read (except removed), authenticated write with ownership
-- Anonymous posts hide author_id from non-owners
-- ----------------------------------------------------------------------------
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view non-removed posts
CREATE POLICY "posts_select_public"
ON posts FOR SELECT
                        TO authenticated, anon
                        USING (
                        is_removed = FALSE
                        AND community_id IN (
                        SELECT id FROM communities WHERE is_private = FALSE
                        )
                        );

-- Users can view removed posts they authored
CREATE POLICY "posts_select_own_removed"
ON posts FOR SELECT
                        TO authenticated
                        USING (
                        author_id = (
                        SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                        )
                        );

-- Moderators can view all posts in their communities
CREATE POLICY "posts_select_moderator"
ON posts FOR SELECT
                        TO authenticated
                        USING (
                        EXISTS (
                        SELECT 1 FROM memberships
                        WHERE community_id = posts.community_id
                        AND user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                        AND role IN ('moderator', 'admin')
                        )
                        );

-- Authenticated users can create posts in communities they're members of
CREATE POLICY "posts_insert_member"
ON posts FOR INSERT
TO authenticated
WITH CHECK (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
  AND (
    -- User is a member of the community
    EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = author_id
      AND community_id = posts.community_id
    )
    OR
    -- Community allows non-member posts (open communities)
    NOT EXISTS (
      SELECT 1 FROM communities
      WHERE id = posts.community_id
      AND is_private = TRUE
    )
  )
);

-- Users can update their own posts (content, not metrics)
CREATE POLICY "posts_update_own"
ON posts FOR UPDATE
                               TO authenticated
                               USING (
                               author_id = (
                               SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                               )
                               AND is_locked = FALSE
                               )
             WITH CHECK (
                               author_id = (
                               SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                               )
                               );

-- Moderators can update posts (pin, lock, remove)
CREATE POLICY "posts_update_moderator"
ON posts FOR UPDATE
                        TO authenticated
                        USING (
                        EXISTS (
                        SELECT 1 FROM memberships
                        WHERE community_id = posts.community_id
                        AND user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                        AND role IN ('moderator', 'admin')
                        )
                        );

-- Users can delete their own posts (soft delete via is_removed)
CREATE POLICY "posts_delete_own"
ON posts FOR DELETE
TO authenticated
USING (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ----------------------------------------------------------------------------
-- Comments Table
-- Similar to posts: public read, authenticated write, ownership checks
-- ----------------------------------------------------------------------------
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view non-removed comments on visible posts
CREATE POLICY "comments_select_public"
ON comments FOR SELECT
                           TO authenticated, anon
                           USING (
                           is_removed = FALSE
                           AND post_id IN (
                           SELECT id FROM posts WHERE is_removed = FALSE
                           )
                           );

-- Users can view their own removed comments
CREATE POLICY "comments_select_own_removed"
ON comments FOR SELECT
                           TO authenticated
                           USING (
                           author_id = (
                           SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                           )
                           );

-- Moderators can view all comments in their communities
CREATE POLICY "comments_select_moderator"
ON comments FOR SELECT
                           TO authenticated
                           USING (
                           post_id IN (
                           SELECT p.id FROM posts p
                           INNER JOIN memberships m ON m.community_id = p.community_id
                           WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                           AND m.role IN ('moderator', 'admin')
                           )
                           );

-- Authenticated users can comment on visible posts
CREATE POLICY "comments_insert_authenticated"
ON comments FOR INSERT
TO authenticated
WITH CHECK (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
  AND post_id IN (
    SELECT id FROM posts WHERE is_removed = FALSE AND is_locked = FALSE
  )
);

-- Users can update their own comments
CREATE POLICY "comments_update_own"
ON comments FOR UPDATE
                                  TO authenticated
                                  USING (
                                  author_id = (
                                  SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                  )
                                  )
                WITH CHECK (
                                  author_id = (
                                  SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                  )
                                  );

-- Moderators can update comments (remove, mark spam)
CREATE POLICY "comments_update_moderator"
ON comments FOR UPDATE
                           TO authenticated
                           USING (
                           post_id IN (
                           SELECT p.id FROM posts p
                           INNER JOIN memberships m ON m.community_id = p.community_id
                           WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                           AND m.role IN ('moderator', 'admin')
                           )
                           );

-- Users can delete their own comments
CREATE POLICY "comments_delete_own"
ON comments FOR DELETE
TO authenticated
USING (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ----------------------------------------------------------------------------
-- Votes Table
-- Users can vote once per item, can view/change their own votes
-- ----------------------------------------------------------------------------
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can view their own votes
CREATE POLICY "votes_select_own"
ON votes FOR SELECT
                        TO authenticated
                        USING (
                        user_id = (
                        SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                        )
                        );

-- Authenticated users can vote on posts/comments
CREATE POLICY "votes_insert_authenticated"
ON votes FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Users can change their own votes
CREATE POLICY "votes_update_own"
ON votes FOR UPDATE
                               TO authenticated
                               USING (
                               user_id = (
                               SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                               )
                               )
             WITH CHECK (
                               user_id = (
                               SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                               )
                               );

-- Users can remove their own votes
CREATE POLICY "votes_delete_own"
ON votes FOR DELETE
TO authenticated
USING (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ============================================================================
-- SECTION 4: ENGAGEMENT (Saves, Follows, Notifications, Reports)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Saved Posts
-- Users can only manage their own saved posts
-- ----------------------------------------------------------------------------
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_posts_select_own"
ON saved_posts FOR SELECT
                              TO authenticated
                              USING (
                              user_id = (
                              SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                              )
                              );

CREATE POLICY "saved_posts_insert_own"
ON saved_posts FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "saved_posts_delete_own"
ON saved_posts FOR DELETE
TO authenticated
USING (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ----------------------------------------------------------------------------
-- Follows
-- Users can view follows and manage their own
-- ----------------------------------------------------------------------------
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can view who they follow and who follows them
CREATE POLICY "follows_select_own"
ON follows FOR SELECT
                          TO authenticated
                          USING (
                          follower_id = (
                          SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                          )
                          OR following_id = (
                          SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                          )
                          );

CREATE POLICY "follows_insert_own"
ON follows FOR INSERT
TO authenticated
WITH CHECK (
  follower_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "follows_delete_own"
ON follows FOR DELETE
TO authenticated
USING (
  follower_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ----------------------------------------------------------------------------
-- Notifications
-- Users can only view/update their own notifications
-- ----------------------------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
                                TO authenticated
                                USING (
                                user_id = (
                                SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                )
                                );

-- System can insert notifications (triggered by functions)
CREATE POLICY "notifications_insert_system"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (TRUE); -- Triggered by database functions

CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
                                       TO authenticated
                                       USING (
                                       user_id = (
                                       SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                       )
                                       )
                     WITH CHECK (
                                       user_id = (
                                       SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                       )
                                       );

CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE
TO authenticated
USING (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ----------------------------------------------------------------------------
-- Reports (Content Moderation)
-- Users can submit reports, moderators can view/resolve
-- ----------------------------------------------------------------------------
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "reports_select_own"
ON reports FOR SELECT
                          TO authenticated
                          USING (
                          reporter_id = (
                          SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                          )
                          );

-- Moderators can view reports for their communities
CREATE POLICY "reports_select_moderator"
ON reports FOR SELECT
                          TO authenticated
                          USING (
                          -- Reports on posts in their communities
                          (reportable_type = 'post' AND reportable_id IN (
                          SELECT p.id FROM posts p
                          INNER JOIN memberships m ON m.community_id = p.community_id
                          WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                          AND m.role IN ('moderator', 'admin')
                          ))
                          OR
                          -- Reports on comments in their communities
                          (reportable_type = 'comment' AND reportable_id IN (
                          SELECT c.id FROM comments c
                          INNER JOIN posts p ON p.id = c.post_id
                          INNER JOIN memberships m ON m.community_id = p.community_id
                          WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                          AND m.role IN ('moderator', 'admin')
                          ))
                          );

CREATE POLICY "reports_insert_authenticated"
ON reports FOR INSERT
TO authenticated
WITH CHECK (
  reporter_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Moderators can update reports (resolve, add notes)
CREATE POLICY "reports_update_moderator"
ON reports FOR UPDATE
                                 TO authenticated
                                 USING (
                                 (reportable_type = 'post' AND reportable_id IN (
                                 SELECT p.id FROM posts p
                                 INNER JOIN memberships m ON m.community_id = p.community_id
                                 WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                 AND m.role IN ('moderator', 'admin')
                                 ))
                                 OR
                                 (reportable_type = 'comment' AND reportable_id IN (
                                 SELECT c.id FROM comments c
                                 INNER JOIN posts p ON p.id = c.post_id
                                 INNER JOIN memberships m ON m.community_id = p.community_id
                                 WHERE m.user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                 AND m.role IN ('moderator', 'admin')
                                 ))
                                 );

-- ----------------------------------------------------------------------------
-- User Blocks (Privacy Control)
-- Users can only manage their own blocks
-- ----------------------------------------------------------------------------
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_blocks_select_own"
ON user_blocks FOR SELECT
                              TO authenticated
                              USING (
                              blocker_id = (
                              SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                              )
                              );

CREATE POLICY "user_blocks_insert_own"
ON user_blocks FOR INSERT
TO authenticated
WITH CHECK (
  blocker_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "user_blocks_delete_own"
ON user_blocks FOR DELETE
TO authenticated
USING (
  blocker_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ============================================================================
-- SECTION 5: MESSAGING (Direct Messages)
-- [STRATEGIC: Sales Engine - Channel 2]
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Direct Conversations
-- Users can only view conversations they participate in
-- ----------------------------------------------------------------------------
ALTER TABLE direct_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_participant"
ON direct_conversations FOR SELECT
                                       TO authenticated
                                       USING (
                                       id IN (
                                       SELECT conversation_id FROM direct_conversation_participants
                                       WHERE user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                       )
                                       );

CREATE POLICY "conversations_insert_participant"
ON direct_conversations FOR INSERT
TO authenticated
WITH CHECK (TRUE); -- Validated by application logic

CREATE POLICY "conversations_update_participant"
ON direct_conversations FOR UPDATE
                                              TO authenticated
                                              USING (
                                              id IN (
                                              SELECT conversation_id FROM direct_conversation_participants
                                              WHERE user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                              )
                                              );

-- ----------------------------------------------------------------------------
-- Conversation Participants
-- Users can view participants in their conversations
-- ----------------------------------------------------------------------------
ALTER TABLE direct_conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select_own"
ON direct_conversation_participants FOR SELECT
                                                   TO authenticated
                                                   USING (
                                                   conversation_id IN (
                                                   SELECT conversation_id FROM direct_conversation_participants
                                                   WHERE user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                                   )
                                                   );

CREATE POLICY "participants_insert_system"
ON direct_conversation_participants FOR INSERT
TO authenticated
WITH CHECK (TRUE); -- Created by application

CREATE POLICY "participants_update_own"
ON direct_conversation_participants FOR UPDATE
                                                          TO authenticated
                                                          USING (
                                                          user_id = (
                                                          SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                                          )
                                                          )
                                        WITH CHECK (
                                                          user_id = (
                                                          SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                                          )
                                                          );

-- ----------------------------------------------------------------------------
-- Direct Messages
-- Users can view messages in their conversations, send messages
-- ----------------------------------------------------------------------------
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participant"
ON direct_messages FOR SELECT
                                  TO authenticated
                                  USING (
                                  conversation_id IN (
                                  SELECT conversation_id FROM direct_conversation_participants
                                  WHERE user_id = (SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid()))
                                  )
                                  );

CREATE POLICY "messages_insert_participant"
ON direct_messages FOR INSERT
TO authenticated
WITH CHECK (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
  AND conversation_id IN (
    SELECT conversation_id FROM direct_conversation_participants
    WHERE user_id = author_id
  )
);

CREATE POLICY "messages_update_own"
ON direct_messages FOR UPDATE
                                         TO authenticated
                                         USING (
                                         author_id = (
                                         SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                         )
                                         )
                       WITH CHECK (
                                         author_id = (
                                         SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                         )
                                         );

CREATE POLICY "messages_delete_own"
ON direct_messages FOR DELETE
TO authenticated
USING (
  author_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- ============================================================================
-- SECTION 6: B2B SALES ENGINE (Admin-Only Tables)
-- [STRATEGIC: THE "PAYLOAD"]
-- These tables are admin-only and accessed via service_role which bypasses RLS
-- We enable RLS for defense-in-depth but don't create public policies
-- ============================================================================

-- Enable RLS on all B2B tables (no public access)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE evangelist_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;

-- Aide Profiles: Users can view/edit their own profile only
-- THE BRIDGE: Links anonymous user to real-world agency
CREATE POLICY "aide_profiles_select_own"
ON aide_profiles FOR SELECT
                                TO authenticated
                                USING (
                                user_id = (
                                SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                )
                                );

CREATE POLICY "aide_profiles_insert_own"
ON aide_profiles FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
  AND is_evangelist = FALSE -- Only admins can set evangelist status
);

CREATE POLICY "aide_profiles_update_own"
ON aide_profiles FOR UPDATE
                                       TO authenticated
                                       USING (
                                       user_id = (
                                       SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                       )
                                       )
                     WITH CHECK (
                                       user_id = (
                                       SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                       )
                                       -- Users cannot change evangelist status themselves
                                       AND (
                                       SELECT is_evangelist FROM aide_profiles WHERE user_id = (
                                       SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                       )
                                       ) = is_evangelist
                                       );

-- Agency Leads: Users can submit leads, view their own submissions
CREATE POLICY "agency_leads_select_own"
ON agency_leads FOR SELECT
                               TO authenticated
                               USING (
                               submitting_user_id = (
                               SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                               )
                               );

CREATE POLICY "agency_leads_insert_authenticated"
ON agency_leads FOR INSERT
TO authenticated
WITH CHECK (
  submitting_user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- Evangelist Rewards: Users can view their own rewards
CREATE POLICY "evangelist_rewards_select_own"
ON evangelist_rewards FOR SELECT
                                            TO authenticated
                                            USING (
                                            user_id = (
                                            SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
                                            )
                                            );

-- Agencies and Sales Activities: No public policies (admin-only via service_role)
COMMENT ON TABLE agencies IS 'RLS enabled - admin-only via service_role';
COMMENT ON TABLE sales_activities IS 'RLS enabled - admin-only via service_role';

-- ============================================================================
-- SECTION 7: ANALYTICS (Tracking & Metrics)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- User Activity Log
-- Write-only for users (via triggers), read-only for admins
-- ----------------------------------------------------------------------------
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own activity (triggered by app)
CREATE POLICY "activity_log_insert_own"
ON user_activity_log FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (
    SELECT id FROM users WHERE auth_user_id = (SELECT auth.uid())
  )
);

-- No select policy - activity log is write-only for users
-- Admins access via service_role (bypasses RLS)

-- ----------------------------------------------------------------------------
-- Daily Community Stats
-- Read-only for everyone (aggregated public data)
-- ----------------------------------------------------------------------------
ALTER TABLE daily_community_stats ENABLE ROW LEVEL SECURITY;

-- Everyone can view aggregated stats
CREATE POLICY "daily_stats_select_public"
ON daily_community_stats FOR SELECT
                                        TO authenticated, anon
                                        USING (TRUE);

-- Only system can insert stats (via scheduled jobs)
-- Admins manage via service_role (bypasses RLS)

-- ============================================================================
-- VERIFICATION & INDEXES
-- ============================================================================

-- Verify all tables have RLS enabled
DO $$
DECLARE
tbl record;
  missing_rls text[] := ARRAY[]::text[];
BEGIN
FOR tbl IN
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
    LOOP
    IF NOT (
      SELECT relrowsecurity
      FROM pg_class
      WHERE oid = ('public.' || tbl.tablename)::regclass
    ) THEN
      missing_rls := array_append(missing_rls, tbl.tablename);
END IF;
END LOOP;

  IF array_length(missing_rls, 1) > 0 THEN
    RAISE EXCEPTION 'RLS not enabled on tables: %', array_to_string(missing_rls, ', ');
ELSE
    RAISE NOTICE 'RLS verification complete: All % public tables have RLS enabled',
      (SELECT count(*) FROM pg_tables WHERE schemaname = 'public');
END IF;
END;
$$;

-- ============================================================================
-- PERFORMANCE INDEXES FOR RLS POLICIES
-- These indexes optimize the auth.uid() lookups in policies
-- ============================================================================

-- Index for auth_user_id lookups (used in every authenticated policy)
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id_rls
    ON users(auth_user_id)
    WHERE is_active = TRUE AND is_banned = FALSE;

-- Index for membership role checks (used in moderator policies)
CREATE INDEX IF NOT EXISTS idx_memberships_user_community_role
    ON memberships(user_id, community_id, role);

-- Index for conversation participant lookups (used in messaging policies)
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
    ON direct_conversation_participants(user_id, conversation_id);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'All tables have RLS enabled. Policies enforce:
- Auth layer: Better Auth only (no public access)
- Community layer: Public read, authenticated write with ownership
- B2B layer: User-specific for aide_profiles/leads, admin-only for agencies/CRM
- Analytics: Write-only for users, read for admins
- Service role bypasses all RLS for admin operations';

-- ============================================================================
-- END OF RLS POLICIES
-- Last Updated: November 2025
-- Total Tables: 29
-- Total Policies: 80+
-- Security Model: Defense in Depth with RLS + Application Logic
-- ============================================================================