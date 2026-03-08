

## Fix: Scroll-to-top not working on all pages

### Problem
The scroll-to-top on navigation works for the Journal page but not consistently for Lucid Repo, Profile, and Dream Connections pages. The current fix only resets the scroll on the main container div, but the `window` scroll and the document element may also need resetting.

### Solution
Update the existing `useEffect` in `MainLayout.tsx` to also call `window.scrollTo(0, 0)` as a fallback. This covers cases where the browser's native scroll position (on `window` or `document.documentElement`) persists across navigations, which can happen with `min-h-screen` content that extends the document.

### Changes

**`src/layouts/MainLayout.tsx`** - Enhance the scroll reset effect:
- Keep the existing `scrollRef.current.scrollTo(0, 0)` 
- Add `window.scrollTo(0, 0)` as an additional reset
- Add `document.documentElement.scrollTop = 0` for full coverage

This ensures all scroll contexts are reset regardless of which element is actually scrolling.

