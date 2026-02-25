

# Clean Up Explore Page

## Overview
Remove the Techniques section and Daily Insight card from `VaultTabContent`, and clean up unused imports/data references.

## Changes

### `src/components/explore/VaultTabContent.tsx`
- Remove the **Techniques section** (lines 74-86) and the **Daily Insight card** (lines 88-99)
- Remove unused imports: `Lightbulb`, `TechniqueGridCard`, `techniques`, `dailyInsights`, `lucidDreamingTechniqueIndices`, `meditationTechniqueIndices`
- Remove the `techniqueIndices` variable and `tips`/`todayTip` variables
- Keep: Featured Video, More Videos, and Research & Studies sections (all with working `window.open` links already wired up in their respective card components)

### No other files need changes
The video and study card components (`FeaturedVideoCard`, `VideoThumbnailCard`, `ResearchStudyCard`) already have correct `onClick` handlers using `window.open(url, "_blank")` for external links.

