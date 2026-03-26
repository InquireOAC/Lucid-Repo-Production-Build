

## Plan: Fix Likes Table Mismatch

### Root Cause
There are two like hooks using **different database tables**:
- `useDreamLikes` (used on `DreamStoryPage`) reads/writes from the `likes` table
- `useLikes` (used on Lucid Repo list views) and `useProfileDreams` (profile "Likes" tab) both use the `dream_likes` table

When a user taps the heart on a dream story page, the like goes into `likes` but the profile reads from `dream_likes` — so it never appears.

### Fix
Update `src/hooks/useDreamLikes.tsx` to use the `dream_likes` table instead of `likes`, matching the rest of the codebase.

**Changes in `useDreamLikes.tsx`**:
- Line 13: Change `.from("likes")` to `.from("dream_likes")`
- Line 24: Change `.from("likes")` to `.from("dream_likes")`
- Line 30: Change `.from("likes")` to `.from("dream_likes")`

Also update the like count sync: after toggling, refetch the actual count from `dream_likes` and update `dream_entries.like_count` (same pattern as `useLikes` does) so counts stay consistent.

### Files
| File | Action |
|---|---|
| `src/hooks/useDreamLikes.tsx` | Change all `likes` table references to `dream_likes`, add like_count sync |

