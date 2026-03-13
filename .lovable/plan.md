

## Plan: Enable Long-Press to Save Images

The app currently blocks native long-press saving on images by using `pointer-events-none`, `draggable={false}`, and `e.preventDefault()` on context menus. The `DreamImageWithVideo` component has a custom long-press that opens a drawer with "Save Image" — this is good, but other image surfaces lack it entirely.

### Changes

**1. `src/components/dreams/DreamImageWithVideo.tsx`**
- Remove `pointer-events-none` from the `<img>` tag (it's redundant since the parent handles touch events)
- Keep the existing custom long-press → drawer → Save Image flow (it already works and integrates with double-tap-to-like)

**2. `src/pages/DreamStoryPage.tsx`** — Section images
- Add long-press-to-save on section images (the inline story images). Wrap each section image with a touch handler that calls `shareOrSaveImage` on long press, or show a simple action sheet.

**3. `src/components/profile/DreamGalleryDialog.tsx`** — Gallery full-view image
- The selected/expanded image view already has a "Save Image" button, but add long-press support on the full-view image itself for consistency. Also remove the `toast` import (leftover from previous cleanup).

**4. `src/components/repos/DiscoveryDreamCard.tsx`** and `src/components/repos/DiscoveryHero.tsx`**
- These are thumbnail/preview cards — long-press should navigate to dream detail, not save. No change needed here.

### Implementation approach
- Create a small reusable hook `useLongPressSave(imageUrl)` that returns touch handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`, `onContextMenu`) and triggers `shareOrSaveImage` after 500ms hold.
- Apply this hook to section images in DreamStoryPage and the gallery full-view image.
- Keep DreamImageWithVideo's existing drawer-based approach (it has additional actions like Generate Video).

