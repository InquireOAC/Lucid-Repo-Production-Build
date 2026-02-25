

# Restrict Announcement Banner to Non-Journal Pages

## Overview
The `AnnouncementBanner` currently renders on every page via `MainLayout`. We need to conditionally hide it on journal-related routes (`/`, `/journal`, `/journal/new`) so announcements, polls, and reminders only appear on Lucid Repo, Profile, Explore, and other community pages.

## Change

### `src/layouts/MainLayout.tsx`
- Use the existing `location.pathname` to determine if the current route is a journal page
- Define journal routes: `/`, `/journal`, `/journal/new`
- Only render the `<AnnouncementBanner />` block when the user is NOT on a journal route

The conditional logic:

```
const isJournalRoute = pathname === "/" || pathname === "/journal" || pathname.startsWith("/journal/");

// Only render banner when NOT on journal
{!isJournalRoute && (
  <div className="sticky top-0 z-30">
    <AnnouncementBanner />
  </div>
)}
```

This is a single-file, ~3 line change. No other files need modification.

