## 1. Confirm: Lucid Stats uses no AI credits

Verified `useLucidStats` → `supabase.rpc("get_lucid_stats")` (pure SQL function), `AchievementsCard` reads `lucid_achievement_definitions`, and `useLucidAchievements` writes unlocked rows. **Zero AI/model calls, no credits consumed.** No changes needed to data fetching.

## 2. Unlock Lucid Stats (remove paywall)

In `src/pages/LucidStats.tsx`:
- Remove `useFeatureUsage` import and the `hasActiveSubscription` Premium gate block.
- Keep the signed-in / signed-out / loading / empty / error branches intact.

Result: all signed-in users see the full stats experience; data still loads via the existing Supabase RPC.

## 3. Redesign Auth page + Lucid Engine logo

`src/pages/Auth.tsx` already imports `@/assets/lucid-logo.png`. Polish only:

- Rename import alias to `lucidEngineLogo`, `alt="Lucid Engine"`.
- Larger centered logo with a soft radial glow halo behind it.
- Updated brand tagline (e.g. "Engineer your dreams. Master the lucid state.").
- Refined glass auth card: tighter spacing, subtle inner border, focus-glow on inputs (primary blue).
- Smoother Sign In / Sign Up segmented pill.
- Cleaner "Tonight in the Repo" 2-up strip with rounded thumbnails + dreamer name overlay.
- Confident gradient submit button with hover/tap micro-interactions.

All auth logic (sign in, sign up, terms, remember-me, recent dreams query) untouched.

## Files to edit

- `src/pages/LucidStats.tsx` — drop paywall gate only.
- `src/pages/Auth.tsx` — visual redesign + logo alias rename.

No DB, hook, or edge-function changes.
