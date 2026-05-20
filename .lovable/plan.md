# Plan: Profile Bug Fix + Premium Techniques + Performance Pass

## 1. Profile Page Banner & Redirect Bug

**Symptoms:** Banner doesn't load fully and the page redirects to Home.

**Root causes identified:**
- `ProfileContent.tsx` (line 130–141) runs a background `fetchUserProfile` on every `location.pathname` change. When `effectiveIdentifier` is undefined (route `/profile` without param), it falls back to `user.id`, but the upstream `useProfileData` may treat it as "other user" — combined with the `useEffect` at line 111 that calls `navigate("/auth")` whenever `user` is briefly null during auth re-hydration, it bounces to Home/Auth.
- `ProfileBanner` references `bg-gradient-to-r from-aurora-purple/40 via-aurora-violet/30 to-aurora-blue/40` — those purple tokens were dropped in the Lucid Studios re-brand, so the fallback renders empty/broken.
- Banner image URL uses `?t=${Date.now()}` cache-bust on every update, but the `<img>` has no `onError`/skeleton, so a slow load looks like "broken".

**Fixes:**
- Add a `useAuthReady` gate (per the Supabase stack-overflow pattern) so `ProfileContent` doesn't redirect during the brief `INITIAL_SESSION` window.
- Drop the redundant background-refresh `useEffect` (line 130) or debounce it; rely on the explicit fetch in the identifier effect.
- Replace `aurora-purple/violet/blue` gradient in `ProfileBanner` with the Lucid Studios blue gradient (`from-primary/30 via-primary/15 to-background`).
- Add skeleton + `onError` fallback to the banner `<img>`.

## 2. Premium Techniques Redesign

Rebuild `TechniqueDetailPage` and `TechniqueLibrary`/`TechniqueCard` with the Lucid Studios visual language: glass surfaces, ink typography, JetBrains Mono accents, Framer Motion choreography.

**TechniqueLibrary (grid):**
- Card grid with `.bg-glass` surface, `border-glass`, hover lift via Framer `whileHover={{ y: -4 }}`.
- Each card: hero image (existing `TECHNIQUE_IMAGES`), title in Basis 500, mono difficulty/effectiveness chip, one-line shortDescription.
- Staggered entry (`staggerChildren: 0.05`).

**TechniqueDetailPage:**
- Parallax hero image with overlay gradient → primary tint.
- Sticky translucent top bar (back + pin) appearing on scroll.
- Title block with mono acronym tag, `Difficulty / Effectiveness` rendered as horizontal progress bars (not dots) with animated fill.
- Long description rendered as editorial prose (max-w-prose, Basis Grotesque).
- **Step-by-step guide redesigned as a vertical timeline**: numbered milestone circles connected by a primary-tinted line; each step has a title (first sentence) + body, with `whileInView` fade-up.
- New "What to expect" callout card per technique (derived from existing copy; no new data required — split off longDescription paragraphs).
- New `<TechniquePrerequisites />` band (chips like "Best after WBTB", "Pairs with MILD") — derived from copy where present; otherwise omitted gracefully.
- Bottom CTA: "Pin this technique" + "Log a practice session" (links into existing practice log hook).
- All transitions via `framer-motion` (already in deps).

**Data layer:** No schema change. Optional: add `prerequisites?: string[]` and `expectations?: string` as optional fields in `Technique` interface and backfill the 3–4 most popular techniques; others render fine without.

## 3. Performance Optimization

**Concrete wins, ordered by impact:**

1. **Route-level code splitting** in `src/App.tsx` — convert page imports to `React.lazy` + `<Suspense>` (Home, LucidRepo, LucidStats, Profile, Learn, Insights, DreamBook, Chat, AdminDashboard). Currently all pages ship in the initial bundle.
2. **Defer heavy libs**: dynamic-import `html2canvas`, `jspdf`, `three`/`@react-three/*` only when share/export/3D-book is invoked.
3. **Image pipeline**: add `vite-imagetools`, convert `src/assets/techniques/*.jpeg` and large in-repo images to AVIF+WebP variants, add `loading="lazy"` + explicit `width/height` to prevent CLS.
4. **Query caching**: audit `useProfileDreams`, `useFeedPublicDreams`, `useDreamSeries` — wrap in TanStack Query with `staleTime: 60_000` so navigating back to a tab is instant.
5. **MediaCache flood**: console shows the same dream image cached 3× in a row. De-duplicate cache writes in `src/utils/localMediaCache.ts` with an in-flight Map.
6. **Fix the broken series query** surfaced in logs: `Error fetching public series: Could not find a relationship between 'dream_series' and 'user_id'` — update the `select` in `useDreamSeries` to use the correct FK name (`dream_series_user_id_fkey` or join via `profiles!inner`).
7. **List virtualization** on long feeds (`DreamsList`, `LucidRepoDreamList`) using `@tanstack/react-virtual` (already commonly installed; add if missing) — only when item count > 30.
8. **Auth flicker**: implement the `useAuthReady` pattern globally so protected pages stop double-fetching during hydration.

## Technical Section

**Files touched:**
- `src/components/profile/ProfileContent.tsx` — auth-ready gate, remove redundant refresh effect.
- `src/components/profile/ProfileBanner.tsx` — token swap, skeleton, error fallback.
- `src/hooks/useAuthReady.ts` (new).
- `src/components/insights/TechniqueDetailPage.tsx` — full rewrite with Framer Motion timeline, parallax hero, sticky nav.
- `src/components/insights/TechniqueLibrary.tsx` + `TechniqueCard.tsx` — glass cards, staggered entry.
- `src/components/insights/techniqueData.ts` — optional `prerequisites`/`expectations` fields.
- `src/App.tsx` — `React.lazy` + Suspense fallback (use existing `LoadingScreen`).
- `src/utils/localMediaCache.ts` — in-flight dedupe.
- `src/hooks/useDreamSeries.tsx` — fix FK selector.
- `vite.config.ts` — add `vite-imagetools`.
- `src/components/share/*`, `src/utils/exportDreamBookPdf.ts`, `src/components/dream-book/DreamBook3DViewer.tsx` — dynamic imports for heavy libs.

**Out of scope:** Gemma offline model integration (separate track), backend/DB schema changes beyond the series FK fix, redesign of pages other than Techniques.

## Rollout Order

1. Profile bug fix (15 min, unblocks the user).
2. Route code-splitting + media cache dedupe + series FK fix (quick perf wins).
3. Techniques redesign (largest visual change).
4. Image pipeline + dynamic imports for heavy libs.
5. List virtualization + query cache tuning.
