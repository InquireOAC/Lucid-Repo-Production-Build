
Goal: eliminate the remaining Lucid Repo text/title flicker while scrolling (based on your screenshot, this is still happening in the **All** feed cards, not just masonry cards).

What I found
- The previous fix mostly targeted masonry/featured card surfaces.
- Your screenshot shows the **All feed** (`DiscoveryHero` + horizontal `DiscoveryRow` cards), which still uses:
  - `framer-motion` transform animations on container elements
  - layered absolute overlays/text without explicit layer isolation
  - hover-scale transforms on images that can trigger unstable compositing on iOS/touch browsers

Implementation plan
1) Add a dedicated mobile compositing-stability utility in `src/index.css`
- Introduce reusable classes for card scroll stability (translate3d, backface hidden, isolation, contain paint, font smoothing).
- Add a horizontal-scroll stability utility for discovery rows (`-webkit-overflow-scrolling: touch`, contain/isolation safeguards).

2) Apply stability classes + explicit z-index layering to All-feed cards
- `src/components/repos/DiscoveryHero.tsx`
  - Apply stable-card class to root card.
  - Ensure image is base layer, gradient overlay middle layer, text/stats top layer (`z-0 / z-10 / z-20`).
- `src/components/repos/DiscoveryDreamCard.tsx`
  - Same layering and stable-card class.
- `src/components/series/DiscoverySeriesCard.tsx`
  - Same layering and stable-card class.

3) Remove transform-heavy entry animation from scroll surfaces
- `src/components/repos/DiscoveryHero.tsx`
- `src/components/repos/DiscoveryRow.tsx`
- Replace `motion.*` wrappers with static containers (or non-transform CSS-only fade if needed), so scrolling does not run through animated transform stacks.

4) Disable hover transform effects on touch/coarse pointers
- Update image scale classes in discovery cards to only apply on non-touch/desktop breakpoints (so mobile scrolling doesn’t trigger accidental hover-state compositing changes).

5) Keep existing masonry fix, but align stability pattern
- Ensure `MasonryDreamGrid` remains on the same stable class pattern for consistency (no regression between All view and filtered view).

Technical details
- Files to update:
  - `src/index.css`
  - `src/components/repos/DiscoveryHero.tsx`
  - `src/components/repos/DiscoveryRow.tsx`
  - `src/components/repos/DiscoveryDreamCard.tsx`
  - `src/components/series/DiscoverySeriesCard.tsx`
  - (light consistency check) `src/components/repos/MasonryDreamGrid.tsx`
- Key CSS techniques:
  - `transform: translate3d(0,0,0)`
  - `-webkit-backface-visibility: hidden; backface-visibility: hidden`
  - `isolation: isolate`
  - `contain: paint`
  - explicit stacking (`z-index`) for image/overlay/text layers
  - touch-safe hover behavior (no scale transforms on mobile)

Validation checklist after implementation
- On mobile viewport (~440x782), in `/lucid-repo`:
  - Scroll vertically through featured + multiple discovery rows: titles/descriptions never disappear.
  - Horizontally swipe discovery rows quickly: no text flicker/blanking.
  - Switch category filters and return to All: still stable.
  - Confirm card taps/open behavior remains unchanged.
