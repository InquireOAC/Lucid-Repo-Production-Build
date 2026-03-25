

## Plan: Flat-Colored Technique Cards

Replace glass-morphism styling on both the **While Falling Asleep** cards and **Pinned Techniques** cards with flat, solid-color backgrounds that match the app's cosmic aesthetic.

### Color Scheme

Each difficulty level gets a flat dark-toned background derived from the existing palette:

- **Beginner** — `bg-emerald-950/80` with `text-emerald-400` accent
- **Intermediate** — `bg-amber-950/80` with `text-amber-400` accent  
- **Advanced** — `bg-blue-950/80` with `text-blue-400` accent

### Changes to `src/pages/Home.tsx`

**While Falling Asleep cards (lines 554-572):**
- Keep the image background and gradient overlay (these are the uploaded artwork cards)
- Remove any `glass-card` or `backdrop-blur` classes if present
- These cards already use flat image backgrounds with gradient overlays — they stay as-is since they don't use glass styling

**Pinned Techniques cards (lines 517-534):**
- Replace `bg-gradient-to-r ${styles.gradient} backdrop-blur-md` with flat solid colors based on difficulty
- Replace `${styles.border}` with subtle solid borders (e.g., `border-emerald-800/40`)
- Remove `backdrop-blur` entirely
- Keep the rounded-2xl shape and hover brightness effect

**Pinned Techniques empty state (line 495):**
- Replace `glass-card border-primary/10` with `bg-[#0d1425] border-primary/15` — a flat dark card matching the app background

### Technical Detail

Add a helper function to map difficulty to flat colors:

```typescript
function getFlatDifficultyBg(difficulty: string) {
  switch (difficulty) {
    case "Beginner": return "bg-emerald-950/80 border-emerald-800/30";
    case "Intermediate": return "bg-amber-950/80 border-amber-800/30";
    case "Advanced": return "bg-blue-950/80 border-blue-800/30";
    default: return "bg-card/80 border-border/30";
  }
}
```

Single file change: `src/pages/Home.tsx`

