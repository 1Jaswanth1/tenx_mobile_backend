-- ============================================================================
-- FILE: supabase/schemas/messaging.sql
-- SECTION: Direct Messaging System
-- 
-- [STRATEGIC: Sales Engine - Channel 2]
-- Tables for private 1-to-1 and group messaging
-- ============================================================================

-- ============================================================================
-- Direct Conversations
-- ============================================================================
CREATE TABLE direct_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Conversation Type
  is_group BOOLEAN DEFAULT FALSE,
  title TEXT, -- For group conversations
  
  -- Last Message Cache (for efficient list views)
  last_message_content TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Conversation Participants
-- ============================================================================
CREATE TABLE direct_conversation_participants (
  conversation_id UUID NOT NULL REFERENCES direct_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Participant Status
  is_muted BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  
  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_dm_participants_user ON direct_conversation_participants(user_id, last_read_at DESC);
CREATE INDEX idx_dm_participants_unread ON direct_conversation_participants(user_id, unread_count) WHERE unread_count > 0;

-- ============================================================================
-- Direct Messages
-- ============================================================================
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Message Data
  conversation_id UUID NOT NULL REFERENCES direct_conversations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  
  -- Attachments (optional)
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'file'
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT dm_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 5000)
);

CREATE INDEX idx_dm_messages_convo ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX idx_dm_messages_author ON direct_messages(author_id);
