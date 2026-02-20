

## Custom Thumbnails for Technique Cards

### What Changes
Both the `TechniqueCard` (used on Insights) and `TechniqueGridCard` (used on Explore) will be redesigned with visually rich, color-coded thumbnail backgrounds that prominently show the technique type and difficulty level. Cards remain tappable for navigation.

### Design Details

Each card gets a **gradient background strip** color-coded by difficulty:
- **Beginner** -- emerald/green tones (`from-emerald-500/20 to-emerald-700/10`)
- **Intermediate** -- amber/gold tones (`from-amber-500/20 to-amber-700/10`)
- **Advanced** -- purple/rose tones (`from-purple-500/20 to-rose-700/10`)

Visual enhancements:
- A **difficulty badge pill** in the top-right corner (e.g., "Beginner" + dot rating)
- An **effectiveness indicator** shown as small star icons (1-3 stars)
- The emoji icon rendered larger with a frosted glass circle backdrop
- The technique name and acronym (if any) remain prominent
- Subtle colored border that matches the difficulty gradient

### Technical Changes

**File: `src/components/insights/TechniqueCard.tsx`** (list-style card on Insights page)
- Add a difficulty-based gradient overlay on the left edge or as a top banner
- Add a difficulty badge pill (top-right) with colored background matching difficulty
- Add effectiveness stars below or beside the difficulty dots
- Increase icon backdrop with a frosted circle (`bg-white/5 backdrop-blur-sm rounded-full`)

**File: `src/components/explore/TechniqueGridCard.tsx`** (grid card on Explore page)
- Add the same difficulty-based gradient as the card background
- Add a small difficulty label pill at the top of the card
- Add effectiveness stars below the difficulty dots
- Apply a subtle matching colored border

**Helper:** Create a small utility function (inline or shared) to map difficulty to gradient classes and badge colors, keeping both cards consistent.

No database changes, no edge functions, no new routes needed.

