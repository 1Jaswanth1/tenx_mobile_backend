-- ============================================================================
-- 1-on-1 Direct Chat Schema for 10xR Community Platform
-- ============================================================================
--
-- This schema defines the core structure for 1-on-1 direct messaging between
-- users, similar to LinkedIn or Slack DMs. Each pair of users shares a single
-- constant chat room.
--
-- Tables:
--   - chat_room: Represents a chat room (always 1-on-1 for direct chats)
--   - chat_room_member: Links users to chat rooms (exactly 2 members per room)
--   - message: Contains all messages within chat rooms
--
-- Security:
--   - Row Level Security (RLS) enabled on all tables
--   - Access policies ensure users can only see rooms they're members of
--   - Message access restricted to room members
--
-- Foreign Keys:
--   - All user references link to the 'users' table (our app's user profiles)
--   - Cascade deletes ensure data integrity
--
-- ============================================================================

-- ============================================================================
-- Table: chat_room
-- ============================================================================
-- Represents a chat room between users. For 1-on-1 chats, each room has
-- exactly 2 members, and the same pair of users always share the same room.
--
-- Columns:
--   - id: Unique identifier for the room
--   - name: Display name (can be auto-generated from member usernames)
--   - is_direct: Boolean flag (always true for 1-on-1 chats)
--   - created_at: Timestamp of room creation
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_room (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_direct BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE chat_room IS 'Chat rooms for 1-on-1 direct messaging between users';
COMMENT ON COLUMN chat_room.is_direct IS 'Always true for 1-on-1 chats, false for group chats (future)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_room_created_at ON chat_room(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_is_direct ON chat_room(is_direct) WHERE is_direct = true;

-- ============================================================================
-- Table: chat_room_member
-- ============================================================================
-- Links users to chat rooms. For 1-on-1 chats, each room must have exactly
-- 2 members. Ensures that the same pair of users cannot create multiple rooms.
--
-- Columns:
--   - chat_room_id: Reference to the chat room
--   - member_id: Reference to the user (from 'users' table)
--   - joined_at: Timestamp when user joined the room
--   - last_read_at: Timestamp of last message read (for unread count)
--
-- Constraints:
--   - Composite primary key on (chat_room_id, member_id)
--   - Foreign keys cascade on delete
--   - Unique constraint ensures same user pair shares only one room
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_room_member (
  chat_room_id UUID NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),

  -- Composite primary key
  PRIMARY KEY (chat_room_id, member_id)
);

-- Add comments
COMMENT ON TABLE chat_room_member IS 'Links users to chat rooms (exactly 2 members for 1-on-1 chats)';
COMMENT ON COLUMN chat_room_member.last_read_at IS 'Timestamp of last message read by this user, used for unread count';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_chat_room_member_member_id ON chat_room_member(member_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_member_room_id ON chat_room_member(chat_room_id);

-- ============================================================================
-- Unique Constraint: Ensure Same User Pair Shares Only One Room
-- ============================================================================
-- This trigger prevents duplicate chat rooms between the same pair of users.
-- It checks before inserting a new member if the user pair already has a room.
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_duplicate_chat_room()
RETURNS TRIGGER AS $$
DECLARE
  existing_room_id UUID;
  other_member_id UUID;
BEGIN
  -- Only check for direct chat rooms (1-on-1)
  IF (SELECT is_direct FROM chat_room WHERE id = NEW.chat_room_id) THEN
    -- Get the other member in this room (if any)
    SELECT member_id INTO other_member_id
    FROM chat_room_member
    WHERE chat_room_id = NEW.chat_room_id
      AND member_id != NEW.member_id
    LIMIT 1;

    -- If there's another member, check if these two users already have a room together
    IF other_member_id IS NOT NULL THEN
      SELECT crm1.chat_room_id INTO existing_room_id
      FROM chat_room_member crm1
      JOIN chat_room_member crm2 ON crm1.chat_room_id = crm2.chat_room_id
      JOIN chat_room cr ON crm1.chat_room_id = cr.id
      WHERE crm1.member_id = NEW.member_id
        AND crm2.member_id = other_member_id
        AND cr.is_direct = true
        AND crm1.chat_room_id != NEW.chat_room_id
      LIMIT 1;

      -- If a room already exists, prevent the insert
      IF existing_room_id IS NOT NULL THEN
        RAISE EXCEPTION 'Chat room already exists between these users: %', existing_room_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate rooms
CREATE TRIGGER check_duplicate_chat_room
  BEFORE INSERT ON chat_room_member
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_chat_room();

-- Add comment
COMMENT ON FUNCTION prevent_duplicate_chat_room IS 'Prevents creating duplicate 1-on-1 chat rooms between the same pair of users';

-- ============================================================================
-- Table: message
-- ============================================================================
-- Contains all messages within chat rooms. Messages are tied to both a room
-- and an author (user).
--
-- Columns:
--   - id: Unique identifier for the message
--   - chat_room_id: Reference to the chat room
--   - author_id: Reference to the user who sent the message
--   - text: Message content (max 10,000 characters)
--   - created_at: Timestamp when message was sent
--   - updated_at: Timestamp when message was last edited
--   - is_edited: Flag indicating if message was edited
--   - is_deleted: Soft delete flag for message removal
--
-- Constraints:
--   - Foreign keys cascade on delete
--   - Text content required and limited to 10,000 chars
-- ============================================================================

CREATE TABLE IF NOT EXISTS message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0 AND LENGTH(text) <= 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Add comments
COMMENT ON TABLE message IS 'Messages within chat rooms, linked to authors and rooms';
COMMENT ON COLUMN message.text IS 'Message content, max 10,000 characters';
COMMENT ON COLUMN message.is_edited IS 'True if message has been edited after creation';
COMMENT ON COLUMN message.is_deleted IS 'Soft delete flag, message content hidden but metadata preserved';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_message_chat_room_id ON message(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_message_author_id ON message(author_id);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_room_created ON message(chat_room_id, created_at DESC);

-- Composite index for fetching messages in a room ordered by time
CREATE INDEX IF NOT EXISTS idx_message_room_time_not_deleted
ON message(chat_room_id, created_at DESC)
WHERE is_deleted = false;

-- ============================================================================
-- Function: Update updated_at timestamp
-- ============================================================================
-- Automatically updates the updated_at column when a row is modified
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_chat_room_updated_at
  BEFORE UPDATE ON chat_room
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_updated_at
  BEFORE UPDATE ON message
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Setup
-- ============================================================================
-- Enable RLS on all tables and create policies for secure data access
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chat_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: chat_room
-- ============================================================================

-- Policy: Users can view rooms they are members of
CREATE POLICY "Users can view their chat rooms"
ON chat_room
FOR SELECT
USING (
  id IN (
    SELECT chat_room_id
    FROM chat_room_member
    WHERE member_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
);

-- Policy: Users can create new chat rooms (will be restricted by app logic)
CREATE POLICY "Users can create chat rooms"
ON chat_room
FOR INSERT
WITH CHECK (true);  -- App logic will ensure proper room creation

-- Policy: Users cannot update chat rooms directly
-- (This prevents name changes; app logic handles this)
CREATE POLICY "Users cannot update chat rooms"
ON chat_room
FOR UPDATE
USING (false);

-- Policy: Users cannot delete chat rooms directly
-- (App logic or admin functions handle room deletion)
CREATE POLICY "Users cannot delete chat rooms"
ON chat_room
FOR DELETE
USING (false);

-- ============================================================================
-- RLS Policies: chat_room_member
-- ============================================================================

-- Policy: Users can view members of rooms they're in
CREATE POLICY "Users can view room members"
ON chat_room_member
FOR SELECT
USING (
  chat_room_id IN (
    SELECT chat_room_id
    FROM chat_room_member
    WHERE member_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
);

-- Policy: Users can add themselves to rooms (app logic controls this)
CREATE POLICY "Users can join rooms"
ON chat_room_member
FOR INSERT
WITH CHECK (
  member_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can update their own membership (e.g., last_read_at)
CREATE POLICY "Users can update own membership"
ON chat_room_member
FOR UPDATE
USING (
  member_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  member_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can leave rooms (delete their membership)
CREATE POLICY "Users can leave rooms"
ON chat_room_member
FOR DELETE
USING (
  member_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- ============================================================================
-- RLS Policies: message
-- ============================================================================

-- Policy: Users can view messages in rooms they're members of
CREATE POLICY "Users can view messages in their rooms"
ON message
FOR SELECT
USING (
  chat_room_id IN (
    SELECT chat_room_id
    FROM chat_room_member
    WHERE member_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
);

-- Policy: Users can send messages to rooms they're members of
CREATE POLICY "Users can send messages to their rooms"
ON message
FOR INSERT
WITH CHECK (
  -- User must be author
  author_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
  AND
  -- Room must be one the user is a member of
  chat_room_id IN (
    SELECT chat_room_id
    FROM chat_room_member
    WHERE member_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
);

-- Policy: Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages"
ON message
FOR UPDATE
USING (
  author_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  author_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
  -- Prevent changing author or room
  AND author_id = (SELECT author_id FROM message WHERE id = message.id)
  AND chat_room_id = (SELECT chat_room_id FROM message WHERE id = message.id)
);

-- Policy: Users can soft-delete their own messages
CREATE POLICY "Users can delete own messages"
ON message
FOR UPDATE
USING (
  author_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- ============================================================================
-- Helper Functions for Chat Operations
-- ============================================================================

-- Function: Get or create a 1-on-1 chat room between two users
CREATE OR REPLACE FUNCTION get_or_create_chat_room(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  room_id UUID;
  room_name TEXT;
BEGIN
  -- Check if room already exists between these two users
  SELECT crm1.chat_room_id INTO room_id
  FROM chat_room_member crm1
  JOIN chat_room_member crm2 ON crm1.chat_room_id = crm2.chat_room_id
  JOIN chat_room cr ON crm1.chat_room_id = cr.id
  WHERE crm1.member_id = user1_id
    AND crm2.member_id = user2_id
    AND cr.is_direct = true
  LIMIT 1;

  -- If room doesn't exist, create it
  IF room_id IS NULL THEN
    -- Generate room name from usernames
    SELECT
      CONCAT(u1.username, ' & ', u2.username) INTO room_name
    FROM users u1, users u2
    WHERE u1.id = user1_id AND u2.id = user2_id;

    -- Create the room
    INSERT INTO chat_room (name, is_direct)
    VALUES (room_name, true)
    RETURNING id INTO room_id;

    -- Add both members
    INSERT INTO chat_room_member (chat_room_id, member_id)
    VALUES
      (room_id, user1_id),
      (room_id, user2_id);
  END IF;

  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_or_create_chat_room IS 'Get existing or create new 1-on-1 chat room between two users';

-- Function: Get unread message count for a user in a room
CREATE OR REPLACE FUNCTION get_unread_count(
  p_user_id UUID,
  p_room_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
  last_read TIMESTAMPTZ;
BEGIN
  -- Get user's last read timestamp
  SELECT last_read_at INTO last_read
  FROM chat_room_member
  WHERE chat_room_id = p_room_id AND member_id = p_user_id;

  -- Count messages after last read
  SELECT COUNT(*) INTO unread_count
  FROM message
  WHERE chat_room_id = p_room_id
    AND created_at > COALESCE(last_read, '1970-01-01'::TIMESTAMPTZ)
    AND author_id != p_user_id
    AND is_deleted = false;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_unread_count IS 'Get count of unread messages for a user in a specific room';

-- ============================================================================
-- Grant Permissions
-- ============================================================================
-- Grant necessary permissions for authenticated users
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_room TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_room_member TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_or_create_chat_room TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

-- ============================================================================
-- End of Schema
-- ============================================================================
