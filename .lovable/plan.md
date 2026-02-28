

# Admin Dashboard Sleek Redesign

## Overview
A visual and UX overhaul of the admin dashboard focused on mobile-first sizing, cleaner information hierarchy, and alignment with the existing sci-fi/vault-glass design system. No new database tables or backend changes -- this is purely a frontend enhancement.

---

## Current Issues
- Tab labels are cramped at 5 across on mobile (especially small phones)
- Stat cards are dense with small text and uniform styling -- no visual hierarchy for important metrics
- Composer forms (Announcements, Polls, Challenges) are verbose and take too much vertical space
- Header is plain and lacks the app's signature visual flair
- No quick-glance summary when first landing on the dashboard
- User Manager action buttons overflow on narrow screens

---

## Redesign Plan

### 1. Scrollable Tab Bar
Replace the fixed-width `TabsList` with a horizontally scrollable strip. Each tab gets an icon + label instead of just text, improving tap targets and scannability on mobile.

```text
[Stats] [Announce] [Events] [Moderate] [Users]
  ^--- scrollable, each ~80px with icon above label
```

**File:** `src/pages/AdminDashboard.tsx`
- Wrap TabsList in a horizontal scroll container with `overflow-x-auto` and `scrollbar-hide`
- Add icons to each TabsTrigger (BarChart3, Megaphone, Trophy, Shield, Users)
- Use a vertical icon+label layout inside each trigger for better mobile UX

### 2. Enhanced Header with Gradient Accent
Replace the plain header bar with a styled header that includes a subtle gradient line and the admin's greeting.

**File:** `src/pages/AdminDashboard.tsx`
- Add a thin gradient accent bar (primary-to-secondary) below the header
- Keep the back button and title, add a subtle "Command Center" subtitle

### 3. Hero Stats Row (Top 4 Key Metrics)
Pull 4 hero metrics (Total Users, Weekly Active, Public Dreams, Pending Flags) into a prominent horizontal scroll row at the top of the Stats tab with larger numbers and gradient icon backgrounds.

**File:** `src/components/admin/CommunityStats.tsx`
- Split stats into "hero" (top 4, larger cards) and "secondary" (remaining 6, compact grid)
- Hero cards: taller, centered number with gradient icon circle, `vault-glass` style
- Secondary cards: compact 2-column grid as before but with tighter padding

### 4. Collapsible Composer Forms
Wrap the AnnouncementComposer, PollComposer, and ChallengeComposer in collapsible sections so they don't dominate the screen by default.

**File:** `src/pages/AdminDashboard.tsx`
- Use Radix `Collapsible` component around each composer
- Show a compact trigger button ("+ New Announcement", "+ New Poll", "+ New Challenge")
- Composer expands when tapped, collapses after successful submission

### 5. User Manager Mobile Layout Fix
Stack the action buttons vertically on mobile and improve the card layout.

**File:** `src/components/admin/UserManager.tsx`
- Move action buttons (View, Mod, Admin) below the user info on mobile using `flex-wrap`
- Add avatar display (use `SymbolAvatar` or initials fallback)
- Make the search input full-width with the search button integrated inside

### 6. Moderation Queue Badge Count in Tab
Show the pending flag count as a notification badge on the "Moderate" tab trigger so admins see at a glance if action is needed.

**File:** `src/pages/AdminDashboard.tsx`
- Pass `flaggedContent` count from `useAdminStats` to the tab trigger
- Render a small red dot/number badge on the Moderate tab when count > 0

### 7. Challenge Manager Entry Count Visual
Add a small progress-style indicator to challenge cards showing entry count vs. a visual bar.

**File:** `src/components/admin/ChallengeManager.tsx`
- Add a thin `Progress` bar under the challenge title showing relative engagement
- Slightly increase padding and font sizes for mobile readability

---

## Technical Details

### Files Modified
| File | Changes |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Scrollable tabs with icons, gradient header, collapsible composers, moderation badge |
| `src/components/admin/CommunityStats.tsx` | Hero stats row + compact secondary grid |
| `src/components/admin/UserManager.tsx` | Mobile-friendly stacked layout, avatar, integrated search |
| `src/components/admin/ChallengeManager.tsx` | Better spacing, progress indicator |
| `src/index.css` | Add `scrollbar-hide` utility if not present, admin-specific gradient classes |

### No New Files
All changes are modifications to existing components.

### No Backend/DB Changes
This is a purely visual/UX redesign.

### Design Tokens Used
- `vault-glass` for card backgrounds
- `primary` gradient for accent elements
- Existing `Badge`, `Progress`, `Collapsible` components from the UI library
- Consistent `text-xs` / `text-sm` sizing with increased tap targets (min 44px)

