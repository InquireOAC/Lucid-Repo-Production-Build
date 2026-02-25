
# Enhanced Moderation Queue + Subscription Stats

## Overview
Three improvements to the Admin Dashboard:
1. **Moderation cards show dream content preview** (title + truncated text)
2. **Tapping a flag card opens a full detail modal** with the flagged dream content, image, reporter info, and action buttons (Remove Content, Keep Content, Dismiss)
3. **Active subscriptions stat card + subscriber list** in the dashboard

## Technical Changes

### 1. `src/components/admin/ModerationQueue.tsx` -- Major rewrite
- **Fetch flagged content with dream data**: Change the query to also fetch the related dream entry using `flagged_content_id` to look up `dream_entries` (title, content, image_url, user_id) and the reporter's profile (username)
- Since we can't do a foreign key join on `content_flags.flagged_content_id -> dream_entries.id` directly (no FK exists), we'll do a two-step fetch: get flags, then batch-fetch the related dream entries and reporter profiles
- **Card preview**: Each flag card now shows:
  - Flag reason badge + content type
  - Dream title (bold)
  - First 2 lines of dream content (truncated)
  - Reporter username + date
  - Tap anywhere on the card to open the detail modal
- **Detail modal** (using `Dialog` component):
  - Full dream content text
  - Dream image (if exists)
  - Dream author username
  - Flag reason + reporter notes + reporter username
  - Date flagged
  - Action buttons at bottom:
    - **Remove Content** -- Deletes or hides the dream (set `is_public = false` on the dream entry) and marks flag as "resolved"
    - **Keep Content** -- Marks the flag as "dismissed" (content stays)
    - **Delete Dream** -- Fully deletes the dream entry and marks flag as "resolved"

### 2. `src/hooks/useAdminStats.tsx` -- Add subscription count
- Add a new query: `supabase.from('stripe_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null)`
- Add `activeSubscriptions` to the stats interface and return value

### 3. `src/components/admin/CommunityStats.tsx` -- Add subscription stat card
- Add a new stat card with a `CreditCard` icon showing "Active Subs" count

### 4. `src/components/admin/UserManager.tsx` -- Show subscription status per user
- When searching users, also check if each user has an active subscription by querying `stripe_subscriptions`
- Show a small "Subscribed" badge next to users who have an active subscription, along with their plan name (derived from `price_id`)

### Database Changes
- **None required**. The `content_flags` table already has `flagged_content_id` and `flagged_content_type`. We'll use those to look up dream content. The admin already has RLS access to view all content flags and dream entries (public dreams are visible, and admin policies exist on content_flags). For setting dreams to non-public, the admin will need an RLS policy update.

### RLS Policy Addition (migration)
- Add admin UPDATE policy on `dream_entries` so the admin can set `is_public = false` on flagged dreams:
  ```sql
  CREATE POLICY "Admins can update any dream"
    ON public.dream_entries FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  ```
- Add admin DELETE policy on `dream_entries` so the admin can delete flagged content:
  ```sql
  CREATE POLICY "Admins can delete any dream"
    ON public.dream_entries FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  ```
- Add admin SELECT policy on `stripe_subscriptions` so the admin can see all active subscriptions:
  ```sql
  CREATE POLICY "Admins can view all subscriptions"
    ON public.stripe_subscriptions FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  ```

### Modal UI Design
```text
+------------------------------------------+
|  [X]  Flagged Content Review             |
+------------------------------------------+
|  [Dream Image - full width]              |
|                                          |
|  Dream Title                             |
|  by @username  -  Jan 15, 2026           |
|                                          |
|  Full dream text content displayed       |
|  here without truncation...              |
|                                          |
|  ---                                     |
|  Flag: Inappropriate Content             |
|  Reporter: @reporter_username            |
|  Notes: "This contains..."              |
|  Flagged: Feb 25, 2026                   |
|                                          |
+------------------------------------------+
|  [Hide Content]  [Delete]  [Keep]        |
+------------------------------------------+
```

### Files Changed
- `src/components/admin/ModerationQueue.tsx` -- Rewrite with dream preview + detail modal
- `src/hooks/useAdminStats.tsx` -- Add `activeSubscriptions` stat
- `src/components/admin/CommunityStats.tsx` -- Add subscription stat card
- `src/components/admin/UserManager.tsx` -- Show subscription badge per user
- New migration for admin RLS policies on `dream_entries` and `stripe_subscriptions`
