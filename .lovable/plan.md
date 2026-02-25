

# Sleeker Bottom Tab Bar

## Changes

**File: `src/layouts/MainLayout.tsx`**

1. **Remove labels** -- Delete the `<span>` element showing the text label under each icon (lines 85-88)
2. **Reduce active glow** -- Replace the heavy `bg-[hsl(270,70%,50%)] shadow-lg shadow-purple-500/40` with a subtle blue tint: `bg-primary/15 text-primary` (no large box-shadow)
3. **Shrink tab bar height** -- Reduce from `h-16` to `h-14` since labels are gone
4. **Fix leftover purple** -- The active icon background still uses hardcoded purple (`hsl(270,70%,50%)`) which should become the new blue scheme
5. **Adjust padding** -- Reduce icon container padding from `p-2` to `p-1.5` for a tighter, cleaner look

### Before vs After (NavTab active state)

```text
Before:
  [  icon  ]     <-- p-2, purple bg, large shadow
   Label          <-- text-xs label

After:
  [ icon ]        <-- p-1.5, subtle primary/15 bg, no heavy shadow
                  <-- no label
```

### Technical Detail

The `NavTab` component render will simplify to:

```text
<NavLink ...>
  <div className={cn(
    "p-1.5 rounded-full transition-all duration-300 relative",
    isActive
      ? "bg-primary/15 text-primary"
      : "text-white/50"
  )}>
    {icon}
    {badge...}
  </div>
</NavLink>
```

The outer `<div>` height changes from `h-16` to `h-14`. The bottom padding offset in the scrollable content area updates from `4rem` to `3.5rem` to match.

Only one file is modified: `src/layouts/MainLayout.tsx`.

