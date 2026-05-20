## Goal
Stop the app from reloading into an error state and make the initial loading flow stable.

## Plan
1. **Remove the fatal asset import crash**
   - Update `src/pages/Home.tsx` to use the new technique image filenames/extensions that now exist in `src/assets/techniques/`.
   - Search the repo for any remaining stale `.jpeg` technique imports and align them with the regenerated `.jpg` assets.
   - Validate that the `/index` route can render without the Vite import-analysis overlay or blank screen.

2. **Stabilize the boot/loading flow**
   - Review the current boot path across `App.tsx`, onboarding, and auth initialization so the app shows a stable loader instead of bouncing between states.
   - Refine auth initialization in `AuthContext` so session restoration completes before dependent data fetches run, avoiding duplicate work around initial session restore.
   - Keep auth listener side effects non-blocking and make sure profile loading only runs when the authenticated user is known.

3. **Reduce repeated subscription refresh churn**
   - Tighten `useSubscription` / `SubscriptionContext` fetch guards so subscription requests do not repeatedly refire during idle app boot.
   - Check call sites that trigger subscription refreshes and ensure they only run on meaningful state changes.
   - Keep the existing functionality intact while removing the noisy repeated polling behavior seen in the console.

4. **Validate the fix end-to-end**
   - Confirm the preview loads cleanly on mobile viewport without the module import failure.
   - Confirm the Lucid loader resolves into the app instead of looping.
   - Confirm subscription/auth logs settle after boot instead of continuously repeating.

## Technical details
- **Confirmed immediate root cause:** `src/pages/Home.tsx` still imports deleted files like `@/assets/techniques/reality-checks.jpeg`, while the current assets are `.jpg`.
- **Likely secondary cause of “keeps reloading” feel:** auth/subscription boot is doing repeated fetch work during initialization, which should be gated after session restore.
- **Implementation scope:** only loading, boot, and related fetch stability; no unrelated UI or feature changes.