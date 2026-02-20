

# Explore Page Redesign

## Overview
The Explore page currently feels disconnected from the app's cosmic aurora aesthetic. This redesign brings it in line with the Journal, Lucid Repo, and Profile pages by adding the cosmic background, a refined header with a subtle tagline, polished section headers with icons, upgraded technique and meditation cards with glass effects and glow interactions, and better visual hierarchy throughout.

## Design Changes

### 1. Page Header
- Replace the plain "Explore" text with a styled header featuring a Compass icon and a muted tagline: "Discover techniques and deepen your practice"
- Add proper `pt-safe-top` spacing consistent with other pages

### 2. Search Bar
- Add a subtle glow ring on focus (`focus:ring-primary/30`) to match the cosmic input style used elsewhere
- Keep the existing rounded-full glass style

### 3. Techniques Section
- Replace the plain "Techniques" text header with a section header featuring a `Wand2` icon (consistent with the app's preference for context-specific icons over sparkles)
- Upgrade difficulty badges with subtle glow effects
- Make technique cards use `glass-card` base styling with a colored top-edge accent line per difficulty level (emerald/amber/purple) instead of full gradient backgrounds
- Add `luminous-hover` interaction class for a lift-and-glow effect on tap/hover

### 4. Meditation Section
- Replace static cards with interactive `glass-card` styled tiles
- Add a `Brain` icon to the section header
- Give each meditation card a soft pulsing glow border on hover (`animate-magic-glow` on hover)
- Slightly increase card height and add a subtle gradient accent along the top edge

### 5. New "Quick Tips" Banner
- Add a small featured-card banner between Techniques and Meditation with a rotating daily tip about lucid dreaming (hardcoded array, changes based on day-of-week)
- Uses the `featured-card` variant for visual prominence

## Technical Details

### Files Modified

**`src/pages/Explore.tsx`**
- Add imports for `Wand2`, `Brain`, `Compass`, `Lightbulb` from lucide-react
- Wrap content sections with proper cosmic-themed section headers using icon + text combos
- Add a daily tip banner section between techniques and meditation
- Add a hardcoded `dailyTips` array and select one based on `new Date().getDay()`

**`src/components/explore/TechniqueGridCard.tsx`**
- Replace the gradient background with `glass-card` base class
- Add a 3px colored top-border accent line matching difficulty (emerald/amber/purple)
- Add `luminous-hover` class for interactive glow on hover
- Slightly increase icon size from 36px to 40px for better visual weight

**No new files or dependencies required.**

## Visual Result
- Every section gains the glass/glow treatment consistent with Journal and Lucid Repo pages
- Technique cards feel more premium with glass morphism instead of flat color fills
- Section headers gain icon companions for better scanability
- The daily tip banner adds a touch of content richness and visual variety
- Meditation cards gain interactivity cues even though they remain informational for now

