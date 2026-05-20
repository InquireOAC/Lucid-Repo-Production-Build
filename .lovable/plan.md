## Fix: Reduce Auth Page Logo Size

The Lucid Engine logo on the Auth page is currently `w-72` (288px), which dominates the mobile viewport and pushes the form too far down.

### Changes
1. **Shrink the logo image** — reduce from `w-72` to `w-48` (192px) to keep it prominent but not overwhelming.
2. **Shrink the radial glow halo** — reduce the halo container from `w-[340px] h-[220px]` to `w-[260px] h-[180px]` so it stays proportional behind the smaller logo.

### File to edit
- `src/pages/Auth.tsx` — adjust `className` on the logo `<motion.img>` and the `w`/`h` on the glow `<div>` above it.

No other auth logic, styling, or functionality will be touched.