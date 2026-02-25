

# Design System Upgrade: Align LucidRepo with Lucid Engine

## Overview

The [Lucid Engine](/projects/befcf051-a84a-49de-9e27-949eb46970a6) project uses a polished, sci-fi/tech-forward design system with clean CSS variable-driven theming, tech-grid backgrounds, chamfered card corners, scanline animations, vault-style glassmorphism, glow-on-hover effects, and a blue-purple gradient palette (`hsl(217, 91%, 60%)` to `hsl(263, 60%, 55%)`). LucidRepo currently uses a more "magical cosmic" aesthetic with many hardcoded HSL values scattered throughout index.css and custom card classes.

Here is a summary of the key differences and what we will port over.

## Design Comparison

| Aspect | LucidRepo (Current) | Lucid Engine (Target) |
|---|---|---|
| Primary color | Aurora purple `hsl(280, 70%, 55%)` | Blue `hsl(217, 91%, 60%)` blending to violet `hsl(263, 60%, 55%)` |
| Card style | Heavy glassmorphism with purple tints, multiple box-shadows | Clean `vault-glass` with subtle blur, single primary-tinted border |
| Card hover | Large translateY + scale + glow | `vault-card-lift` with 3D lift + glow ring + light sweep animation |
| Backgrounds | Hardcoded radial star particles via `::before` | `tech-grid-bg` subtle grid lines + radial gradient tokens |
| Animations | Float, shimmer, aurora-shift | Scanline overlays, data streams, tech-border-pulse, vault light sweeps |
| Scrollbars | Basic purple-tinted | Sci-fi gradient scrollbar with glow on hover |
| Typography | basis-grotesque-pro / Lato | JetBrains Mono (mono), clean system stack |
| Buttons | Many custom variants (aurora, magic, luminous) | Clean standard variants with CSS variable glows |
| Design tokens | Mix of CSS vars + hardcoded HSL values | Fully CSS variable-driven (`--gradient-primary`, `--glow-primary`, etc.) |

## Implementation Plan

### 1. Update CSS Variables in `src/index.css`

**Dark mode tokens** (LucidRepo is dark-first, so this is the primary target):
- Shift `--primary` from pure purple `234 89% 73%` to a blue-violet: `217 91% 60%`
- Shift `--secondary` to `263 60% 55%` (the violet end of the Lucid Engine gradient)
- Add new design tokens: `--gradient-primary`, `--gradient-radial`, `--glow-primary`, `--glow-secondary`
- Update `--card` to a deeper, cooler tone: `220 13% 8%`
- Update `--border` and `--input` to subtle cool-toned: `220 10% 16%`
- Update `--muted` / `--muted-foreground` to cooler values

### 2. Add Lucid Engine Utility Classes to `src/index.css`

Port over these key CSS utilities (appending to the file):
- **`tech-grid-bg`** -- subtle grid-line background pattern
- **`vault-glass`** -- cleaner glassmorphic card with primary-tinted border
- **`vault-card-lift`** -- 3D hover with glow ring
- **`vault-light-sweep`** -- animated light sweep on hover
- **`corner-brackets`** -- decorative bracket accents for featured elements
- **`tech-glow` / `tech-glow-hover`** -- pulsing border glow
- **`scanline-overlay`** -- subtle scanline on hover
- Updated scrollbar styling with gradient thumb + glow on hover

### 3. Update `tailwind.config.ts`

- Add `--gradient-primary` and `--gradient-radial` to `backgroundImage`
- Add `--glow-primary` and `--glow-secondary` to `boxShadow`
- Add Lucid Engine keyframes: `glow-pulse`, `fade-in-up`, `gradient` shift
- Add JetBrains Mono to the `mono` font family stack (optional, for code/data displays)

### 4. Update Card Component (`src/components/ui/card.tsx`)

- Add a new `"tech"` variant that uses `vault-glass vault-card-lift vault-light-sweep`
- Update the `"glass"` variant to use the cleaner `vault-glass` styling
- Keep existing variants for backward compatibility

### 5. Update Button Component (`src/components/ui/button.tsx`)

- Restyle the `"aurora"` variant to use `--gradient-primary` (blue-to-violet) instead of the static purple
- Update `"luminous"` to use the new gradient tokens
- Add a `"tech"` variant with chamfered appearance and glow on hover

### 6. Update Key Page Backgrounds

- **`cosmic-background`** and **`starry-background`** in index.css: layer in `tech-grid-bg` pattern alongside existing aurora gradients for a more structured, tech feel
- **`dream-background`**: add subtle grid overlay
- Auth page (`src/pages/Auth.tsx`): use `tech-grid-bg` + vault-glass for the card

### 7. Update Existing Component References (Minimal)

Scan and update a few high-impact surfaces to use the new classes:
- `LucidRepoContainer.tsx` -- use `tech-grid-bg` on the page background
- `DreamCard` components -- add `vault-card-lift vault-light-sweep` classes
- `FeaturedDream` -- add `corner-brackets` accent
- Profile pages -- adopt `vault-glass` cards

---

## Technical Details

### New CSS Variables (Dark Mode)

```text
--primary:            217 91% 60%
--secondary:          263 60% 55%
--card:               220 13% 8%
--border:             220 10% 16%
--input:              220 10% 16%
--muted:              220 10% 18%
--muted-foreground:   220 5% 65%
--gradient-primary:   linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(263 60% 55%) 100%)
--gradient-radial:    radial-gradient(circle at 50% 0%, hsl(217 91% 60% / 0.15) 0%, transparent 70%)
--glow-primary:       0 0 40px hsl(217 91% 60% / 0.4)
--glow-secondary:     0 0 30px hsl(263 60% 55% / 0.3)
```

### Files Modified

| File | Change |
|---|---|
| `src/index.css` | Update CSS variables, add tech/vault utility classes, update scrollbar styles |
| `tailwind.config.ts` | Add gradient/glow tokens, new keyframes and animations |
| `src/components/ui/card.tsx` | Add `"tech"` variant |
| `src/components/ui/button.tsx` | Update aurora/luminous variants, add tech variant |
| `src/pages/Auth.tsx` | Apply tech-grid + vault-glass styling |
| `src/pages/LucidRepoContainer.tsx` | Apply tech-grid background |
| `src/components/repos/MasonryDreamGrid.tsx` | Add vault-card-lift to dream cards |
| `src/components/repos/FeaturedDream.tsx` | Add corner-brackets accent |

### What Stays the Same

- All functional logic, hooks, and data flows remain untouched
- Existing purple-toned aurora colors in the custom `dream`, `aurora`, `cosmic` color scales in tailwind.config stay (for backward compat) but the CSS variable-driven `primary`/`secondary` shift
- Mobile safe-area handling and iOS-specific fixes untouched
- All Supabase/edge function code untouched

