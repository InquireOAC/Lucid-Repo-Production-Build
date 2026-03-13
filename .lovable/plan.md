

# Desktop Polish — Full Page Restructuring

## Issues Identified

1. **Stats page "unable to load"**: The `useLucidStats` hook requires authentication (`enabled: !!user?.id`). When not logged in, query is disabled — `data` is `null`, `error` is `null`, `isLoading` is `false`. The page renders with `stats: null` passed to all cards, but there's no unauthenticated state handling. Additionally, the RPC function may be failing for logged-in users if the referenced tables (`dream_insights`, `lucid_achievement_definitions`, `lucid_user_achievements`) don't exist yet in the live DB. Fix: add an unauthenticated guard + handle `stats === null` gracefully instead of showing the error card.

2. **All pages still have mobile-only layouts on desktop** — narrow containers, no desktop-appropriate spacing, tiny cards, single-column stacking.

## Changes

### 1. `src/pages/LucidStats.tsx` — Fix "unable to load" + polish
- Add auth guard: if no user, show "Sign in to view your stats" message
- When `stats === null` and no error, show an empty/onboarding state ("Log your first dream to see stats") instead of the error card
- The existing 2-col grid is fine

### 2. `src/pages/LucidRepoContainer.tsx` — Desktop polish
- Add a page header with title visible on desktop (`md:block`)
- Widen the hero to `md:aspect-[21/9]` for cinematic feel on desktop
- Expanded section grid: `md:grid-cols-3 lg:grid-cols-4` instead of just `grid-cols-2`
- Search bar: constrain to `max-w-md` on desktop, align left
- Loading skeleton: show more cards on desktop

### 3. `src/components/repos/DiscoveryDreamCard.tsx` — Desktop sizing
- Remove fixed `w-[140px]` mobile width; use responsive: `w-[140px] md:w-full md:min-w-0`
- This lets cards fill grid cells properly on desktop (DiscoveryRow already has `md:grid`)

### 4. `src/components/repos/DiscoveryHero.tsx` — Wider desktop aspect
- Change aspect ratio: `aspect-[16/9] md:aspect-[21/9]`

### 5. `src/pages/Journal.tsx` — Desktop header polish
- Already has `max-w-6xl mx-auto` and responsive grid — good
- Add `md:px-8` padding already present — good

### 6. `src/pages/Explore.tsx` — Desktop layout
- Add `max-w-6xl mx-auto` container
- Wider padding on desktop `md:px-8`
- Content grid for videos/articles on desktop

### 7. `src/pages/NewDream.tsx` — Desktop centering
- Already has `max-w-2xl mx-auto` — good
- Remove fixed bottom save bar on desktop, make it inline instead: `md:static md:mt-6`
- Adjust sticky header to account for sidebar on desktop

### 8. `src/pages/Notifications.tsx` — Desktop polish
- Already has `max-w-2xl lg:max-w-4xl mx-auto` — good
- Minor: remove `pb-20` on desktop since no bottom bar: `pb-20 md:pb-8`

### 9. `src/pages/Insights.tsx` — Desktop layout
- Add `max-w-6xl mx-auto` container
- Wider padding `md:px-8`

### 10. `src/pages/DreamStoryPage.tsx` — Desktop reading
- Already has `lg:max-w-3xl` — check it's applied consistently

### 11. `src/layouts/MainLayout.tsx` — Fix bottom padding
- The main content area applies mobile bottom padding on desktop too. Fix: only apply padding-bottom on mobile (`md:pb-0` already attempted but the inline style overrides it). Remove the inline `paddingBottom` on `md+` screens.

### 12. `src/components/explore/VaultTabContent.tsx` — Desktop grid
- Videos and articles should use responsive grid on desktop

## Technical Detail
- All changes use Tailwind responsive prefixes (`md:`, `lg:`)
- Stats fix: add auth check + null-stats empty state before error check
- DiscoveryDreamCard width fix is the key to making Lucid Repo look proper on desktop — cards currently forced to 140px even inside grid cells
- MainLayout inline style override needs JS conditional or CSS class approach

