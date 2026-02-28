

# Explore Content Management + Activity/Notifications System

## Part 1: Fix Broken Video Thumbnails

**Problem**: Many YouTube video thumbnails use `hqdefault.jpg` URLs that may not exist for all videos, resulting in broken images.

**Fix**: Add an `onError` fallback to both `FeaturedVideoCard.tsx` and `VideoThumbnailCard.tsx` that swaps to `mqdefault.jpg` (which always exists) or shows a gradient placeholder. Also update any hardcoded thumbnail URLs in `vaultContent.ts` that point to non-existent videos.

**Files**: `src/components/explore/FeaturedVideoCard.tsx`, `src/components/explore/VideoThumbnailCard.tsx`

---

## Part 2: Admin "Explore Content" Tab -- Dynamic Vault Management

Instead of hardcoding videos/studies in `vaultContent.ts`, move the Explore page content to the database so you can manage it from the Admin Dashboard.

### Database Tables

**New table: `explore_videos`**
- `id` (uuid, PK)
- `title` (text)
- `thumbnail_url` (text, nullable)
- `youtube_url` (text, required)
- `youtube_id` (text) -- extracted from URL
- `duration` (text)
- `author` (text)
- `category` (text: 'lucid-dreaming' | 'meditation')
- `sort_order` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at`, `created_by`

RLS: Public SELECT where `is_active = true`. Admin full access.

**New table: `explore_articles`**
- `id` (uuid, PK)
- `title` (text)
- `journal` (text, nullable)
- `year` (integer, nullable)
- `authors` (text)
- `key_finding` (text)
- `url` (text) -- DOI or article link
- `category` (text: 'lucid-dreaming' | 'meditation')
- `sort_order` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at`, `created_by`

RLS: Public SELECT where `is_active = true`. Admin full access.

### Migration

Seed both tables with the existing hardcoded data from `vaultContent.ts` so nothing is lost.

### Admin Dashboard -- New "Content" Tab

**File**: `src/pages/AdminDashboard.tsx` -- Add a 6th tab: **Content** (icon: `BookOpen`)

**New file**: `src/components/admin/ExploreContentManager.tsx`
- Two sub-sections: **Videos** and **Articles/Studies**
- **Videos section**:
  - Form to add a YouTube URL + category. On submit, auto-extract the video ID, build the thumbnail URL, and insert into `explore_videos`
  - List of existing videos with delete button and active/inactive toggle
- **Articles section**:
  - Form with fields: title, journal, year, authors, key finding, URL, category
  - List of existing articles with delete button

### Explore Page Changes

**File**: `src/components/explore/VaultTabContent.tsx`
- Replace static imports from `vaultContent.ts` with Supabase queries to `explore_videos` and `explore_articles`
- Use `useQuery` from TanStack to fetch, with category filter
- Keep the same card components (`FeaturedVideoCard`, `VideoThumbnailCard`, `ResearchStudyCard`) but feed them DB data

**Files**: `FeaturedVideoCard.tsx`, `VideoThumbnailCard.tsx`, `ResearchStudyCard.tsx`
- Update type interfaces to match the DB schema (or adapt with a mapper)

---

## Part 3: Activity & Notifications System

The app already has a `/notifications` page, a `useNotifications` hook querying the `activities` table, and a `NotificationCard` component. The main gap is **discoverability** -- there's no way to reach the notifications page from the main UI.

### Add Notification Bell to Navigation

**File**: `src/layouts/MainLayout.tsx`
- Add a bell icon button in the top-right area of each page (or in the nav bar) that links to `/notifications`
- Show unread count badge using the existing `useNotifications` hook's `unreadCount`

**Approach**: Add a floating notification bell in the header area (visible across all pages within MainLayout) rather than a 5th nav tab, to keep the bottom bar clean.

**New file**: `src/components/notifications/NotificationBell.tsx`
- Small bell icon component with red dot/badge for unread count
- On tap, navigates to `/notifications`
- Uses `useNotifications` to get `unreadCount`

### Enhance Notification Types

The existing system already handles likes, comments, follows, and messages via the `activities` table and database triggers. We'll enhance the display:

**File**: `src/components/notifications/NotificationCard.tsx`
- Add a "share" notification type icon
- Improve the card styling to feel more polished with the app's dreamy aesthetic
- Add subtle framer-motion entrance animations

**File**: `src/hooks/useNotifications.tsx`
- The current "read" state is client-side only (resets on refresh). Add a `notification_reads` table or a `read_at` column approach to persist read state
- Alternatively, use `localStorage` for a lightweight solution that persists across page navigations within a session

### Persistent Read State (lightweight approach)

Rather than adding a new DB table, store read notification IDs in `localStorage`. This avoids schema changes while giving a good UX:
- On page load, compare notification IDs against localStorage set
- Mark as read in localStorage when user views them
- `unreadCount` reflects truly unseen notifications

---

## Summary of Changes

| Area | Files | Type |
|------|-------|------|
| Thumbnail fix | `FeaturedVideoCard.tsx`, `VideoThumbnailCard.tsx` | Edit |
| DB tables | `explore_videos`, `explore_articles` | Migration |
| Admin Content tab | `AdminDashboard.tsx`, new `ExploreContentManager.tsx` | Edit + New |
| Explore dynamic data | `VaultTabContent.tsx` | Edit |
| Notification bell | New `NotificationBell.tsx`, `MainLayout.tsx` | New + Edit |
| Notification UX | `NotificationCard.tsx`, `useNotifications.tsx` | Edit |

