# Always-available onboarding route for admins

## Goal
Let admins re-open the onboarding flow on demand, without clearing storage or affecting normal users.

## Changes

### 1. New route `/onboarding` (`src/App.tsx`)
- Add a `<Route path="/onboarding" element={<OnboardingPreview />} />` inside the authenticated routes.
- `OnboardingPreview` is a tiny wrapper that:
  - Uses `useUserRole()` — if not `isAdmin`, `navigate("/")`.
  - Renders `<OnboardingFlow onComplete={() => navigate("/")} />` (does NOT call `completeOnboarding`, so it never alters the user's real onboarding state or terms acceptance side-effects beyond what the flow already does).
- Keep the existing `hasSeenOnboarding === false` gate untouched for normal first-run behavior.

### 2. Admin entry point (`src/pages/AdminDashboard.tsx`)
- Add a small "Preview onboarding" button in the header area (next to the back arrow) that navigates to `/onboarding`. Lucide `Eye` icon, ghost variant, consistent with existing admin buttons.

## Technical notes
- Reuses existing `OnboardingFlow` component as-is — no prop changes.
- `ThresholdScreen`'s "Enter" still calls `markTermsAsAccepted()`, which is idempotent and safe for an admin already past onboarding.
- No DB or migration changes.

## Files touched
- `src/App.tsx` — add route + small inline `OnboardingPreview` component (or a new file `src/pages/OnboardingPreview.tsx` if cleaner).
- `src/pages/AdminDashboard.tsx` — add preview button.
