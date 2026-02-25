

# Admin Dashboard & Platform Announcement System

## Overview
Build a full admin dashboard accessible from the admin's profile, along with an in-app banner notification system for pushing announcements, polls, reminders, and more to all users platform-wide. Banners appear at the top of the screen and dismiss on click or via an X button.

## What You'll Get

### 1. Admin Dashboard (new page: `/admin`)
A dedicated admin page with a slide-in or full-page layout, accessible via a new "Admin Dashboard" button on your profile (visible only to admin-role users). The dashboard includes:

- **Announcements** -- Compose and push text announcements with optional links, schedule them, set priority/type (info, warning, celebration)
- **Polls** -- Create simple polls (question + options) that appear as banners or in-feed; view aggregated results
- **Reminders** -- Push motivational reminders or practice nudges (e.g., "Have you logged your dream today?")
- **Community Stats** -- Total users, active users (last 7 days), total dreams logged, public dreams, new signups
- **Content Moderation Queue** -- View flagged content reports, take action (dismiss, warn, remove)
- **Featured Content** -- Pin/feature specific public dreams to the Lucid Repo or Explore page
- **User Management** -- Search users, view profiles, assign moderator roles

### 2. In-App Banner Notification System
A persistent banner component rendered at the top of the app (inside MainLayout) that:
- Fetches active announcements on app load and via real-time subscription
- Displays them as a colored banner (info = blue/purple, warning = amber, celebration = gold with sparkle)
- Dismisses when the user clicks anywhere on the banner or the X button
- Tracks which users have dismissed which announcements (so they don't reappear)
- Supports stacking (if multiple active, shows the highest priority one; next appears after dismissal)

## Database Changes (3 new tables)

### `platform_announcements`
Stores all announcements, polls, and reminders pushed by admins.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| created_by | uuid | Admin user ID |
| type | text | 'announcement', 'poll', 'reminder', 'celebration' |
| title | text | Short headline |
| content | text | Body text |
| link_url | text | Optional CTA link |
| priority | text | 'low', 'normal', 'high' |
| is_active | boolean | Default true |
| starts_at | timestamptz | When to start showing |
| expires_at | timestamptz | When to stop showing (nullable = no expiry) |
| created_at | timestamptz | Default now() |
| metadata | jsonb | Poll options, extra config |

RLS: Admins can INSERT/UPDATE/DELETE. All authenticated users can SELECT active announcements.

### `announcement_dismissals`
Tracks which users dismissed which announcements.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | Who dismissed |
| announcement_id | uuid | FK to platform_announcements |
| dismissed_at | timestamptz | Default now() |
| unique(user_id, announcement_id) | | Prevent duplicates |

RLS: Users can INSERT and SELECT their own dismissals only.

### `poll_responses`
Tracks user votes on polls.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | Voter |
| announcement_id | uuid | FK to platform_announcements (poll type) |
| selected_option | text | The chosen option |
| created_at | timestamptz | Default now() |
| unique(user_id, announcement_id) | | One vote per poll |

RLS: Users can INSERT their own vote (one per poll) and SELECT their own. Admins can SELECT all for aggregation.

## Frontend Changes

### New Files
- **`src/pages/AdminDashboard.tsx`** -- Main admin page with tab sections for Announcements, Polls, Community Stats, Moderation, Featured Content, Users
- **`src/components/admin/AnnouncementComposer.tsx`** -- Form to create/edit announcements with type selector, priority, scheduling, and content fields
- **`src/components/admin/PollComposer.tsx`** -- Form to create polls with question + up to 6 options; shows live results
- **`src/components/admin/CommunityStats.tsx`** -- Dashboard cards showing user count, dream count, active users, new signups chart
- **`src/components/admin/ModerationQueue.tsx`** -- Lists flagged content from `content_flags` table with action buttons
- **`src/components/admin/FeaturedContentManager.tsx`** -- Search and pin public dreams
- **`src/components/admin/UserManager.tsx`** -- Search users, view stats, assign moderator role
- **`src/components/admin/AnnouncementsList.tsx`** -- List of past/active announcements with toggle and delete
- **`src/components/announcements/AnnouncementBanner.tsx`** -- The dismissable banner component shown at the top of the screen
- **`src/hooks/useAnnouncements.tsx`** -- Hook to fetch active announcements, handle dismissals, and manage real-time updates
- **`src/hooks/useAdminStats.tsx`** -- Hook to fetch community statistics for the dashboard

### Modified Files
- **`src/App.tsx`** -- Add `/admin` route (guarded by admin role check)
- **`src/layouts/MainLayout.tsx`** -- Render `<AnnouncementBanner />` between the safe-area overlay and the main content area
- **`src/components/profile/ProfileHeaderActions.tsx`** -- Add admin dashboard button (shield icon) visible only when `useUserRole().isAdmin` is true
- **`src/components/profile/SettingsDialog.tsx`** -- Add "Admin Dashboard" button in settings (admin-only)

### Banner UI Design
```text
+----------------------------------------------------------+
| [icon] Announcement title: Short message here...    [X]  |
+----------------------------------------------------------+
```
- Slides down from top with framer-motion animation
- Background color varies by type (gradient purple for announcements, amber for reminders, gold sparkle for celebrations)
- Tapping the banner opens the link (if provided) or just dismisses it
- X button in top-right corner for explicit dismissal
- Positioned below the safe-area overlay, above page content

### Admin Dashboard Layout
Full-screen slide-in (matching Settings pattern) with tabs:
- **Overview** -- Community stats cards + recent activity
- **Announcements** -- Create new + list of all with status toggles
- **Polls** -- Create polls + view results with bar charts
- **Moderation** -- Flagged content queue
- **Users** -- User search + role management

## Technical Details

### Real-time Updates
Use Supabase real-time subscription on `platform_announcements` table so new announcements appear instantly for all connected users without requiring a page refresh.

### Admin Role Check
All admin-only UI uses the existing `useUserRole()` hook. The admin dashboard route will redirect non-admins to the home page. RLS policies on the database ensure server-side security using the existing `has_role()` function.

### Poll Aggregation
Poll results will be fetched via a Supabase query that counts responses grouped by `selected_option`, displayed as horizontal bar charts in the admin dashboard.

### Announcement Priority & Stacking
When multiple announcements are active, they are sorted by priority (high > normal > low) then by `created_at` (newest first). Only one banner shows at a time. After dismissal, the next highest-priority undismissed announcement appears.

