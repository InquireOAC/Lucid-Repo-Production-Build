

## Plan: Home Page Spacing, Pinned Techniques, and Falling Asleep Section

Inspired by the reference screenshots, this plan improves section spacing and adds two new sections to the home page.

### Changes to `src/pages/Home.tsx`

**1. Better spacing** — Change `space-y-6` to `space-y-8` on the main container for more breathing room between sections, matching the reference screenshots' generous vertical spacing.

**2. Add "Pinned Techniques" section** — New section placed after Quick Links / Academy card. Uses localStorage to persist an array of pinned technique indices. Shows a glass card placeholder if no techniques are pinned ("Pin a technique from the Insights page to display it here."). When populated, renders compact technique cards that link to the technique detail page.

**3. Add "While Falling Asleep" section** — A 2-column grid of technique cards (matching the reference screenshot layout) showing sleep-onset techniques: WILD, MILD, SSILD, FILD, and the advanced ones. Each card shows the technique emoji icon, name, and a lock icon for non-begininner techniques (linking to Insights detail). Cards navigate to `/insights/technique/:index` on tap.

**4. Section headers** — Use consistent `text-lg font-bold` headers with more spacing (`mb-4`) to match reference style.

### New file: `src/hooks/usePinnedTechniques.ts`
- Simple hook wrapping localStorage for pinned technique indices
- `pinnedIndices: number[]`, `pinTechnique(index)`, `unpinTechnique(index)`, `isPinned(index)`

### Modified file: `src/components/insights/TechniqueDetailPage.tsx`
- Add a "Pin/Unpin" button so users can pin techniques from the detail page

### Files

| File | Action |
|------|--------|
| `src/pages/Home.tsx` | Modify — increase spacing, add Pinned Techniques and While Falling Asleep sections |
| `src/hooks/usePinnedTechniques.ts` | Create — localStorage-backed pinned technique state |
| `src/components/insights/TechniqueDetailPage.tsx` | Modify — add Pin/Unpin button |

### Technical Detail

**Pinned Techniques storage:**
```typescript
const STORAGE_KEY = 'pinned-techniques';
// Stores array of technique indices from techniqueData.ts
```

**While Falling Asleep filter** — filters `techniques` array for those with `difficulty !== "Beginner"` (WILD, SSILD, FILD, DEILD, Meditation) — the sleep-onset/transition techniques. Displayed in a 2-column grid with glass cards showing emoji, name, and difficulty dots.

**Technique card in grid** — Compact square-ish card (~160px tall) with centered emoji icon, technique name, and difficulty indicator. Tapping navigates to `/insights/technique/:index`.

