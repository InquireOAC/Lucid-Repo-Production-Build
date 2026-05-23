## Goal

When a user taps a category chip (e.g. Lucid, Nightmare, Flying), replace the current "sort + flat list" view with a Netflix-mobile-style vertical feed of large hero cards, one per dream. Each card auto-previews media (video → transitioning scene images → single image fallback), shows title + description, and has **Play** + **My List** buttons. Tapping **My List** adds the dream to the existing "My List" rail on the main repo page.

## Reference behavior (from screenshot)

- Sticky category chip row at top (already exists — keep it)
- Below it: a vertical stack of full-width cards
- Each card:
  - Large media area (≈ 4:5 or 3:4 aspect)
  - Auto-playing muted preview if media is available
  - Title in heavy display type
  - 2–3 line description
  - **Play** (white pill, black text) + **My List** (dark pill with `+` / `✓`) side by side
- Cards separated by generous vertical spacing, dark background

## Media preview logic per card

Resolve in this order:

1. **Video present** → muted, looped, autoplay `<video>` (uses `dream.video_url` / generated cinematic)
2. **Multiple scene images** (`dream.section_images` / story sections with images, > 1) → CSS crossfade slideshow, ~3.5s per slide, infinite loop, Ken Burns subtle zoom
3. **Single image** → static `<img>`
4. **No media** → gradient placeholder with 🌙 (matches HeroPoster fallback)

Autoplay only when the card is at least 50% in the viewport (IntersectionObserver), to keep scroll smooth on mobile.

## My List integration

- `useDreamList` already exists and is rendered as a "My List" rail on the main repo page.
- The **My List** button on each category card calls `toggleList(dream.id)`. Icon swaps between `Plus` and `Check`.
- No DB changes — localStorage-backed, same as today.
- Confirm the existing "My List" rail on the discovery page picks up new additions immediately (it already does via the `myListIds` state in `LucidRepoContainer`).

## UI scope

**New component:** `src/components/repos/netflix/CategoryHeroCard.tsx`
- Props: `dream`, `inList`, `onToggleList`
- Handles media resolution + IntersectionObserver autoplay
- Renders Play (→ navigates to `/lucid-repo/:id`) and My List buttons

**New hook (small):** `src/hooks/useInViewAutoplay.ts` — generic IO wrapper returning `ref` + `isInView`.

**Edit:** `src/pages/LucidRepoContainer.tsx`
- Replace the `activeFilter !== "All"` branch (currently sort toggle + `StoryListCard` list) with:
  - Keep the Popular / New sort toggle
  - Render `categoryDreams.map(d => <CategoryHeroCard ... />)` in a vertical stack
- No changes to the "All" view, hero, rails, or expanded-section view.

**No changes to:**
- Data fetching (`useDiscoveryDreams`, `usePublicDreamTags`)
- Routing
- DreamStoryPage / detail view
- Backend / Edge Functions
- Database schema

## Technical notes

- Scene-image source: read from existing dream story sections; if the dream object doesn't already include them on the discovery list, fall back to the single `generatedImage` / `image_url`. We will **not** add new queries — slideshow only activates if multi-image data is already present on the dream entry. (This keeps perf intact; richer slideshows naturally appear after the detail page hydrates them in cache.)
- Use semantic tokens (`bg-background`, `text-foreground`, `bg-muted`) — no raw colors.
- Match existing typography: bold display title, muted body.
- Buttons reuse the same pill styling as `HeroPoster` for consistency.
- Use `loading="lazy"` on images, `preload="none"` + `playsInline muted` on videos.

## Out of scope

- Generating new scene images for dreams that don't have them
- Persisting My List to Supabase
- Changing the "All" discovery layout
- Any Edge Function or AI pipeline changes
