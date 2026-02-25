

# Redesign Color Scheme Dialog -- Premium "Dream Palette" Experience

## Overview

Elevate the color scheme picker from a basic grid of circles into a premium, immersive selection experience that feels like choosing the atmosphere for your dream journal. Each scheme becomes a full-width swatch card showing a live gradient preview, with vault-glass styling, subtle glow effects, and a polished active-state indicator.

## New Design

```text
+------------------------------------------+
|  [X]                                      |
|                                           |
|  Choose Your Palette                      |
|  Set the tone for your dream journal      |
|                                           |
|  +--------------------------------------+ |
|  |  [gradient bar ~~~~~~~~~~~~~~~~]     | |
|  |  Aurora Blue            [checkmark]  | |
|  |  The default cosmic blue theme       | |
|  +--------------------------------------+ |
|                                           |
|  +--------------------------------------+ |
|  |  [gradient bar ~~~~~~~~~~~~~~~~]     | |
|  |  Cosmic Violet                       | |
|  |  Deep purple aurora vibes            | |
|  +--------------------------------------+ |
|                                           |
|  +--------------------------------------+ |
|  |  [gradient bar ~~~~~~~~~~~] [LOCK]   | |
|  |  Emerald Dream              PRO      | |
|  |  Lush green dreamscape               | |
|  +--------------------------------------+ |
|  ...                                      |
+------------------------------------------+
```

## Changes

### `src/components/profile/ColorSchemeDialog.tsx` -- Full rewrite

**Layout redesign:**
- Switch from 2-column grid of circles to a single-column list of full-width swatch cards
- Each card is a `vault-glass` styled button with rounded corners and `vault-card-lift` hover effect
- At the top of each card: a gradient bar (h-3 rounded-full) using the scheme's primary and secondary preview colors to give a richer sense of the palette
- Below the gradient: scheme name (left-aligned, font-medium) and description (muted, smaller)
- Active scheme gets a `border-primary` border, a subtle `ring-2 ring-primary/20`, and a small checkmark icon (lucide `Check`) in a primary-colored circle on the right
- Locked schemes show a frosted overlay strip with `Lock` icon and "PRO" label, plus reduced opacity on the gradient bar

**Header upgrade:**
- Title: "Choose Your Palette"
- Subtitle: "Set the tone for your dream journal"

**Visual details:**
- Each card uses `vault-glass` background class
- Hover state: `vault-card-lift` + border glow via `hover:border-primary/30 hover:shadow-[0_0_15px_hsl(var(--primary)/0.08)]`
- Gradient bar per scheme uses an inline style: `background: linear-gradient(90deg, previewColor, secondaryPreviewColor)` -- add a `secondaryPreviewColor` to the scheme data

### `src/data/colorSchemes.ts` -- Add secondary preview color

Add a `secondaryPreviewColor` field to the `ColorScheme` interface and each scheme entry. This enables the gradient bar in each swatch card:

| Scheme | previewColor | secondaryPreviewColor |
|---|---|---|
| Aurora Blue | #3B82F6 | #8B5CF6 |
| Cosmic Violet | #8B5CF6 | #6366F1 |
| Emerald Dream | #10B981 | #14B8A6 |
| Rose Quartz | #F43F5E | #EC4899 |
| Solar Gold | #F59E0B | #F97316 |
| Midnight Teal | #14B8A6 | #06B6D4 |

## Technical Notes

- No new files needed -- just the two file edits above
- The dialog retains the same open/close behavior and subscription gating logic
- The `secondaryPreviewColor` is purely cosmetic (used only in the gradient bar)
- All existing vault-glass and vault-card-lift classes are already defined in index.css

