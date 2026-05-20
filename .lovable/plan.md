## Goal
Swap the current dream-themed "Loading profile..." spinner for Lucid Engine's signature `LucidLoader` — a breathing logo with a diagonal light-wipe shimmer and a soft primary glow ring — so the Lucid Repo boot/load states feel native to the same ecosystem.

## What to bring over from Lucid Engine

1. **Logo asset** (`src/assets/lucid-logo.png`) — copied via `cross_project--copy_project_asset` into Lucid Repo at the same path.
2. **`LucidLoader` component** (`src/components/ui/lucid-loader.tsx`) — copied verbatim. Props: `size` (sm/md/lg/xl), `label`, `fullscreen`, `className`. Uses the logo as a mask for the shimmer sweep.
3. **Tailwind keyframes + animations** added to `tailwind.config.ts`:
   - `logo-breathe` (opacity + scale, 2.4s)
   - `logo-shimmer` (background-position sweep, 2.6s)
   - `logo-glow` (opacity + scale on blurred ring, 2.4s)

## Swaps inside Lucid Repo

1. **`src/components/profile/LoadingScreen.tsx`** — replace the Moon icon + "Loading profile..." with:
   ```tsx
   <div className="min-h-screen bg-background flex items-center justify-center safe-area-inset-top">
     <LucidLoader size="lg" label="Loading" />
   </div>
   ```
   Drop the `dream-background` / `text-dream-purple` references.

2. **`src/App.tsx` Suspense fallback** — the route-level `<Suspense fallback={<LoadingScreen />}>` automatically inherits the new look (no extra change needed beyond the LoadingScreen rewrite).

3. **`ProfileLoadingScreen.tsx`** — already a thin wrapper around `LoadingScreen`; no change.

4. **`ProfileStateGuard.tsx`** — still calls `ProfileLoadingScreen`; no change.

## Optional polish (kept in scope)
- Use `label="Loading"` only on the boot/profile screens; the inline button spinners (`Loader2`) across dialogs stay as-is — those are micro-interactions, not full-screen loaders, so swapping them would add visual noise.

## Files touched
- add: `src/assets/lucid-logo.png`
- add: `src/components/ui/lucid-loader.tsx`
- edit: `tailwind.config.ts` (3 keyframes + 3 animations)
- edit: `src/components/profile/LoadingScreen.tsx`

## Out of scope
- Replacing every per-button `Loader2` spinner.
- Onboarding cinematic sequence (has its own bespoke animation).
