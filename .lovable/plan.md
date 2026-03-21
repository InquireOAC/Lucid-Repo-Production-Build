
## Plan: Full Black-Bar Fix for Share Videos (Preview + Export)

### What’s actually failing
From the screenshot and current code, the issue is not container sizing anymore — it’s video content framing:

1. **Letterbox detection is done on the first loaded frame only** (`onloadeddata` / initial preload frame).  
   If that frame is an intro fade-to-black, detection returns no crop.
2. **Preview currently uses scale-only CSS** (`transform: scale(...)`), which cannot fully correct asymmetric bars and can diverge from export behavior.
3. Export uses crop rects, but because crop detection is weak/early, it can still miss bars.

### Implementation changes

#### 1) `src/utils/shareVideoRenderer.ts` — replace fragile crop detection with robust multi-frame detection
- Replace current synchronous top/bottom-only detection with an **async crop analyzer** that:
  - samples multiple timestamps (e.g. ~15%, ~40%, ~70% of clip),
  - scans **top, bottom, left, right** edges,
  - skips unusable all-dark intro frames,
  - merges valid samples (median) into one stable crop rect.
- Keep safety guards (don’t over-crop, minimum retained frame size).
- Use this crop rect everywhere: renderer drawing and preview transform math.
- Update `renderShareVideo()` preload path to `await` crop analysis for each video before rendering.

#### 2) `src/components/share/ShareButton.tsx` — make preview use full crop transform (not scale-only)
- Precompute and cache crop metadata for each video URL when dialog opens / media list changes.
- Replace current scale-only preview style with **translate + scale** derived from crop rect center, so asymmetric black bars are removed correctly.
- Keep existing layout/design exactly the same (same card, same overlay, same transitions), only media framing behavior changes.

#### 3) (Prevent future bad sources) `supabase/functions/generate-dream-video/index.ts`
- Add a hard framing rule when sending the animation prompt:  
  “**Full-frame vertical composition, no letterbox, no cinematic black bars**.”
- This reduces future videos arriving with baked-in bars while frontend fix handles existing videos.

### QA plan (must pass)
1. Re-test with the same problematic dream from screenshot on mobile viewport.
2. Verify **modal preview** has no top/bottom black strips on video segments.
3. Save/export share video and confirm output also has no black bars.
4. Validate mixed media sequence still works (video/video/image), transitions unchanged.
5. Confirm image-only share card path is unaffected.

### Files to modify
1. `src/utils/shareVideoRenderer.ts`
2. `src/components/share/ShareButton.tsx`
3. `supabase/functions/generate-dream-video/index.ts`
