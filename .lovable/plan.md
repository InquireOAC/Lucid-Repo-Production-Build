
# Fix Toast on Dream Open and Fix Avatar/Username Display

## Problem 1: "Dream updated successfully" toast on open
When you open a dream from the journal, the `handleDreamDetailUpdate` function wraps even minor updates (like comment count changes) into a full payload that includes `title`, `content`, etc. The toast logic in `useJournalActions` sees `title` in the update and shows "Dream updated successfully" even though nothing was actually edited.

**Fix in `src/pages/Journal.tsx`**: Change `handleDreamDetailUpdate` to only pass the actual changed fields to `handleEditDream`, instead of rebuilding the entire dream payload. For comment-count-only updates, skip calling `handleEditDream` entirely and just update local state.

## Problem 2: Avatar shows generic star and username shows "@anon"
Journal entries are fetched from the database using `select("*")` without joining the `profiles` table. So `dream.profiles` is always empty/undefined. The DreamDetail component falls back to a generic SymbolAvatar and "@anon".

**Fix in `src/components/DreamDetail.tsx`**: When viewing your own dream (detected via `isOwner`), use the current user's profile from `AuthContext` instead of relying on `dream.profiles`. The auth context already has `profile` with `username`, `display_name`, `avatar_symbol`, `avatar_color`, and `avatar_url`.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Journal.tsx` | Rewrite `handleDreamDetailUpdate` to pass only actual changed fields; skip edit call for comment-count-only updates |
| `src/components/DreamDetail.tsx` | Use `profile` from AuthContext for own dreams instead of relying on `dream.profiles` |
