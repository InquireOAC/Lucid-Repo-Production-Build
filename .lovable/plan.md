

# Desktop Layout Restructuring

The app currently renders as a mobile-only layout at all screen sizes — bottom tab bar, single-column content, and narrow max-widths. On desktop/laptop screens (768px+), this wastes most of the viewport.

## Approach

Transform `MainLayout.tsx` into a responsive layout that shows a **left sidebar navigation** on desktop (md+) and keeps the **bottom tab bar** on mobile only. Each page will get responsive content width and grid improvements.

## Changes

### 1. `src/layouts/MainLayout.tsx` — Responsive shell

- On `md+`: render a **fixed left sidebar** (w-64) with vertical nav items (icon + label), app logo at top, user avatar at bottom
- On mobile (`< md`): keep existing bottom tab bar (unchanged)
- Hide bottom tab bar on desktop via `md:hidden`
- Hide sidebar on mobile via `hidden md:flex`
- Main content area: `md:ml-64` with no bottom padding on desktop
- Sidebar style: `glass-card` background, `border-r border-primary/10`, cosmic aesthetic matching existing nav

### 2. `src/pages/Journal.tsx` — Two-column on desktop

- On `lg+`: use a two-column layout — dream list on left, selected dream preview panel on right
- On mobile: keep current single-column behavior
- Wider container: `max-w-6xl mx-auto`

### 3. `src/pages/LucidRepoContainer.tsx` — Wider grid

- Expand `max-w-6xl` container already exists — good
- On desktop, the masonry grid already scales to 4 columns — good
- Add wider hero card on desktop (`md:aspect-[21/9]`)
- DiscoveryRow: on desktop, allow wrapping grid instead of horizontal scroll

### 4. `src/pages/LucidStats.tsx` — Dashboard grid

- On `lg+`: render stat cards in a 2-column grid layout instead of single stack
- Hero card spans full width
- Smaller cards pair side-by-side

### 5. `src/pages/Profile.tsx` / `ProfilePageLayout.tsx`

- Already has `max-w-3xl lg:max-w-4xl xl:max-w-5xl` — widen to `max-w-6xl`
- Profile header can be wider with more horizontal space

### 6. `src/components/repos/DiscoveryRow.tsx` — Desktop grid mode

- On `md+`: switch from horizontal scroll to a wrapping grid (`md:grid md:grid-cols-3 lg:grid-cols-4`)
- Keep horizontal scroll on mobile

### 7. `src/index.css` — Remove mobile-only scroll constraints

- Add desktop-specific styles for sidebar layout
- Ensure `scrollbar-none` only applies on mobile

### 8. `src/pages/DreamStoryPage.tsx` — Centered reading width

- On desktop, constrain story content to `max-w-3xl mx-auto` for comfortable reading
- Images can go wider (`max-w-4xl`)

## Technical details

- Use `useIsMobile()` hook (already exists at 768px breakpoint) for JS-level branching where needed
- Prefer Tailwind responsive classes (`md:`, `lg:`) over JS where possible
- Sidebar nav items reuse the same routes as bottom tabs
- No new dependencies needed
- Bottom tab bar gets `md:hidden`, sidebar gets `hidden md:flex`

## Not changing

- Mobile experience stays identical
- Routing structure unchanged
- No new pages or components beyond the sidebar nav inside MainLayout

