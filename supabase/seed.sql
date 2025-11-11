-- ============================================================================
-- FILE: supabase/seed.sql
-- PURPOSE: Seed data for local development
-- 
-- This file populates the database with test data for local development.
-- Run with: supabase db reset
-- ============================================================================

-- ============================================================================
-- SECTION 1: Create System User
-- ============================================================================
INSERT INTO auth_users (id, email, name, email_verified)
VALUES ('00000000-0000-4000-8000-000000000001'::UUID, 'system@10xr.com', '10xR System', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, auth_user_id, username, display_name, is_active)
VALUES (
  '00000000-0000-4000-8000-000000000002'::UUID,
  '00000000-0000-4000-8000-000000000001'::UUID,
  'system',
  '10xR System',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: Create Default Communities
-- ============================================================================
INSERT INTO communities (id, name, slug, description, created_by, allow_anonymous_posts)
VALUES 
  (
    '11111111-1111-4111-8111-111111111111'::UUID,
    'Aides & CNAs',
    's/aides',
    'A safe space for certified nursing aides and caregivers to connect, share experiences, and support each other.',
    '00000000-0000-4000-8000-000000000002'::UUID,
    TRUE
  ),
  (
    '22222222-2222-4222-8222-222222222222'::UUID,
    'Nurses',
    's/nurses',
    'For registered nurses (RN), licensed practical nurses (LPN), and nursing professionals.',
    '00000000-0000-4000-8000-000000000002'::UUID,
    TRUE
  ),
  (
    '33333333-3333-4333-8333-333333333333'::UUID,
    'DONs & Leadership',
    's/leaders',
    'Directors of Nursing, case managers, and healthcare administrators.',
    '00000000-0000-4000-8000-000000000002'::UUID,
    FALSE
  ),
  (
    '44444444-4444-4444-8444-444444444444'::UUID,
    'Agency Owners',
    's/owners',
    'For hospice and home health agency owners to discuss business operations.',
    '00000000-0000-4000-8000-000000000002'::UUID,
    FALSE
  ),
  (
    '55555555-5555-4555-8555-555555555555'::UUID,
    'General',
    's/general',
    'General discussions about hospice, home health, and end-of-life care.',
    '00000000-0000-4000-8000-000000000002'::UUID,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: Create Test Users (for local development only)
-- ============================================================================

-- Test User 1: Regular Aide
INSERT INTO auth_users (id, email, name, email_verified)
VALUES ('10000000-0000-4000-8000-000000000001'::UUID, 'aide1@test.com', 'Test Aide', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, auth_user_id, username, display_name, karma)
VALUES (
  '10000000-0000-4000-8000-000000000002'::UUID,
  '10000000-0000-4000-8000-000000000001'::UUID,
  'test_aide_1',
  'Sarah the Aide',
  150
)
ON CONFLICT (id) DO NOTHING;

-- Test User 2: Experienced RN
INSERT INTO auth_users (id, email, name, email_verified)
VALUES ('20000000-0000-4000-8000-000000000001'::UUID, 'nurse1@test.com', 'Test Nurse', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, auth_user_id, username, display_name, karma)
VALUES (
  '20000000-0000-4000-8000-000000000002'::UUID,
  '20000000-0000-4000-8000-000000000001'::UUID,
  'experienced_rn',
  'Maria the RN',
  500
)
ON CONFLICT (id) DO NOTHING;

-- Test User 3: DON
INSERT INTO auth_users (id, email, name, email_verified)
VALUES ('30000000-0000-4000-8000-000000000001'::UUID, 'don1@test.com', 'Test DON', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, auth_user_id, username, display_name, karma)
VALUES (
  '30000000-0000-4000-8000-000000000002'::UUID,
  '30000000-0000-4000-8000-000000000001'::UUID,
  'director_johnson',
  'Director Johnson',
  1000
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 4: Join Communities
-- ============================================================================
INSERT INTO memberships (user_id, community_id, flair_text, role)
VALUES 
  -- Aide joins s/aides
  ('10000000-0000-4000-8000-000000000002'::UUID, '11111111-1111-4111-8111-111111111111'::UUID, 'CNA - 3 Yrs', 'member'),
  -- RN joins s/nurses
  ('20000000-0000-4000-8000-000000000002'::UUID, '22222222-2222-4222-8222-222222222222'::UUID, 'RN - 10 Yrs', 'member'),
  -- DON joins s/leaders
  ('30000000-0000-4000-8000-000000000002'::UUID, '33333333-3333-4333-8333-333333333333'::UUID, 'DON - 20 Yrs', 'moderator')
ON CONFLICT (user_id, community_id) DO NOTHING;

-- ============================================================================
-- SECTION 5: Create Sample Posts
-- ============================================================================
INSERT INTO posts (id, title, content, author_id, community_id, is_anonymous)
VALUES 
  (
    '40000000-0000-4000-8000-000000000001'::UUID,
    'Feeling burned out today',
    'I love what I do, but today was really hard. Had to say goodbye to a patient who felt like family. Anyone else struggling?',
    '10000000-0000-4000-8000-000000000002'::UUID,
    '11111111-1111-4111-8111-111111111111'::UUID,
    TRUE  -- Anonymous post
  ),
  (
    '40000000-0000-4000-8000-000000000002'::UUID,
    'Tips for new CNAs?',
    'Just got certified! Starting my first job next week. Any advice from experienced aides?',
    '10000000-0000-4000-8000-000000000002'::UUID,
    '11111111-1111-4111-8111-111111111111'::UUID,
    FALSE
  ),
  (
    '40000000-0000-4000-8000-000000000003'::UUID,
    'Best practices for patient comfort in final days',
    'After 10 years as an RN in hospice, here are my top 10 tips for ensuring patient comfort...',
    '20000000-0000-4000-8000-000000000002'::UUID,
    '22222222-2222-4222-8222-222222222222'::UUID,
    FALSE
  ),
  (
    '40000000-0000-4000-8000-000000000004'::UUID,
    '[AMA] I''ve been a DON for 20 years',
    'Ask me anything about leadership, managing teams, or working with families.',
    '30000000-0000-4000-8000-000000000002'::UUID,
    '33333333-3333-4333-8333-333333333333'::UUID,
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- Pin the AMA post
UPDATE posts SET is_pinned = TRUE WHERE id = '40000000-0000-4000-8000-000000000004'::UUID;

-- ============================================================================
-- SECTION 6: Create Sample Comments
-- ============================================================================
INSERT INTO comments (content, author_id, post_id, is_anonymous)
VALUES 
  (
    'I feel you. Some days are harder than others. You''re making a real difference, even when it doesn''t feel like it.',
    '20000000-0000-4000-8000-000000000002'::UUID,
    '40000000-0000-4000-8000-000000000001'::UUID,
    TRUE  -- Anonymous comment
  ),
  (
    'My biggest tip: Always introduce yourself to patients and family. Build that trust early!',
    '30000000-0000-4000-8000-000000000002'::UUID,
    '40000000-0000-4000-8000-000000000002'::UUID,
    FALSE
  ),
  (
    'What''s the best way to handle conflict between team members?',
    '20000000-0000-4000-8000-000000000002'::UUID,
    '40000000-0000-4000-8000-000000000004'::UUID,
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 7: Create Sample Votes
-- ============================================================================
INSERT INTO votes (user_id, votable_id, votable_type, vote_type)
VALUES 
  ('20000000-0000-4000-8000-000000000002'::UUID, '40000000-0000-4000-8000-000000000001'::UUID, 'post', 'upvote'),
  ('30000000-0000-4000-8000-000000000002'::UUID, '40000000-0000-4000-8000-000000000001'::UUID, 'post', 'upvote'),
  ('10000000-0000-4000-8000-000000000002'::UUID, '40000000-0000-4000-8000-000000000003'::UUID, 'post', 'upvote')
ON CONFLICT (user_id, votable_id, votable_type) DO NOTHING;

-- ============================================================================
-- SECTION 8: Create Sample Agency (for testing B2B features)
-- ============================================================================
INSERT INTO agencies (id, name, city, state, status, avg_census)
VALUES (
  '50000000-0000-4000-8000-000000000001'::UUID,
  'Sunrise Hospice Services',
  'Phoenix',
  'AZ',
  'prospect',
  75
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 9: Create Sample Aide Profile (for testing bridge)
-- ============================================================================
INSERT INTO aide_profiles (user_id, agency_id, role, years_of_experience, allow_data_aggregation)
VALUES (
  '10000000-0000-4000-8000-000000000002'::UUID,
  '50000000-0000-4000-8000-000000000001'::UUID,
  'cna',
  3,
  TRUE
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- Success Message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA LOADED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test Users Created:';
  RAISE NOTICE '  - test_aide_1 (aide1@test.com)';
  RAISE NOTICE '  - experienced_rn (nurse1@test.com)';
  RAISE NOTICE '  - director_johnson (don1@test.com)';
  RAISE NOTICE 'Communities: 5';
  RAISE NOTICE 'Sample Posts: 4';
  RAISE NOTICE 'Sample Comments: 3';
  RAISE NOTICE '========================================';
END $$;
