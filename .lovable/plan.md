

# Shift All Purple to Blue Color Scheme

## Overview

There are ~400+ references to purple colors scattered across CSS custom properties, hardcoded HSL values in `index.css`, Tailwind color classes in components, and Tailwind config color definitions. This plan replaces all purple/violet tones with the blue-primary scheme (`hsl(217, 91%, 60%)` and nearby cool blues).

## Changes

### 1. `src/index.css` -- Replace all hardcoded purple HSL values

All instances of `hsl(280,...)`, `hsl(270,...)`, `hsl(250,...)`, `hsl(255,...)` shift to blue equivalents:

| Old Color | New Color | Usage |
|---|---|---|
| `hsl(280, 70%, 55%)` (purple) | `hsl(217, 91%, 60%)` (primary blue) | Glows, backgrounds, borders |
| `hsl(270, 100%, 65%)` (violet) | `hsl(220, 80%, 65%)` (light blue) | Secondary accents |
| `hsl(270, 80%, 75%)` (light violet) | `hsl(217, 80%, 75%)` (light blue) | gradient-text |
| `hsl(250, 25%, 5%)` (deep purple-black) | `hsl(220, 15%, 6%)` (deep blue-black) | Dark backgrounds |
| `hsl(255, 22%, 7%)` (cosmic purple) | `hsl(220, 13%, 8%)` (cosmic blue) | Dark backgrounds |
| `hsl(280, 40-60%, ...)` (mid purple) | `hsl(217, 60-80%, ...)` (mid blue) | Glass cards, overlays |
| `hsl(250, 35%, 18%)` (share card bg) | `hsl(220, 25%, 14%)` (blue-tinted dark) | Share card |

Specific sections affected:
- `.glass-card` -- border, box-shadow, gradients shift from `280` to `217`
- `.luminous-card` -- same shift
- `.featured-card` -- same shift
- `.luminous-hover`, `.magic-hover`, `.oniri-hover` -- glow colors
- `.gradient-text`, `.glow-text` -- text effects
- `.animate-shimmer` -- shimmer gradient
- `.learning-card`, `.geometric-bg` -- overlays
- `.profile-banner` -- gradient and aurora
- `.dream-tome-bg`, `.dream-input` -- dream entry
- `.dream-background`, `.ocean-background` -- page backgrounds
- `#dream-share-card` -- share card overlays
- `@keyframes magic-glow`, `@keyframes luminous-pulse` -- animation keyframes

Also update the light mode `:root` CSS variables:
- `--aurora-purple: 280 70% 55%` becomes `217 91% 60%`
- `--electric-violet: 270 100% 65%` becomes `220 80% 65%`
- `--glow-purple: 280 70% 55%` becomes `217 91% 60%`
- `--glow-violet: 270 100% 65%` becomes `220 80% 65%`

### 2. `tailwind.config.ts` -- Shift color palette definitions

Update the custom color scales:
- `cosmic.purple`: `hsl(280, 70%, 55%)` to `hsl(217, 91%, 60%)`
- `cosmic.violet`: `hsl(270, 100%, 65%)` to `hsl(220, 80%, 65%)`
- `aurora.purple`: same shift
- `aurora.violet`: same shift
- `dream.purple`: same shift
- `dream.violet`: same shift
- `dream.light`: `hsl(280, 60%, 75%)` to `hsl(217, 60%, 75%)`
- `oniri.purple`: same shift
- `oniri.violet`: same shift

### 3. Component files -- Replace Tailwind purple utility classes

Across ~20 component files, replace purple Tailwind classes with blue equivalents:

| Old Class | New Class |
|---|---|
| `text-purple-400` | `text-blue-400` |
| `text-purple-300` | `text-blue-300` |
| `bg-purple-500/20` | `bg-blue-500/20` |
| `bg-purple-400` | `bg-blue-400` |
| `border-purple-500/25` | `border-blue-500/25` |
| `border-purple-400/30` | `border-blue-400/30` |
| `border-purple-300/20` | `border-blue-300/20` |
| `from-purple-400` | `from-blue-400` |
| `from-purple-500` | `from-blue-500` |
| `to-purple-500` | `to-blue-500` |
| `shadow-purple-500/10` | `shadow-blue-500/10` |
| `hover:shadow-purple-500/10` | `hover:shadow-blue-500/10` |
| `from-purple-400/30` | `from-blue-400/30` |
| `to-pink-400/30` | `to-blue-300/30` |
| `to-pink-400` | `to-blue-300` |
| `to-pink-500/10` | `to-blue-500/10` |

Files affected:
- `src/components/dreams/AnalysisSections.tsx`
- `src/components/learning/LevelContentView.tsx`
- `src/components/saved-chats/SavedChatCard.tsx`
- `src/components/saved-chats/LoadingState.tsx`
- `src/components/saved-chats/EmptyChatsState.tsx`
- `src/components/notifications/NotificationCard.tsx`
- `src/components/profile/DreamShareSelector.tsx`
- `src/components/explore/TechniqueGridCard.tsx`
- `src/utils/techniqueStyles.ts`

### 4. Custom Tailwind color references (`dream-purple`, `dream-lavender`, `aurora-purple`)

These classes map to the Tailwind config colors updated in step 2, so they'll automatically shift once the config values change. The ~19 component files using `dream-purple`, `dream-lavender`, `aurora-purple` will pick up the new blue tones without code changes.

---

## Files Modified

| File | What Changes |
|---|---|
| `src/index.css` | ~50 HSL value replacements across backgrounds, cards, glows, animations |
| `tailwind.config.ts` | 9 color scale values updated from purple to blue |
| `src/components/dreams/AnalysisSections.tsx` | `text-purple-400` to `text-blue-400` |
| `src/components/learning/LevelContentView.tsx` | `to-purple-500/10` to `to-blue-500/10` |
| `src/components/saved-chats/SavedChatCard.tsx` | purple classes to blue |
| `src/components/saved-chats/LoadingState.tsx` | purple gradient to blue |
| `src/components/saved-chats/EmptyChatsState.tsx` | purple to blue |
| `src/components/notifications/NotificationCard.tsx` | purple to blue throughout |
| `src/components/profile/DreamShareSelector.tsx` | purple to blue |
| `src/components/explore/TechniqueGridCard.tsx` | purple border to blue |
| `src/utils/techniqueStyles.ts` | purple classes to blue |

## What Stays the Same

- All functional logic, hooks, API calls untouched
- Layout and spacing unchanged
- The blue-to-violet gradient primary (already set from last upgrade) stays
- Gold accent colors stay
- All Supabase/edge function code untouched

