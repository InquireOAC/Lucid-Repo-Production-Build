# Plan: FAL-only image gen + Netflix-style Lucid Repo

## Part 1 — Remove Vertex AI, route all image gen through FAL nano-banana-2

**Edge functions to convert from Vertex to FAL (`_shared/fal-nano-banana.ts`):**
- `generate-dream-image` — primary dream visualization + scene images. Keep current input shape (`prompt`, `referenceImageUrl`, `outfitImageUrl`, `accessoryImageUrl`, `imageStyle`) so no client changes are needed. Convert all reference images into FAL's `image_urls` array (face = identity, outfit, accessory). Preserve the cinematic directive as a prompt prefix. Force `aspect_ratio: "9:16"`.
- `analyze-character-image` — switch to Lovable AI Gateway (`google/gemini-3-flash-preview`) for vision/text analysis.
- `compose-cinematic-prompt`, `compose-animation-prompt`, `analyze-dream`, `analyze-dream-symbols`, `generate-dream-insight`, `split-dream-sections`, `dream-chat` — text/reasoning calls, move to Lovable AI Gateway.
- `generate-dream-video` — move its prompt compilation off Vertex; video gen stays routed through FAL Seedance via the already-built cinematic pipeline.

**Secrets cleanup:** stop reading `GOOGLE_VERTEX_SA_KEY` and `GOOGLE_CLOUD_PROJECT_ID` anywhere. `FAL_API_KEY` + `LOVABLE_API_KEY` cover everything. Leave the old secrets in the dashboard untouched.

**Frontend:** no contract changes for `generate-dream-image`, so hooks/components keep working untouched.

## Part 2 — Netflix-style Lucid Repo redesign

Rebuild `LucidRepoContainer` (discovery view only — dream detail routing untouched) to match the reference screenshots: dark cinematic surface, full-bleed hero, dense horizontal rails of poster cards. **All language is scoped to dreams** — no "shows", "movies", "seasons", or "episodes". Categories are dream types/themes.

**New layout, top to bottom:**
1. **Top bar** — "Lucid Repo" title, search icon, filter icon (collapses search/filters into a sheet on mobile; inline on desktop).
2. **Category chips row** — All / Lucid / Nightmare / Recurring / Adventure / Spiritual / Flying / Prophetic / Sleep Paralysis (sticky under header, horizontal scroll).
3. **Hero (Dream of the Day)** — full-bleed 3:4 poster of the day's top dream by engagement score, gradient overlay, dream title in bold display font, dreamer handle + dream type tag underneath, two CTAs: **Read Dream** (primary white) + **My List** (translucent). Deterministic per date.
4. **Today's Top Dreams** — horizontal rail of 2:3 poster cards with corner "TOP 10" numbered badge for top-ranked items and "New" / "Trending" ribbon badges.
5. **Continue Reading** — uses existing `useReadingHistory`. Cards show progress bar at the bottom, play-circle overlay, ⓘ info button + ⋯ menu underneath.
6. **Recommended for You** — uses follow graph + tag affinity from already-loaded dreams.
7. **Because you read {last opened dream title}** — dynamic row title from latest reading-history item; rail of dreams sharing tags with that dream.
8. **Dream type rows** — one rail per tag (Lucid, Nightmare, Adventure, Spiritual, Flying, Prophetic, Sleep Paralysis, Recurring), each titled e.g. "Adventure Dreams", "Lucid Dreams".
9. **Dream Series** — keep existing series rail near the bottom.

**New components (under `src/components/repos/netflix/`):**
- `HeroPoster.tsx` — full-bleed hero with gradient + dual CTA + badge.
- `PosterRail.tsx` — horizontal scroll rail with title + "See all", snap-x, hides scrollbar.
- `PosterCard.tsx` — 2:3 poster, optional TOP 10 / New / Trending badge, tap → open dream.
- `ContinueReadingCard.tsx` — 16:9 thumbnail, progress bar, play overlay, ⓘ + ⋯ row.
- `RailBadge.tsx` — small badge primitive for ribbons.

**Reused as-is:** `useDiscoveryDreams`, `useLucidRepoDreamActions`, `usePublicSeries`, `useReadingHistory`, `usePublicDreamTags`, the dream detail / story routing.

**My List:**
- New table `user_dream_list` (`user_id`, `dream_id`, `added_at`, unique on the pair) with RLS so users only see their own list.
- New `useDreamList` hook with add/remove + isInList.
- Hero "My List" toggles membership; renders a "My List" rail at the very top when populated.

**Search/filter:** preserve current search query + category chip behavior, but render them inside a slide-down sheet from the top bar.

## Technical details

- Strictly use semantic tokens; no raw colors. Add new tokens if needed: `--surface-poster`, `--badge-top10`, `--badge-new`. Background stays Cosmic Tech `#060B18`.
- Poster aspect `aspect-[2/3]`, hero `aspect-[3/4]` mobile / `aspect-[16/9]` md+, `object-cover` (posters look better cover-cropped; dream images already store 9:16 from FAL).
- Rails: `overflow-x-auto snap-x snap-mandatory scrollbar-hide`, gap-2 mobile / gap-3 desktop, cards `w-32 md:w-40` for top-10 rail, `w-44 md:w-56` for continue-reading.
- Top 10 numbering: compute from `like_count + comment_count + view_count` desc within last 7 days.
- Daily hero: deterministic by `hash(YYYY-MM-DD)` over top-N candidates so it changes once per day.
- Continue Reading progress = `min(scroll_position, 1)` from existing reading-history rows.

## Out of scope

- The cinematic FAL/Seedance/ElevenLabs pipeline already built remains unchanged.
- No changes to Journal, Stats, Profile, Home, or Admin tabs.
- No removal of `GOOGLE_VERTEX_SA_KEY` secret from the dashboard — just stop using it in code.
