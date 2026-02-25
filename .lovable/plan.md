

# Expand Color Palettes & Make Cards Compact

## Overview
Expand from 6 schemes to 15 (5 free + 10 premium), make the cards more compact so more fit on screen, and ensure the modal scrolls properly.

## Changes

### `src/data/colorSchemes.ts`
- Change 3 of the existing premium schemes to free (so we have 5 free total): Aurora Blue, Cosmic Violet, Emerald Dream, Rose Quartz, Solar Gold all become `requiresSubscription: false`
- Keep Midnight Teal as premium
- Add 9 new premium schemes:
  1. **Crimson Flame** -- deep red/orange (hue 0-15)
  2. **Lavender Haze** -- soft lilac (hue 270-280)
  3. **Ocean Depths** -- deep navy blue (hue 210-220)
  4. **Neon Mint** -- bright mint green (hue 150-160)
  5. **Sunset Coral** -- warm coral/peach (hue 15-25)
  6. **Arctic Frost** -- icy light blue (hue 200-210)
  7. **Mystic Indigo** -- rich indigo (hue 235-245)
  8. **Cherry Blossom** -- soft sakura pink (hue 330-340)
  9. **Forest Moss** -- earthy dark green (hue 120-140)

Each new scheme follows the exact same structure as existing ones (darkVars + lightVars with all 10 CSS variable overrides, plus preview colors).

### `src/components/profile/ColorSchemeDialog.tsx`
- Make cards more compact: reduce padding from `p-4` to `p-3`, gradient bar height from `h-3` to `h-2`, gap from `gap-3` to `gap-2`
- Remove the description text to save vertical space (keep just the gradient bar + name row)
- Ensure the ScrollArea properly scrolls all 15 items by keeping the existing flex-col layout with `max-h-[80vh]`

## Technical Details

### Compact Card Layout
```text
+--------------------------------------+
|  [gradient bar ~~~~~~~~~~~~~~~~]     |
|  Aurora Blue            [checkmark]  |
+--------------------------------------+
```
Each card becomes ~50px tall instead of ~80px, letting users see 8-10 schemes at once without scrolling.

### New Scheme Example Structure
```typescript
{
  id: "crimson-flame",
  name: "Crimson Flame",
  description: "Fiery red intensity",
  requiresSubscription: true,
  previewColor: "#EF4444",
  secondaryPreviewColor: "#F97316",
  darkVars: { /* 10 CSS vars */ },
  lightVars: { /* 10 CSS vars */ },
}
```

### Files Modified
1. `src/data/colorSchemes.ts` -- add 9 new premium schemes, make 3 existing ones free
2. `src/components/profile/ColorSchemeDialog.tsx` -- compact card styling
