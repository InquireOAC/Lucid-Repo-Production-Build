

## Plan: Admin Poll Results + Auto Challenge Entry on Dream Save

### Problem
1. **Polls**: Admin dashboard shows polls in the announcements list but has no way to see vote results/standings
2. **Challenges**: There is no mechanism to auto-enter a dream into a challenge when a user tags it with the challenge's `required_tag`. The `challenge_entries` table exists but is never populated.

### Changes

#### 1. Add Poll Results to Admin Announcements List (`src/components/admin/AnnouncementsList.tsx`)
- For poll-type announcements, add an expandable results section
- Call the existing `get_poll_results` RPC to fetch vote counts
- Display horizontal bar chart with option names, vote counts, and percentages
- Show total votes count

#### 2. Create DB trigger to auto-enter dreams into active challenges (`migration`)
- Create a trigger function `auto_enter_challenge()` on `dream_entries` INSERT/UPDATE
- When a dream is inserted or its tags are updated, check if any tag matches an active challenge's `required_tag`
- If match found and no existing entry, insert into `challenge_entries`
- This ensures users automatically participate in challenges by using the hashtag

```sql
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

CREATE TRIGGER on_dream_check_challenge
  AFTER INSERT OR UPDATE OF tags ON dream_entries
  FOR EACH ROW EXECUTE FUNCTION auto_enter_challenge();
```

#### 3. Add unique constraint to prevent duplicate entries (`migration`)
- Add a unique constraint on `(challenge_id, dream_id)` so the `ON CONFLICT DO NOTHING` works

### Files
| File | Action |
|---|---|
| `src/components/admin/AnnouncementsList.tsx` | Add expandable poll results for poll-type announcements |
| Migration SQL | Create `auto_enter_challenge` trigger + unique constraint on `challenge_entries` |

