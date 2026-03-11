

## Fix Plan: 4 Issues

### Issue 1: Masonry grid cards unresponsive when filter is active

**Root cause**: The `MasonryDreamCard` uses `motion.div` with entry animations (`initial={{ opacity: 0, y: 20, scale: 0.97 }}`). When the filter changes and dreams re-render, Framer Motion re-triggers entry animations which can interfere with pointer events during the animation. Additionally, the `categoryDreams` memo recalculates on every filter change, creating new dream objects that cause full re-mounts.

**Fix**: In `MasonryDreamGrid.tsx`, remove the `motion.div` wrapper (or use `layout` animation only) so click handlers are never blocked by animation state. Replace with a simple `div` with CSS transition for fade-in.

### Issue 2: Text over dream cards glitching on scroll

**Root cause**: The `MasonryDreamCard` and `DiscoveryDreamCard` use `motion.div` with `initial/animate` props. When these cards scroll in and out of view or get re-rendered during scroll, the animation state causes visual glitches (flickering text).

**Fix**: Replace `motion.div` in `MasonryDreamCard` with a plain `div` using CSS `animation` for the initial fade-in (via a class). This eliminates JS-driven re-renders during scroll.

### Issue 3: Section image generation ignores avatar/character selection

**Root cause**: `useSectionImageGeneration.ts` calls `compose-cinematic-prompt` and `generate-dream-image` directly without passing `referenceImageUrl`, `outfitImageUrl`, or `accessoryImageUrl`. The main image generator (`useImageGeneration.ts`) fetches character data and passes it, but the section generator does not.

**Fix**: 
- Update `useSectionImageGeneration` to accept optional character data (selected character ID or AI context).
- When generating each section image, fetch the character data (same logic as `useImageGeneration.ts`) and pass `referenceImageUrl`, `outfitImageUrl`, `accessoryImageUrl` to `generate-dream-image`.
- In `DreamStoryPage.tsx`, look up the dream's existing character association or the user's default AI context and pass it to `useSectionImageGeneration`.

### Issue 4: Images composed horizontally despite 9:16 directive

**Root cause**: The `generate-dream-image` edge function already has a 9:16 directive in the system prompt, but some images still render horizontally. This is likely because:
1. The directive is embedded in a very long text block and can get deprioritized by the model
2. No explicit `responseModalities` or aspect ratio parameters are passed

**Fix**: 
- Strengthen the 9:16 enforcement in `generate-dream-image/index.ts` by adding the aspect ratio instruction as a separate final content part (repetition helps model compliance)
- Add the instruction at the END of all content parts (recency bias in attention)

### Files to modify:
1. `src/components/repos/MasonryDreamGrid.tsx` — Remove framer-motion, use CSS animation, fix click responsiveness
2. `src/hooks/useSectionImageGeneration.ts` — Accept character data, pass reference images to edge function
3. `src/pages/DreamStoryPage.tsx` — Pass character/avatar data to section image generation
4. `supabase/functions/generate-dream-image/index.ts` — Reinforce 9:16 aspect ratio at end of prompt

