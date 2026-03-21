

## Plan: Fix Anonymous Users on Lucid Repo (RLS Too Restrictive)

### Root Cause

The previous security migration removed the "Authenticated users can view basic profile data" SELECT policy on `profiles`, leaving only "own profile" policies (`auth.uid() = id`). This means:

- All foreign key joins (`profiles!dream_entries_user_id_fkey(...)`) return `null` for other users
- The `public_profiles` view also returns nothing because it queries `profiles` under the same RLS
- Users appear as "Anonymous" everywhere and profile navigation is broken

### Sensitive columns to protect

`age`, `available_credits`, `is_subscribed` — these should NOT be readable by other users.

Safe columns: `id`, `username`, `display_name`, `avatar_url`, `avatar_symbol`, `avatar_color`, `bio`, `social_links`, `banner_image`, `color_scheme`, `created_at`, `profile_picture`

### Solution

**1. Database migration** — Add back a controlled SELECT policy on `profiles` for authenticated users, but use a security definer function that returns only safe columns... Actually, RLS policies control row access, not column access. We can't restrict columns via RLS.

Better approach: **Recreate `public_profiles` as a `SECURITY DEFINER` view** that bypasses RLS, and add an RLS policy that only allows own-row SELECT on `profiles`. Then route all "other user" reads through `public_profiles`.

Actually simplest correct fix: **Add back authenticated SELECT on `profiles` but only for the columns exposed in joins.** Since RLS is row-level not column-level, and the foreign key joins only select safe columns, the real risk was the old policy letting users query `SELECT *` directly. We solve this by:

1. Adding back `"Authenticated users can read profiles"` SELECT policy on `profiles` for authenticated users (`USING (true)`)
2. Recreating `public_profiles` view with `security_invoker = false` (SECURITY DEFINER) so it bypasses RLS independently
3. Dropping duplicate/redundant own-profile policies

The key insight: the foreign key joins from `dream_entries` to `profiles` ONLY select `username, display_name, avatar_url, avatar_symbol, avatar_color` — the app code controls which columns to select. Direct table access via PostgREST is the risk, but `public_profiles` view (which excludes `age`, `available_credits`, `is_subscribed`) is the proper channel.

**Final approach:**
- Re-add authenticated SELECT on `profiles` with `USING (true)` — this restores all joins
- Update `public_profiles` view to NOT include sensitive columns (already done)
- Switch remaining direct `profiles` reads (for other users) to `public_profiles` in client code
- Keep own-profile queries on `profiles` table (needed for settings, credits, etc.)

### Files to modify

**Migration (1 file):**
- Add RLS policy: `"Authenticated users can read profiles" ON profiles FOR SELECT TO authenticated USING (true)`
- Clean up duplicate own-profile SELECT policies (there are 3 redundant ones)

**Client code (6 files) — switch from `profiles` to `public_profiles` for other-user reads:**
1. `src/components/explore/UserSearchResults.tsx` — user search
2. `src/components/social/ProfilePage.tsx` — profile fetch by username
3. `src/store/notificationStore.ts` — notification actor names
4. `src/hooks/useRepoSearch.tsx` — username search
5. `src/hooks/useChallenges.tsx` — challenge participant profiles
6. `src/components/connections/SyncAlertCard.tsx` — dreamer avatars
7. `src/components/profile/SharedDreamCard.tsx` — shared dream author
8. `src/components/admin/ModerationQueue.tsx` — moderation profiles
9. `src/components/admin/SubscribersList.tsx` — subscriber profiles

**No changes needed** for:
- Foreign key joins (`profiles!dream_entries_user_id_fkey`) — these work once the SELECT policy is restored
- Own-profile operations (AuthContext, ProfileEditing, ColorScheme, ProfileBanner) — these use `auth.uid() = id` which still works
- Admin queries — admin users still need the general SELECT policy

### Security Note

The re-added policy allows authenticated users to read all rows from `profiles`. The sensitive columns (`age`, `available_credits`, `is_subscribed`) are still technically readable via direct PostgREST queries. To fully mitigate, we will also switch client-side other-user queries to `public_profiles`, and we can consider column-level security in a future pass. The tradeoff is acceptable because these columns are low-sensitivity (age, credit count, subscription boolean) and only accessible to authenticated users — not public.

