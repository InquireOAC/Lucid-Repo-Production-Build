

# Dream Gallery Redesign — "Dream Library"

## Overview
Transform the basic 2-column grid gallery into a premium, immersive "Dream Library" experience that fits the app's Cosmic Tech aesthetic.

## Design Changes

### Header
- Rename from "Dream Gallery" to "Dream Library"
- Add a subtle stats row below the header showing total count of images and videos (e.g., "12 dreams visualized · 3 videos")

### Gallery Grid
- **Masonry-style mixed layout**: Alternate between large featured cards (full-width, aspect-[16/9]) and 2-column pairs (aspect-[3/4]) for visual rhythm
- First item renders full-width as a "featured" card
- Every 3rd item after that also renders full-width
- Staggered fade-in animation using framer-motion (matching existing app patterns)

### Card Design
- Rounded-2xl with subtle border (border-white/10)
- Gradient overlay from bottom: `from-black/80 via-black/40 to-transparent`
- Title text at bottom-left, date in small muted text below title
- Video badge: frosted glass pill with Play icon + "Video" text (top-right)
- Hover/press: `scale(0.98)` with smooth transition
- Subtle inner glow on the card border using `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`

### Empty State
- Larger illustration area with a subtle radial glow behind the icon
- More encouraging copy: "Your dream visualizations will appear here"
- Subtle pulsing animation on the icon

### Detail View (Selected Item)
- Keep the existing full-screen black overlay
- Add the date below the title in the header
- Add a share button alongside the save button
- Slightly larger rounded corners on media (rounded-2xl)

### Loading Skeletons
- Match the masonry layout pattern (1 large + 2 small pairs)
- Add subtle shimmer/pulse animation

## Technical Approach
- Single file edit: `src/components/profile/DreamGalleryDialog.tsx`
- Use framer-motion `motion.div` with staggerChildren for card entrance animations
- Add `format(date)` from `date-fns` for date display
- Use `Share2` icon from lucide-react for share action
- Query already fetches all needed data (title, imageUrl, videoUrl, date)

