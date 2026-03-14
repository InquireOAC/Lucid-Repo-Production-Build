

# Show Full Dream Image (No Crop)

The `ImageDisplay` component and `DreamImageGenerator` both use `aspect-[4/3] object-cover`, which crops images (especially 9:16 AI-generated ones). Change to `object-contain` with auto aspect ratio so the full image is visible.

## Changes

### 1. `src/components/dreams/ImageDisplay.tsx`
- Image: Replace `aspect-[4/3] object-cover` with `w-full rounded-2xl` and `object-contain` — no forced aspect ratio
- Empty state placeholder: Keep `aspect-[4/3]` since there's no image to display

### 2. `src/components/DreamImageGenerator.tsx`
- Empty state area and video `aspect-[4/3]` containers: Change to auto-sizing
- Video element: Switch from `object-cover` to `object-contain`
- Carousel image/video slides: Remove fixed aspect ratio cropping

