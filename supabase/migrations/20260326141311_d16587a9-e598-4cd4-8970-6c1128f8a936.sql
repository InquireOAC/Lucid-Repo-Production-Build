
-- Add unique constraint on challenge_entries for ON CONFLICT DO NOTHING
ALTER TABLE public.challenge_entries
ADD CONSTRAINT challenge_entries_challenge_dream_unique UNIQUE (challenge_id, dream_id);

-- Create trigger function to auto-enter dreams into active challenges
CREATE OR REPLACE FUNCTION public.auto_enter_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge RECORD;
  tag text;
BEGIN
  IF NEW.tags IS NULL OR array_length(NEW.tags, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  FOR challenge IN
    SELECT id, required_tag FROM community_challenges
    WHERE status = 'active'
      AND now() BETWEEN start_date AND end_date
  LOOP
    FOREACH tag IN ARRAY NEW.tags
    LOOP
      IF lower(trim(tag)) = lower(trim(challenge.required_tag)) 
         OR lower(trim('#' || tag)) = lower(trim(challenge.required_tag)) THEN
        INSERT INTO challenge_entries (challenge_id, user_id, dream_id)
        VALUES (challenge.id, NEW.user_id, NEW.id)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on dream_entries
CREATE TRIGGER on_dream_check_challenge
  AFTER INSERT OR UPDATE OF tags ON dream_entries
  FOR EACH ROW EXECUTE FUNCTION auto_enter_challenge();
