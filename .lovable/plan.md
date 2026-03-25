

## Plan: Admin Stats Mock Data + Comprehensive Scene Management

### Part 1: Admin Stats Mock Data

**Problem**: The admin analytics charts are empty because there's no data in the database yet.

**Fix**: Add fallback mock data directly in `useAdminAnalytics.tsx`. When the real query returns zero activity, populate charts with realistic sample data points so admins can see how the dashboard looks.

**File**: `src/hooks/useAdminAnalytics.tsx`
- After processing real data, check if all charts are flat zeros
- If so, inject mock data: ~30 days of realistic new users (2-8/day), subscriptions (0-2/day), image generations (5-15/day), video generations (1-4/day), public dreams (3-10/day)
- Set mock MRR (~$350), retention (~72%), MAU (~85)
- Flag it visually or just fill the charts — admin will know it's demo data

### Part 2: Fix Scene Generation Button Not Reappearing

**Problem**: In `DreamStoryPage.tsx` line 405, the condition `sectionImages.length === 0` checks array length, but after deleting images, the array entries still exist (with `image_url: undefined`). So the button never reappears.

**Fix**: Change the condition to check whether any scene has an actual image, not just array length.

**File**: `src/pages/DreamStoryPage.tsx` (line 405)
- Change: `sectionImages.length === 0` → `sectionImages.filter(s => s.image_url).length === 0`
- This makes the "Generate Story Images" button reappear when all scene images have been deleted

### Part 3: Add Scene Management to Edit Dream Page

**Problem**: The Edit Dream page only shows the `SectionImagesManager` when `sectionImages.length > 0`, and has no way to generate/regenerate scenes from scratch.

**Fix**: Add a "Generate Story Scenes" button and a scene text editor to the Edit Dream page's Dream Tools section.

**File**: `src/pages/EditDream.tsx`
- Import `useSectionImageGeneration` hook
- Add a new Dream Tools section "Dream Scenes" that:
  - Shows the existing `SectionImagesManager` carousel when scenes with images exist
  - Shows a "Generate Story Images" button when no scene images exist (mirroring DreamStoryPage behavior)
  - Shows generating progress indicator during generation
- Build a minimal dream object to pass to `useSectionImageGeneration` using the current `dreamId`, `formData.content`, and `formData.title`
- Update `sectionImages` state when generation completes

**File**: `src/components/dreams/SectionImagesManager.tsx`
- Remove the early return `if (scenesWithMedia.length === 0) return null;` — the parent now handles visibility

### Files Modified (4)
1. `src/hooks/useAdminAnalytics.tsx` — Add mock data fallback
2. `src/pages/DreamStoryPage.tsx` — Fix button reappearance condition
3. `src/pages/EditDream.tsx` — Add scene generation + management UI
4. `src/components/dreams/SectionImagesManager.tsx` — Keep early return but ensure parent handles empty state

