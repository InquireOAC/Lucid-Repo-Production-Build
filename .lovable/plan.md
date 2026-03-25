

## Plan: Fix Category Page Navigation Issues

### Problem
Two related bugs when browsing a category ("See All") on Lucid Repo:

1. **"Dream not found" flash**: Tapping a dream briefly shows "Dream not found" before loading the actual dream. This happens because `DreamStoryPage` shows the error state before the fetch completes — it initializes with `dream: null` and `loading: true`, but the loading skeleton and error state race.

2. **Back button doesn't return to category**: The expanded category view is stored in React component state (`expandedSection`). When navigating to `/dream/{id}`, `LucidRepoContainer` unmounts, losing this state. Pressing back returns to `/lucid-repo` with no expanded section.

### Fix

#### 1. Fix "Dream not found" flash (`src/pages/DreamStoryPage.tsx`)
The issue is subtle: `loading` starts as `true`, but the `if (!dream)` check on line 131 can briefly render before the `if (loading)` check on line 119 catches it. Actually, looking again, the loading check comes first so it should show skeletons. The real cause is likely that when the component re-mounts (navigating from the same route structure), `loading` briefly flips to `false` before the `useEffect` fires. Fix by ensuring `loading` is reset to `true` when `dreamId` changes, and only show "not found" after fetch actually completes with no result.

- Add an explicit `notFound` state (default `false`) that's only set to `true` after the fetch returns no data
- Keep showing skeletons while loading, show "not found" only when `notFound === true`

#### 2. Persist category state via URL (`src/pages/LucidRepoContainer.tsx`)
Replace the `expandedSection` React state with URL search params so the category view survives navigation:

- Use `?category=Lucid` (or similar) search param instead of `expandedSection` state
- When "See All" is clicked, call `navigate('?category=Lucid')` instead of `setExpandedSection(...)`
- On mount, read the `category` param from the URL to determine if we're in expanded view
- The back button in expanded view calls `navigate('/lucid-repo')` to clear the param
- This way, when the user navigates to a dream and presses back, the browser restores the `?category=...` URL automatically

#### 3. Fix back button in StoryListCard (`src/components/repos/StoryListCard.tsx`)
No changes needed — the card already navigates to `/dream/{id}` which is correct. Browser back will now correctly restore the `?category=...` URL.

### Files Modified (3)
1. `src/pages/DreamStoryPage.tsx` — Add `notFound` state to prevent flash
2. `src/pages/LucidRepoContainer.tsx` — Replace `expandedSection` state with URL search params
3. `src/components/repos/StoryListCard.tsx` — No changes needed

