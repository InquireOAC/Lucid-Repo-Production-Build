
# Redesign Auth Page: Literary Dream Archive

## Overview
Replace the current sci-fi/tech auth page with an elegant, literary "Dream Archive" login experience. The page will feel like entering a quiet reading room at midnight -- warm, minimal, and premium.

## What Changes

### 1. Rewrite `src/pages/Auth.tsx`
Complete visual overhaul while preserving all existing auth logic (Google/Apple OAuth, email sign-in/sign-up, terms acceptance, remember me, Capacitor deep linking).

**Layout:**
- Remove the glass card container, aurora orbs, and tech-grid background
- Full-screen vertically centered flex column, max-width 420px
- Background: solid `#0B0F19` with a subtle CSS paper grain texture overlay at low opacity
- No particles, no glow, no neon

**Section 1 -- Header (top area):**
- Serif headline: "Welcome back, Dreamer." using a high-contrast serif font (already have `EB Garamond` and `Lora` imported)
- Subtext: "Join thousands sharing their nightly adventures." in muted warm gray (`#B8B3A8`)
- Generous vertical spacing

**Section 2 -- Authentication (middle area):**
- Default view shows sign-in mode (no tabs)
- Two large cream buttons (`#F4F1EA` bg, `#1A1A1A` text, rounded-2xl, soft shadow) for Google and Apple with monochrome black icons
- Caption: "No spam. Just stories." in muted text
- Thin warm divider with "OR" centered
- Email and password inputs: transparent background, bottom-border only, warm text
- Primary CTA button: "Enter the Archive" (cream button, full width)
- Remember Me toggle retained
- Small "New here? Create an account" link toggles to sign-up mode, which adds username field and terms checkbox
- Sign-up CTA: "Begin Your Story"

**Section 3 -- Community Preview (bottom area):**
- Subtle divider
- Small uppercase sans-serif label: "TONIGHT IN THE ARCHIVE"
- Three italic serif dream preview lines with staggered fade-in animation and slight opacity
- Editorial feel, not interactive

**Animations:**
- Framer Motion staggered fade-in: headline first, then buttons, then archive preview
- Subtle press animation on buttons (scale 0.98 on active)

### 2. Add Google Fonts Import
Add `Playfair Display` for the serif headline (more literary than EB Garamond at display sizes). Will add via the existing font import pattern in `src/index.css`.

### 3. Color/Style Approach
All styling done inline via Tailwind arbitrary values and inline styles using the specified hex colors (`#0B0F19`, `#F4F1EA`, `#B8B3A8`, `#1A1A1A`). No changes to the global theme variables -- this page has its own self-contained palette.

## What Stays the Same
- All Supabase OAuth logic (Google, Apple, email/password sign-in and sign-up)
- Capacitor native redirect handling
- Terms acceptance flow for existing users
- Remember Me localStorage logic
- Content filter for usernames
- Route remains `/auth`, component still exported as default

## Technical Details

**File changes:**
- `src/index.css` -- Add one `@import` line for Playfair Display font
- `src/pages/Auth.tsx` -- Full rewrite of the render/UI while keeping all handler functions and state logic identical

**Dependencies used:**
- `framer-motion` (already installed) for staggered fade-in animations
- Existing Radix UI components (Checkbox, ScrollArea) for terms flow
- No new dependencies needed
