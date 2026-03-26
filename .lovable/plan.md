

## Plan: Make Polls, Announcements, and Challenges Fully Operational

### Problem
1. **Polls**: Tapping a poll announcement shows the same generic detail modal as regular announcements -- no voting UI, no results display
2. **Poll results**: No way to see vote counts/percentages after voting
3. The `poll_responses` table exists but is never used in frontend code

The announcement and challenge admin systems (composing, toggling, deleting, managing entries) are already functional. The main gap is the poll voting experience.

### Changes

#### 1. New component: `PollVotingModal` (`src/components/announcements/PollVotingModal.tsx`)
- Full-screen dialog that opens when a poll-type announcement is tapped
- Shows the poll question (title) prominently
- Lists poll options as tappable cards (from `metadata.options`)
- On tap: insert into `poll_responses` table, then show results
- After voting (or if already voted): show results view with animated horizontal bar chart showing each option's vote count and percentage
- Uses a new `usePollVotes` hook to fetch/submit votes
- "Dismiss" button at bottom to close and dismiss the announcement

#### 2. New hook: `src/hooks/usePollVotes.ts`
- `fetchMyVote(announcementId)` -- check if user already voted
- `fetchResults(announcementId)` -- query all responses for this poll (needs an RLS policy update -- see below)
- `submitVote(announcementId, option)` -- insert into `poll_responses`

#### 3. Database migration: Allow all authenticated users to see poll response counts
- Currently only admins and the voter can see `poll_responses`
- Add a SELECT policy: all authenticated users can view poll responses (needed for showing aggregated results)
- Alternative: create a security-definer function `get_poll_results(announcement_id)` that returns aggregated counts without exposing individual rows

I'll use the **security-definer function** approach to avoid exposing individual votes:
```sql
CREATE OR REPLACE FUNCTION public.get_poll_results(p_announcement_id uuid)
RETURNS TABLE(selected_option text, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT selected_option, count(*) as vote_count
  FROM poll_responses
  WHERE announcement_id = p_announcement_id
  GROUP BY selected_option;
$$;
```

#### 4. Update `AnnouncementBanner.tsx`
- When `currentAnnouncement.type === 'poll'`, open the new `PollVotingModal` instead of the generic detail dialog

### Files
| File | Action |
|---|---|
| `src/components/announcements/PollVotingModal.tsx` | Create -- voting UI + results display |
| `src/hooks/usePollVotes.ts` | Create -- vote submission, fetch user vote, fetch results via RPC |
| `src/components/announcements/AnnouncementBanner.tsx` | Modify -- route poll taps to PollVotingModal |
| Migration SQL | Add `get_poll_results` RPC function |

### UI Design for PollVotingModal
- Dark glass card matching app aesthetic
- Poll question as header with 📊 emoji
- Options as rounded cards with radio-style selection
- "Vote" button after selecting
- Results view: horizontal bars with percentages, total vote count, checkmark on user's selection
- Smooth transitions between vote and results states using framer-motion

