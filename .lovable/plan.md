

## Plan: Fix Dream Card Glitching on Scroll

### Root Cause

The masonry dream cards in Lucid Repo use three CSS effects that cause GPU compositing issues on mobile during scroll:

1. **`vault-glass`** applies `backdrop-filter: blur(16px) saturate(120%)` — this is the primary culprit. Mobile browsers struggle to maintain backdrop-filter compositing during scroll, causing text/content to flicker or disappear.
2. **`vault-light-sweep::before`** adds an absolutely-positioned pseudo-element covering the entire card — competes with text rendering during repaints.
3. **`animate-fade-in`** class on masonry cards references a non-existent animation (config only has `animate-fade-in-up`), which may cause undefined initial state.

### Changes

**File: `src/index.css`**
- Add `will-change: transform` and `transform: translateZ(0)` to `.vault-glass` to force stable GPU layer compositing, preventing text from disappearing during scroll repaints.
- Add `-webkit-transform: translateZ(0)` for Safari compatibility.

**File: `src/components/repos/MasonryDreamGrid.tsx`**
- Replace `animate-fade-in` (non-existent) with `animate-fade-in-up` (the actual defined animation) on the masonry card wrapper.
- Add `will-change-transform` utility class to each card to ensure stable compositing during scroll.

**File: `src/components/repos/FeaturedDream.tsx`**
- Add `will-change-transform` to the featured card container.

**File: `src/components/repos/DiscoveryDreamCard.tsx`**
- Add `will-change-transform` to the discovery card image container to prevent image/text flicker during horizontal scroll.

These are minimal, targeted fixes — force GPU compositing layers on dream cards so the browser doesn't tear down and rebuild text rendering during scroll.

