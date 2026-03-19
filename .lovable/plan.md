

# Fix Onboarding Logo + Add Terms Screen

## 1. Replace Logo
The onboarding welcome screen currently references `/lovable-uploads/4e6c9bed-1db7-420d-8424-3598e72f17bd.png`. Copy the uploaded `LucidRepoLogoAndroid.png` to `src/assets/` and update the import in `OnboardingFlow.tsx` to use it instead.

## 2. Add Terms & Conditions Screen
Per Apple's App Store requirements, users must agree to Terms of Use / Privacy Policy during onboarding. Add a final screen (screen 7, after "Your Journey Begins") — or integrate it into the last screen — that shows:
- Links to Terms of Use and Privacy Policy
- A checkbox: "I agree to the Terms of Use and Privacy Policy"
- The "Enter the Dream Realm" CTA is disabled until the checkbox is checked
- On acceptance, call the existing `markTermsAsAccepted` logic from `useTermsAcceptance` to persist to Supabase

The existing `TermsAcceptanceDialog` component and `useTermsAcceptance` hook already handle the DB persistence — we'll reuse that logic inline.

## Screen Flow (updated)
1. Enter the Dream Realm (with correct logo)
2. Capture Every Dream
3. AI-Powered Insights
4. See Your Dreams Come Alive
5. Join the Dream Community
6. Your Journey Begins (portal animation, "Next" button)
7. **Terms & Privacy** — checkbox + "Enter the Dream Realm" CTA

## Files Changed

| File | Change |
|------|--------|
| `src/assets/LucidRepoLogoAndroid.png` | Copy uploaded logo here |
| `src/components/onboarding/OnboardingFlow.tsx` | Import new logo asset, replace image src on screen 1. Add screen 7 with terms checkbox, privacy/terms links, and gated CTA. Move "Enter the Dream Realm" button to screen 7. Screen 6 gets a "Next" button instead. |

