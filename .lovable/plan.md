

# Technique Cards Redesign: Oniri-Style Layout + Dedicated Detail Pages

## Overview

Redesign the technique cards on the Insights page to match the Oniri reference images, and add dedicated detail pages for each technique when tapped.

## Current vs. Target

**Current**: Small accordion-style cards with emoji + title on left, chevron to expand inline steps.

**Target (from reference)**:
- **List view**: Large rectangular cards (~140px tall) with a dark glass background. Title and short description on the left side, a large decorative emoji/icon on the right side. No expand/collapse -- tapping navigates to a detail page.
- **Detail page**: Full-screen page with a large icon/illustration at the top, centered technique name, subtitle, difficulty + effectiveness dot indicators, a rich multi-paragraph description, and the step-by-step tutorial. Back button in top-left.

---

## Changes

### 1. Redesign `TechniqueCard.tsx`

Remove the accordion expand/collapse behavior. Make each card a navigation target instead.

New card layout:
- Height: ~140px, glass background with subtle border
- Left side: technique name (bold, white), short 1-line description below (muted)
- Right side: large emoji icon (~64px) with subtle sparkle decorations via CSS
- Full card is clickable, navigates to `/insights/technique/:index`
- No chevron, no inline steps

### 2. Update `Technique` data model

Add new fields to each technique object:
- `effectiveness`: 1-3 rating (matching Oniri's dot indicators)
- `difficultyRating`: 1-3 numeric (for dot display)
- `longDescription`: A richer multi-paragraph description for the detail page
- `shortDescription`: The brief one-liner shown on the card in the list

### 3. New Component: `TechniqueDetailPage.tsx`

A full-screen page rendered at route `/insights/technique/:id`.

Layout (top to bottom):
- Back button (top-left arrow)
- Large centered emoji icon (~120px) with decorative sparkle dots around it
- Technique name (centered, bold, large)
- Subtitle in muted purple text (the short description)
- Two pill badges side by side: "Difficulty" with filled/empty dots, "Effectiveness" with filled/empty dots
- Long description paragraphs
- Step-by-step instructions section styled as a card with numbered steps
- Bottom safe area padding

### 4. Update `TechniqueLibrary.tsx`

- Remove the header text ("Technique Library" / "Tap any card...")
- Just render the list of redesigned cards with proper spacing
- Pass navigation handler or use react-router `useNavigate`

### 5. Add Route in `App.tsx`

Add: `<Route path="insights/technique/:id" element={<TechniqueDetailPage />} />`

### 6. Update `Insights.tsx`

The Techniques tab just shows the card list -- no changes needed beyond what TechniqueLibrary handles.

---

## Technical File Summary

| File | Action |
|------|--------|
| `src/components/insights/TechniqueCard.tsx` | Rewrite -- large card layout, no accordion, onClick navigates |
| `src/components/insights/TechniqueLibrary.tsx` | Update -- pass technique index, remove header |
| `src/components/insights/TechniqueDetailPage.tsx` | New -- full detail page with back nav, ratings, steps |
| `src/components/insights/techniqueData.ts` | New -- extract technique data with added fields (effectiveness, longDescription) |
| `src/App.tsx` | Add route for `/insights/technique/:id` |

