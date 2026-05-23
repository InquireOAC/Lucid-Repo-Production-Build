## Fix Repo Page: Left Padding + Remove Emojis

### 1. Left padding / clipping fix

In `src/pages/LucidRepoContainer.tsx` and `src/components/repos/netflix/PosterRail.tsx`, horizontal rails currently use `-mx-4 sm:-mx-6` with inner `px-4 sm:px-6` to bleed edge-to-edge. On mobile (440px viewport) this is clipping the leading content (the "1" outline on Top 10, leftmost poster on Continue Reading / From Dreamers You Follow rows).

Changes:
- Remove the negative outer margins on `PosterRail` and the inline Dream Series section so rails respect the page's `px-4 sm:px-6` container padding.
- Keep horizontal scroll + `snap-x`, but drop the redundant inner `px-4 sm:px-6` (now handled by parent).
- Same treatment for the "Dream Series" section in `LucidRepoContainer.tsx`.
- Verify the sticky top bar (tabs/search/filter pills) still aligns; it already uses matching negative margins — keep those so the blurred bg spans full width, but the inner content stays inside the padded area (already the case).

### 2. Remove all emojis from Repo page

Strip every emoji on the repo surface and replace with either nothing or a Lucide icon (per project standard: no emojis, Lucide only).

Files & replacements:
- `src/pages/LucidRepoContainer.tsx` — section titles:
  - `"📖 From People You Follow"` → `"From People You Follow"`
  - `"🔥 Trending Stories"` → `"Trending Stories"`
  - `"✨ New Releases"` → `"New Releases"`
- `src/components/repos/netflix/CategoryHeroCard.tsx` — replace `🌙` placeholder with `<Moon />` Lucide icon.
- `src/components/repos/netflix/HeroPoster.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/netflix/PosterCard.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/netflix/TopTenCard.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/netflix/ContinueReadingCard.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/StoryListCard.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/DiscoveryHero.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/DiscoveryDreamCard.tsx` — `🌙` → `<Moon />`.
- `src/components/repos/FeaturedDream.tsx` — `"✦ Featured"` → `"Featured"`.
- `src/components/repos/MasonryDreamGrid.tsx` — `"✦ Lucid"` → `"Lucid"`.

### Out of scope
No data, routing, or behavior changes. Pure layout + emoji cleanup on the Repo page surface.
