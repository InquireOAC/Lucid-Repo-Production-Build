

## Plan: Onboarding Persistence Fix + Wattpad-Style Lucid Repo Redesign

### Part 1: Onboarding Persistence Hardening

**Current state**: The logic is correct (localStorage + Capacitor Preferences), but the skip button on non-final screens calls `handleStart` which tries `markTermsAsAccepted()` before `onComplete()`. If the user isn't logged in, this could throw and the catch does call `onComplete()`, so it should work. However, there's a subtle race: `AppContent` sits inside `AuthProvider`, and if the auth state reloads (e.g., token refresh), `AppContent` re-mounts, re-runs `useOnboarding`, and the `checkOnboardingStatus` runs again. If localStorage is somehow cleared (incognito, Safari ITP), onboarding reappears.

**Fix** (`src/App.tsx`):
- Move `useOnboarding` initialization higher and memoize the result to prevent re-checks on auth state changes
- Add a session-level guard: once `completeOnboarding` is called in a session, never show onboarding again regardless of storage reads

**Fix** (`src/hooks/useOnboarding.tsx`):
- Add a module-level `sessionCompleted` flag that persists across re-renders/re-mounts within the same browser session
- If `sessionCompleted` is true, skip all storage checks and return `hasSeenOnboarding: true` immediately
- Set `sessionCompleted = true` in `completeOnboarding` AND when storage check finds `true`

### Part 2: Wattpad-Style Lucid Repo Redesign

**Goal**: Transform the Lucid Repo from a discovery feed into a story-browsing experience optimized for continuous reading, inspired by Wattpad.

#### 2a. Redesign Discovery Layout (`src/pages/LucidRepoContainer.tsx`)

Replace the current horizontal-scroll discovery rows with a more immersive layout:

- **Top banner**: Keep featured hero but make it taller with a "Start Reading" CTA button
- **"Continue Reading" row** (new): If the user has viewed dreams before, show recently viewed dreams with a progress-style indicator (based on view history)
- **Trending Stories**: Vertical list cards (not horizontal scroll) showing cover image, title, author, excerpt, read count, like count -- similar to Wattpad's story list
- **Category chips**: Keep existing filter bar but restyle as rounded pills
- **For You / Recommended**: Personalized row based on tags from user's own dreams

#### 2b. New Story List Card (`src/components/repos/StoryListCard.tsx`)

A horizontal card layout (Wattpad-style) for the main feed:
- Left: Cover image thumbnail (aspect 2:3, ~80px wide)
- Right: Title (bold, 2-line clamp), author row with avatar, excerpt (2-line clamp), stats row (reads, likes, comments, scene count)
- Tap navigates to `/dream/{id}`
- More compact than current cards, allowing 5-6 visible per screen

#### 2c. Continuous Reading (`src/pages/DreamStoryPage.tsx`)

Add a "Keep Reading" section at the bottom of each dream story:
- After comments section, show a "Next Story" card with the next dream from the same category/tag, or a random trending dream
- Include a "Read Next" button that navigates to the next dream
- Show 2-3 suggested stories in a horizontal mini-row
- Pass navigation context (source list) so the reader can swipe through a queue

**Implementation**: Add a `useNextDreams` helper that fetches 3 related dreams (same tags or trending) excluding the current one. Render at bottom of `DreamStoryContent`.

#### 2d. Reading Queue State

Add lightweight reading queue to the dream store or a new context:
- When user enters a dream from a discovery row, store the row's dream IDs as the reading queue
- DreamStoryPage shows "Next" / "Previous" navigation arrows in the header
- Swiping left at end of story goes to next in queue

**Implementation**: Use URL search params or a simple zustand slice in `src/store/dreamStore.ts` to track `readingQueue: string[]` and `currentQueueIndex: number`.

### Files Modified (6)

1. `src/hooks/useOnboarding.tsx` -- Add session-level guard flag
2. `src/pages/LucidRepoContainer.tsx` -- Redesign to Wattpad-style vertical story list layout with Continue Reading
3. `src/components/repos/StoryListCard.tsx` -- New horizontal story card component
4. `src/pages/DreamStoryPage.tsx` -- Add "Keep Reading" section with next story suggestions
5. `src/store/dreamStore.ts` -- Add reading queue state
6. `src/hooks/useDiscoveryDreams.tsx` -- Add helper to fetch related/next dreams

### Technical Details

- StoryListCard uses flexbox row layout: `flex gap-3` with fixed-width image and flex-1 content
- Continuous reading fetches 3 dreams with matching tags via Supabase `.or()` filter, excluding current ID
- Reading queue stored in zustand alongside existing dream store, persisted only in memory (not localStorage)
- Session guard uses `let sessionCompleted = false` at module scope in useOnboarding.tsx

