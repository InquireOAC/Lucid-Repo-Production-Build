

## Plan: Fix Back Button & "Dream Not Found" Flash

### Problem 1: Back button navigates to previous dream instead of Lucid Repo
`DreamStoryPage` uses `navigate(-1)` (line 246). When opening dreams from a queue (Continue Reading or section list), each dream pushes a new history entry. Pressing back goes to the previous dream instead of the repo page.

### Problem 2: Brief "Dream not found" flash
When `dreamId` changes (e.g., navigating between dreams), React re-renders with the new `dreamId` but stale state (`loading: false`, `dream: null`). The `useEffect` hasn't fired yet, so the "not found" screen briefly appears before loading begins.

### Fix

**File: `src/pages/DreamStoryPage.tsx`**
- Back button: Replace `navigate(-1)` with smarter logic. If URL has a `?queue=` param (meaning user came from Lucid Repo), navigate to `/lucid-repo` (preserving any `?section=` from `document.referrer` or sessionStorage). Otherwise fall back to `navigate(-1)`.
- Store the originating URL (e.g., `/lucid-repo?section=trending`) in `sessionStorage` when the page loads from a repo context, so back always returns there.
- Flash fix: Track `dreamId` in a ref. If the current `dreamId` doesn't match what was last fetched, treat it as loading. This prevents the gap between re-render and effect execution.

**File: `src/components/repos/StoryListCard.tsx`**
- When navigating to a dream, also pass a `from` search param (e.g., `?from=lucid-repo`) so `DreamStoryPage` knows the origin without relying on browser history.
- Keep the existing `queue` param.

### Changes Summary

| File | Change |
|------|--------|
| `src/pages/DreamStoryPage.tsx` | Smart back navigation + fix loading race condition |
| `src/components/repos/StoryListCard.tsx` | Add `from` param to navigation URL |
| `src/components/repos/DiscoveryDreamCard.tsx` | Add `from` param for consistency |
| `src/components/repos/DiscoveryHero.tsx` | Add `from` param for consistency |

### Technical Detail

**Back button logic:**
```typescript
const searchParams = new URLSearchParams(window.location.search);
const from = searchParams.get("from");

const handleBack = () => {
  if (from) {
    navigate(from, { replace: true });
  } else {
    navigate(-1);
  }
};
```

**Flash fix:**
```typescript
const fetchedIdRef = useRef<string | null>(null);
// In render: if dreamId !== fetchedIdRef.current, show skeleton
// In effect: after fetch, set fetchedIdRef.current = dreamId
```

**StoryListCard navigation:**
```typescript
const handleClick = () => {
  const currentPath = window.location.pathname + window.location.search;
  navigate(`/dream/${dream.id}?from=${encodeURIComponent(currentPath)}`);
};
```

