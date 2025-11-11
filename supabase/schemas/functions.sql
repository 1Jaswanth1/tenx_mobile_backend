-- ============================================================================
-- FILE: supabase/schemas/functions.sql
-- SECTION: Database Functions & Triggers
-- 
-- Automated database operations and business logic
-- ============================================================================

-- ============================================================================
-- Function: Update 'updated_at' timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aide_profiles_updated_at BEFORE UPDATE ON aide_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Function: Increment karma on upvote
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_karma_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'upvote' THEN
    IF NEW.votable_type = 'post' THEN
      UPDATE users SET karma = karma + 1
      WHERE id = (SELECT author_id FROM posts WHERE id = NEW.votable_id);
    ELSIF NEW.votable_type = 'comment' THEN
      UPDATE users SET karma = karma + 1
      WHERE id = (SELECT author_id FROM comments WHERE id = NEW.votable_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER karma_on_vote_insert AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION increment_karma_on_vote();

-- ============================================================================
-- Function: Decrement karma on vote removal
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_karma_on_vote_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.vote_type = 'upvote' THEN
    IF OLD.votable_type = 'post' THEN
      UPDATE users SET karma = karma - 1
      WHERE id = (SELECT author_id FROM posts WHERE id = OLD.votable_id);
    ELSIF OLD.votable_type = 'comment' THEN
      UPDATE users SET karma = karma - 1
      WHERE id = (SELECT author_id FROM comments WHERE id = OLD.votable_id);
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER karma_on_vote_delete AFTER DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION decrement_karma_on_vote_delete();

-- ============================================================================
-- Function: Update vote counts on posts/comments
-- ============================================================================
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
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      IF NEW.votable_type = 'post' THEN
        IF NEW.vote_type = 'upvote' THEN
          UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.votable_id;
        ELSE
          UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.votable_id;
        END IF;
      ELSIF NEW.votable_type = 'comment' THEN
        IF NEW.vote_type = 'upvote' THEN
          UPDATE comments SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.votable_id;
        ELSE
          UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.votable_id;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_counts_trigger AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- ============================================================================
-- Function: Update comment count on posts
-- ============================================================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1, last_activity_at = NOW()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_count_trigger AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================================================
-- Function: Update community member count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_count_trigger AFTER INSERT OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- ============================================================================
-- Function: Update community post count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET post_count = post_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET post_count = post_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_count_trigger AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_community_post_count();

-- ============================================================================
-- Function: Calculate comment path for nested threading
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_comment_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.id::TEXT;
    NEW.depth = 0;
    NEW.root_id = NEW.id;
  ELSE
    SELECT path || '.' || NEW.id::TEXT, depth + 1, COALESCE(root_id, id)
    INTO NEW.path, NEW.depth, NEW.root_id
    FROM comments WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_path_trigger BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION calculate_comment_path();

-- ============================================================================
-- Function: Create notification on post/comment reply
-- ============================================================================
CREATE OR REPLACE FUNCTION create_notification_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_author_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN
    -- Post reply
    IF NEW.parent_id IS NULL THEN
      SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
      IF NEW.author_id != post_author_id THEN
        INSERT INTO notifications (user_id, type, title, message, actor_id, post_id, comment_id)
        VALUES (
          post_author_id,
          'post_reply',
          'New reply on your post',
          LEFT(NEW.content, 100),
          NEW.author_id,
          NEW.post_id,
          NEW.id
        );
      END IF;
    ELSE
      -- Comment reply
      SELECT author_id INTO parent_author_id FROM comments WHERE id = NEW.parent_id;
      IF NEW.author_id != parent_author_id THEN
        INSERT INTO notifications (user_id, type, title, message, actor_id, post_id, comment_id)
        VALUES (
          parent_author_id,
          'comment_reply',
          'New reply on your comment',
          LEFT(NEW.content, 100),
          NEW.author_id,
          NEW.post_id,
          NEW.id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_on_comment_trigger AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_reply();

-- ============================================================================
-- Function: Update agency estimated value
-- ============================================================================
CREATE OR REPLACE FUNCTION update_agency_estimated_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avg_census IS NOT NULL THEN
    NEW.estimated_annual_value = NEW.avg_census * 40 * 12;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agency_value_trigger BEFORE INSERT OR UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_agency_estimated_value();
