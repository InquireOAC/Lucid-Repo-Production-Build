

# Add "Explore" Tab -- User Search + Technique Grid

## Overview

Add a new 5th tab called **Explore** positioned in the center of the bottom tab bar. This page combines two sections: a user search area at the top and the technique cards in a 2-column grid below. The existing Insights page will be simplified to only show the Symbols tab (removing its Techniques tab since techniques move to Explore).

---

## Changes

### 1. New Page: `src/pages/Explore.tsx`

Layout (top to bottom):
- Page title "Explore" at the top
- **User Search Section**: A search input styled with the app's glass/rounded-full pattern (matching Lucid Repo search style). Below it, a results area that shows matching user profiles as small horizontal cards (avatar + username + display name). Searches the `profiles` table via `ilike` on `username` and `display_name`. Shows empty state when no query or no results.
- **Techniques Section**: A "Techniques" section header, then the existing technique cards rendered in a **2-column CSS grid** (`grid grid-cols-2 gap-3`). The cards will be adapted for the smaller width -- shorter height (~120px), smaller emoji (~40px), tighter text. Tapping still navigates to `/insights/technique/:id`.

### 2. New Component: `src/components/explore/UserSearchResults.tsx`

- Accepts a search query string prop
- Uses a debounced query (300ms) to search `profiles` table: `username ilike %query%` or `display_name ilike %query%`
- Renders results as compact glass cards with avatar (using existing Avatar/AvatarFallback), username, and display name
- Tapping a user navigates to `/profile/:userId`
- Shows "No users found" when query has no matches
- Shows nothing when query is empty

### 3. New Component: `src/components/explore/TechniqueGridCard.tsx`

A compact version of TechniqueCard designed for 2-column grid:
- Smaller card (~120px tall), glass background with border matching app style
- Emoji icon centered at top (~40px)
- Technique name below (bold, 13px, centered, 2-line clamp)
- Difficulty dots at bottom
- Full card clickable, navigates to `/insights/technique/:id`

### 4. Update `src/layouts/MainLayout.tsx`

Change from 4 tabs to 5 tabs. New order:
1. **Journal** (Book icon) -- `/`
2. **Lucid Repo** (Moon icon) -- `/lucid-repo`
3. **Explore** (Compass icon) -- `/explore` (center position)
4. **Insights** (Sparkles icon) -- `/insights`
5. **Profile** (User icon) -- `/profile`

Import `Compass` from lucide-react for the Explore tab icon.

### 5. Update `src/pages/Insights.tsx`

Remove the Tabs wrapper and Techniques tab entirely. The page now just shows the Symbols tracker directly (no tabs needed since there's only one section). Keep the "Insights" title and render `SymbolTracker` below it.

### 6. Update `src/App.tsx`

- Add route: `<Route path="explore" element={<Explore />} />`
- Import the new Explore page
- The `/insights/technique/:id` route stays as-is (detail pages still work)

### 7. Update `src/components/insights/TechniqueDetailPage.tsx`

Update the back button navigation: instead of going to `/insights`, it should go to `/explore` since that's where techniques now live.

---

## Technical File Summary

| File | Action |
|------|--------|
| `src/pages/Explore.tsx` | New -- main Explore page with search + technique grid |
| `src/components/explore/UserSearchResults.tsx` | New -- debounced user search with profile cards |
| `src/components/explore/TechniqueGridCard.tsx` | New -- compact 2-col technique card |
| `src/layouts/MainLayout.tsx` | Update -- add 5th Explore tab in center position |
| `src/pages/Insights.tsx` | Update -- remove Techniques tab, show only Symbols |
| `src/App.tsx` | Update -- add `/explore` route |
| `src/components/insights/TechniqueDetailPage.tsx` | Update -- back button navigates to `/explore` |

