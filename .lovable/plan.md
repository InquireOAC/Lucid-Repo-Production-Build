

# Fix Dream Library Cards + Expandable Lucid Repo Sections

## 1. Dream Library Card Fix (`DreamGalleryDialog.tsx`)

**Problem**: Cards have a white/light inner glow and the gradient overlay uses `hsl(var(--foreground))` which resolves to a light color, making text unreadable.

**Fix**:
- Remove `shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.06)]` from card class
- Change gradient overlay from `from-[hsl(var(--foreground)/0.8)]` to `from-black/80 via-black/40 to-transparent`
- Change border from `border-border/60` to `border-white/10`
- Ensure text uses `text-white` and `text-white/75` instead of `text-primary-foreground`
- Video badge: use `bg-black/60 text-white` instead of `bg-card/70 text-foreground`

## 2. Expandable Sections on Lucid Repo (`LucidRepoContainer.tsx`)

**Approach**: Add an `expandedSection` state. When a user taps "See all" on a section (Trending, Following, New Releases, tag sections), set the expanded section. Render a full-page view with a back button and the dreams in a 2-column grid using `DiscoveryDreamCard`.

**Changes**:
- Add `expandedSection` state: `{ title: string, dreams: DreamEntry[] } | null`
- Pass `onSeeAll` prop to each `DiscoveryRow` — this already supports it (line 23 in DiscoveryRow)
- When expanded, render a simple view: back arrow + title header, then a 2-column grid of `DiscoveryDreamCard` components
- Wrap the grid cards to fill width (remove `flex-shrink-0 w-[140px]`) — use a wrapper div with grid styling rather than modifying the shared card component

**Files to edit**:
- `src/components/profile/DreamGalleryDialog.tsx` — card styling fixes
- `src/pages/LucidRepoContainer.tsx` — expandable section state + grid view

