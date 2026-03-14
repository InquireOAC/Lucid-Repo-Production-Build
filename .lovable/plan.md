

# Fix: Always Show "Generate Video" in Image Actions

## Problem
Both `HeroImage` and `SectionImage` drawers conditionally hide "Generate Video" when `videoUrl` already exists (`&& !videoUrl` on lines 590, 599, 766, 775). After regenerating a scene image, the old `videoUrl` may still be set, so the option disappears.

## Changes

### `src/pages/DreamStoryPage.tsx`
- **HeroImage drawer** (lines 590, 599): Remove `&& !videoUrl` from both the "Generate Video" and "Generate Video (Subscribe)" conditions.
- **SectionImage drawer** (lines 766, 775): Same — remove `&& !videoUrl` from both conditions.

This makes "Generate Video" always available for owners regardless of whether a video already exists, allowing them to regenerate videos after regenerating images.

4 line changes total across 2 components in 1 file.

