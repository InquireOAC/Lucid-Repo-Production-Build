

## Fix Edit Dream Modal: Side Scroll and Image/Video Carousel UX

### Problems Identified
1. **Horizontal side-scroll on the Edit Dream modal** -- The Embla carousel inside `DreamImageGenerator` causes overflow. The carousel's default CSS uses flex containers that can exceed the modal's width.
2. **Extra empty space below the dream image** when there's no video -- The `ImageDisplay` component renders a fixed `h-64` container, and the carousel wrapper adds unnecessary padding/spacing.
3. **Poor image/video carousel experience** -- Buttons (Save, Delete, Regenerate) are crammed under each slide, and the overall layout feels cluttered.

### Plan

#### 1. Fix horizontal overflow in DreamImageGenerator (`src/components/DreamImageGenerator.tsx`)
- Wrap the carousel section in `overflow-hidden` to prevent side-scroll leaking into the modal.
- Add `overflow-hidden` to the main container div.

#### 2. Clean up ImageDisplay (`src/components/dreams/ImageDisplay.tsx`)
- Remove the fixed `h-64` height constraint -- use `aspect-square` or natural image sizing with `object-cover` and a max-height instead, so there's no dead space below the image.
- Make the image fill its container cleanly with rounded corners and no excess padding.

#### 3. Redesign the image/video carousel area in DreamImageGenerator
- When there's **no video**: Show the image cleanly with no carousel wrapper at all (already the case, but tighten spacing).
- When there **is a video**: Use the carousel but with proper `overflow-hidden` on each slide, consistent aspect ratios between image and video slides, and action buttons overlaid or in a compact row.
- Move the Save/Download button to overlay the bottom-right of the image (like the screenshot shows it should be) rather than a separate row below.
- For the video slide: Keep Delete and Regenerate buttons in a clean compact row.
- Ensure both slides use the same aspect ratio container so swiping doesn't cause layout shifts.

#### 4. Fix the style thumbnails horizontal scroll
- The style selector row at line 348 uses `-mx-1 px-1` which can contribute to horizontal overflow in the modal. Constrain this within the modal boundaries.

### Technical Details

**Files to modify:**
- `src/components/DreamImageGenerator.tsx` -- Add `overflow-hidden` to root, redesign carousel slides with consistent aspect ratio containers, overlay Save button on image
- `src/components/dreams/ImageDisplay.tsx` -- Replace fixed `h-64` with responsive aspect-ratio sizing, remove the empty-state dashed box height constraint
- `src/components/journal/EditDreamDialog.tsx` -- Ensure `overflow-x-hidden` propagates correctly (already has it, but verify no inner elements break out)

