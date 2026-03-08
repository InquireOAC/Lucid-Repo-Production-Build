

## Fix: Stable animated starry background on Dream Connections

### Problems
1. **Stars re-randomize on filter tab change** — `Math.random()` is called during render, so every re-render (triggered by `setFilter`) generates new star positions.
2. **Stars need visible animation** — the `pulse` keyframe exists but stars should have a clear twinkling effect.

### Solution

**Memoize star data** with `useMemo` so positions/sizes/delays are computed once on mount and never change when the filter tab changes.

**Add a `twinkle` keyframe** in `index.css` that fades stars in/out (opacity 0.1 → 1 → 0.1) for a more visible animated effect than `pulse`.

### Changes

| File | Change |
|------|--------|
| `src/pages/DreamConnections.tsx` | Use `useMemo` to pre-compute an array of 60 star objects with fixed random values. Render from that array instead of calling `Math.random()` inline. Use `twinkle` animation class. |
| `src/index.css` | Add `@keyframes twinkle` animation (opacity cycle) |

