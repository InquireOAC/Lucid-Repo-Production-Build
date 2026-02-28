

# Admin Dashboard Mega-Upgrade

## Overview
Transform the admin dashboard from a basic management tool into a comprehensive platform control center with community challenges/events, enhanced analytics, and richer moderation capabilities.

---

## New Features

### 1. Community Challenges & Events System (biggest addition)
A new "Events" tab in the admin dashboard where you can create time-bound challenges that users participate in by sharing dreams with a specific hashtag.

**How it works:**
- Admin creates a challenge with a title, description, required hashtag (e.g. `#Dreamer`), start/end dates, and optional prize description
- Users participate by sharing a dream to the public Lucid Repo page with the required tag
- Admin sees a live list of all entries (dreams matching the hashtag within the date window), entry count, and participant profiles
- Challenges can be marked active/ended/featured

**Database: new `community_challenges` table**
- `id`, `created_by` (admin uuid), `title`, `description`, `required_tag` (text), `start_date`, `end_date`, `prize_description` (nullable), `status` (active/ended/draft), `banner_image_url` (nullable), `created_at`
- RLS: admins can CRUD, all authenticated users can SELECT active challenges

**Database: new `challenge_entries` table**
- `id`, `challenge_id` (FK), `user_id`, `dream_id` (FK to dream_entries), `entered_at`
- Unique constraint on (challenge_id, dream_id) to prevent duplicates
- RLS: users can insert their own, admins can select all, users can see their own

**Admin UI components:**
- `ChallengeComposer` -- form to create a challenge (title, description, hashtag, dates, prize)
- `ChallengeManager` -- list of all challenges with entry counts, expand to see participants and their dreams

### 2. Enhanced Community Stats
Upgrade the existing stats grid with:
- New stat cards: Total Challenges, Active Challenge Entries, Total Comments, Weekly Active Users (users who logged a dream in the last 7 days)
- Sparkline trend indicator (up/down arrow + percentage vs. prior period) on key metrics
- Uses additional count queries in `useAdminStats`

### 3. Upgraded User Manager
- Add subscription plan name display (not just "Subscribed" badge)
- Add "View Profile" button that navigates to the user's profile page
- Show user join date formatted nicely
- Show dream count per user inline

### 4. Improved Tab Layout
Add a 5th tab "Events" for the challenge system. Reorder tabs:
`Stats | Announce | Events | Moderate | Users`

Move CommunityStats inside a dedicated "Stats" tab instead of always showing above tabs, keeping the top area cleaner.

---

## Technical Plan

### Database Migrations (2 new tables)

```text
community_challenges
+------------------+---------------------------+
| column           | type                      |
+------------------+---------------------------+
| id               | uuid PK                   |
| created_by       | uuid (not FK to auth)      |
| title            | text NOT NULL              |
| description      | text                       |
| required_tag     | text NOT NULL              |
| start_date       | timestamptz NOT NULL        |
| end_date         | timestamptz NOT NULL        |
| prize_description| text                       |
| status           | text DEFAULT 'draft'       |
| banner_image_url | text                       |
| created_at       | timestamptz DEFAULT now()  |
+------------------+---------------------------+

challenge_entries
+------------------+---------------------------+
| column           | type                      |
+------------------+---------------------------+
| id               | uuid PK                   |
| challenge_id     | uuid FK -> community_challenges |
| user_id          | uuid NOT NULL              |
| dream_id         | uuid FK -> dream_entries   |
| entered_at       | timestamptz DEFAULT now()  |
| UNIQUE           | (challenge_id, dream_id)   |
+------------------+---------------------------+
```

RLS policies will use the existing `has_role()` function for admin checks.

### New Files
- `src/components/admin/ChallengeComposer.tsx` -- create challenge form
- `src/components/admin/ChallengeManager.tsx` -- list challenges, view entries
- `src/hooks/useChallenges.tsx` -- fetch/create challenges and entries

### Modified Files
- `src/pages/AdminDashboard.tsx` -- add Events tab, reorganize layout
- `src/hooks/useAdminStats.tsx` -- add new stat queries (challenges count, comments count, weekly active)
- `src/components/admin/CommunityStats.tsx` -- render new stat cards
- `src/components/admin/UserManager.tsx` -- add dream count, view profile button, plan name

### No Edge Functions Required
All challenge logic uses direct Supabase client queries with RLS.

---

## Summary of Deliverables
1. Two new database tables with RLS
2. Challenge creation form for admins
3. Challenge entry viewer with participant list and dream previews
4. Enhanced stats dashboard with more metrics
5. Upgraded user manager with richer profile info
6. Reorganized tab layout

