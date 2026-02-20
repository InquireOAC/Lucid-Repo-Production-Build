

# Auth Page Redesign with OAuth Buttons

## Overview
Redesign the Auth page to match the app's cosmic aurora glassmorphic aesthetic, and add Google and Apple sign-in buttons. The visual treatment will mirror what was done for the Explore, Journal, and Lucid Repo pages.

## Design Changes

### 1. Page Background
- Add the `cosmic-background` class to the outer container so the auth page has the same starfield/aurora gradient as the rest of the app
- Remove the plain `bg-background` wrapper

### 2. Card Styling
- Replace the default `Card` with a `glass-card` styled container featuring the aurora border glow
- Add a subtle `featured-card` accent for the header area
- Use `rounded-2xl` for consistency with the rest of the app

### 3. Header Area
- Replace the plain "Welcome to Lucid Repository" text with a more compact "Lucid Repo" title using `gradient-text`
- Add a subtle tagline below: "Your dream journal awaits"
- Optionally display the app logo/icon if one exists

### 4. OAuth Buttons (Google and Apple)
- Add "Continue with Google" and "Continue with Apple" buttons at the top of both Sign In and Sign Up tabs
- Style them as outlined/ghost buttons with recognizable brand icons (inline SVGs for Google "G" and Apple logo)
- Add a divider line with "or" text between OAuth buttons and the email/password form

### 5. Form Inputs
- Apply `dream-input` class or glass-styled inputs with `focus:ring-primary/30` glow for consistency
- Slightly reduce vertical spacing for a more compact feel

### 6. Tab Styling
- Keep existing tab structure but ensure the `TabsList` uses glass-card background tinting

### 7. Terms Acceptance Screen
- Also apply `glass-card` treatment to the terms acceptance card for existing users

### 8. Back Button
- Keep the "Back to Journal" ghost button but move it outside the tabs for both views

## Technical Details

### Files Modified

**`src/pages/Auth.tsx`**
- Add `cosmic-background` class to the outer `div`
- Replace `Card` styling with `glass-card rounded-2xl border-white/10` classes
- Add `handleGoogleSignIn` and `handleAppleSignIn` functions using `supabase.auth.signInWithOAuth({ provider: 'google' })` and `supabase.auth.signInWithOAuth({ provider: 'apple' })`
- Add Google and Apple SVG icon buttons above each form
- Add an "or" divider between OAuth buttons and the email form
- Apply consistent input styling with `dream-input` or glass focus rings
- Apply `glass-card` to the terms acceptance card as well

**No new files or dependencies required.** Google and Apple SVGs will be inlined.

## Supabase Configuration Required

After the code changes, the user will need to:

1. **Google Sign-In**: Go to the Supabase dashboard -> Authentication -> Providers -> Google, and enable it with Google Cloud OAuth credentials (Client ID and Client Secret)
2. **Apple Sign-In**: Go to the Supabase dashboard -> Authentication -> Providers -> Apple, and enable it with Apple Developer credentials
3. **Redirect URLs**: Ensure the Site URL and Redirect URLs are correctly set in Supabase under Authentication -> URL Configuration

Instructions and dashboard links will be provided after implementation.

