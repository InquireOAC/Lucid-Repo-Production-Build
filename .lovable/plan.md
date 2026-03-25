

## Plan: Remove Redundant Terms Gate from Auth Page

### Problem
The Auth page (line 182) blocks signed-in users with a "Terms of Use" screen when `hasAcceptedTerms === false`. This fires every login because:

1. During onboarding, `markTermsAsAccepted()` is called but the user isn't logged in yet — so the DB write fails (no `user.id`) and the localStorage key is user-specific (`terms_accepted_v1.0_{userId}`), meaning nothing persists
2. On sign-in, `useTermsAcceptance` queries the DB, finds no record, and returns `false`
3. The terms gate renders, blocking the user

### Root Cause
Terms acceptance happens in two places redundantly: onboarding (before auth) and Auth page (after auth). The onboarding flow already has a mandatory Terms & Privacy screen (screen 7). The Auth page's terms gate is a leftover that no longer serves a purpose.

### Fix

**File: `src/pages/Auth.tsx`**
- Remove the `useTermsAcceptance` hook import and usage
- Remove the `handleAcceptTerms` function
- Remove the terms blocking screen (lines 182-208)
- Remove the `termsLoading` loading gate
- Change the `useEffect` to simply navigate home when user is present (no terms check)
- Keep the sign-up flow's `hasAcceptedTermsLocal` checkbox (that's a local UI requirement, not the DB check)
- After successful sign-up, still call `markTermsAsAccepted()` to persist to DB for any future reference

This means: onboarding handles terms for new installs, sign-up requires the checkbox, and sign-in just works without a blocking screen.

### Files Modified (1)
1. `src/pages/Auth.tsx` — Remove terms gate, simplify post-login redirect

