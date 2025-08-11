-- Create triggers to populate activities table for notifications

-- Function to create activity records
CREATE OR REPLACE FUNCTION create_activity(
  activity_type text,
  user_id_param uuid,
  target_user_id_param uuid,
  dream_id_param uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO activities (type, user_id, target_user_id, dream_id)
  VALUES (activity_type, user_id_param, target_user_id_param, dream_id_param);
END;
$$;

-- Trigger for likes
CREATE OR REPLACE FUNCTION handle_like_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dream_owner_id uuid;
BEGIN
  -- Get the dream owner
  SELECT user_id INTO dream_owner_id
  FROM dream_entries
  WHERE id = NEW.dream_id;
  
  -- Only create activity if someone else liked the dream (not self-like)
  IF dream_owner_id IS NOT NULL AND dream_owner_id != NEW.user_id THEN
    PERFORM create_activity('like', NEW.user_id, dream_owner_id, NEW.dream_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for comments
CREATE OR REPLACE FUNCTION handle_comment_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dream_owner_id uuid;
BEGIN
  -- Get the dream owner
  SELECT user_id INTO dream_owner_id
  FROM dream_entries
  WHERE id = NEW.dream_id;
  
  -- Only create activity if someone else commented (not self-comment)
  IF dream_owner_id IS NOT NULL AND dream_owner_id != NEW.user_id THEN
    PERFORM create_activity('comment', NEW.user_id, dream_owner_id, NEW.dream_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for messages
CREATE OR REPLACE FUNCTION handle_message_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create activity for the receiver
  PERFORM create_activity('message', NEW.sender_id, NEW.receiver_id, NEW.shared_dream_id);
  
  RETURN NEW;
END;
$$;

-- Trigger for follows
CREATE OR REPLACE FUNCTION handle_follow_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create activity for the person being followed
  PERFORM create_activity('follow', NEW.follower_id, NEW.followed_id, NULL);
  
  RETURN NEW;
END;
$$;

-- Create triggers on the respective tables

-- Trigger for likes (using existing likes table)
DROP TRIGGER IF EXISTS trigger_like_activity ON likes;
CREATE TRIGGER trigger_like_activity
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_activity();

-- Trigger for comments (using existing comments table)
DROP TRIGGER IF EXISTS trigger_comment_activity ON comments;
CREATE TRIGGER trigger_comment_activity
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_activity();

-- Trigger for messages
DROP TRIGGER IF EXISTS trigger_message_activity ON messages;
CREATE TRIGGER trigger_message_activity
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_activity();

-- Trigger for follows
DROP TRIGGER IF EXISTS trigger_follow_activity ON follows;
CREATE TRIGGER trigger_follow_activity
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION handle_follow_activity();

-- Also check dream_comments table for comments
DROP TRIGGER IF EXISTS trigger_dream_comment_activity ON dream_comments;
CREATE TRIGGER trigger_dream_comment_activity
  AFTER INSERT ON dream_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_activity();

-- Update RLS policies for activities table to allow inserts
DROP POLICY IF EXISTS "Users can create activities" ON activities;
CREATE POLICY "Users can create activities"
  ON activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);