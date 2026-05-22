## Goal

Restyle the Lucid Repo page to match the Crunchyroll-style reference: pure black background, white text everywhere, and larger poster-style cards in horizontal scrolling rows for readability. UI only — no data, routing, or behavior changes.

## Scope

Files touched:
- `src/pages/LucidRepoContainer.tsx`
- `src/components/repos/DiscoveryHero.tsx`
- `src/components/repos/DiscoveryRow.tsx`
- `src/components/repos/DiscoveryDreamCard.tsx`
- `src/components/repos/StoryListCard.tsx` (continue-watching style horizontal card)

No changes to hooks, data fetching, navigation, or other pages.

## Changes

### 1. Page shell (`LucidRepoContainer.tsx`)
- Wrap the discovery view in a full-bleed `bg-black text-white` container that ignores the app's tinted background.
- Remove the rounded `bg-muted` search input look — use a flat dark `bg-white/5` pill with white placeholder.
- Filter chips: inactive chips become `bg-white/10 text-white/70`, active chip becomes solid white pill with black text (Crunchyroll-style accent — kept neutral so it still works in the dark theme).
- Convert the "Trending Stories" and "New Releases" sections from vertical `StoryListCard` lists into horizontal poster rows using `DiscoveryRow` + `DiscoveryDreamCard` (matches the reference's "Trending in the United States" row).
- Keep "Continue Reading" as a horizontal row but render `StoryListCard` in a wide 16:9 landscape variant (matches the reference's "Continue Watching" cards).
- Section titles: bigger, bolder, plain white (no emoji prefix). E.g. `text-xl font-extrabold tracking-tight text-white`. Keep the existing emojis but allow them to render alongside the white title.
- Expanded section view also flips to `bg-black text-white`.

### 2. Hero (`DiscoveryHero.tsx`)
- Slightly taller hero on mobile (`aspect-[16/10]`) for better presence.
- Title bumps to `text-2xl md:text-4xl`, all text forced white.
- "Featured" pill becomes solid white on black text to mirror the reference's bold accent.

### 3. Row (`DiscoveryRow.tsx`)
- Title: `text-xl md:text-2xl font-extrabold text-white` (was `text-base`).
- More breathing room between rows (`mb-8`).
- Horizontal scroll gap increased to `gap-4`.
- "See all" link becomes white/70 instead of primary.

### 4. Poster card (`DiscoveryDreamCard.tsx`)
- Bigger card width: `w-[160px] sm:w-[180px] md:w-[200px]` (was 140px).
- Move title and author **below** the cover (like the reference) instead of overlaid on the image. Cover stays clean except for LUCID and audio badges.
- Title: `text-sm font-semibold text-white line-clamp-2` under the poster.
- Author row: small white/60 text with `Dub | Sub`-style meta replaced by likes + views (compact, white/50).
- Hover: subtle scale on the cover only.

### 5. Continue-watching card (`StoryListCard.tsx`)
- Add a `variant="wide"` mode (used by Continue Reading row): 16:9 landscape thumbnail with play icon overlay, title and "scene X of Y" underneath. Existing list variant kept for the expanded section view.

## Visual reference summary

```text
[ Black bg, white text ]
[ Hero — large image, white title, white pill ]
[ Trending Stories — horizontal posters, title under cover ]
[ Continue Reading — horizontal 16:9 cards with play icon ]
[ New Releases — horizontal posters ]
[ Tag rows — horizontal posters ]
```

## Out of scope

- No changes to the dream detail page, navigation, or any other tab.
- No changes to data, likes, or routing logic.
- Global app theme is untouched — only the Lucid Repo page surface is forced to black/white.
