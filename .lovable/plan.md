

## Plan: Add Announcement Section Under Greeting

**What**: Place the existing `AnnouncementBanner` component directly below the greeting text with 10px of spacing, so app-wide announcements appear right under "Welcome back, [Name]" before the CTA cards.

**Change** in `src/pages/Home.tsx`:
1. Import `AnnouncementBanner` from `@/components/announcements/AnnouncementBanner`
2. Insert `<div className="mt-[10px]"><AnnouncementBanner /></div>` after the username `<p>` tag (line 77) and before the Record a Dream card (line 80)

**1 file modified**: `src/pages/Home.tsx`

