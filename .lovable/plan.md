

## Plan: Use Technique Images as Detail Page Header Backgrounds

Replace the emoji hero section on `TechniqueDetailPage.tsx` with the corresponding technique card images as a full-width background header.

### Changes to `src/components/insights/TechniqueDetailPage.tsx`

**1. Import technique images** — Import all 6 images from `src/assets/techniques/` and create an index-to-image map (same mapping as `FALLING_ASLEEP_CARDS` in Home.tsx).

**2. Replace emoji hero with image hero** — Replace the current emoji icon block (lines 66-75) with a full-width image container (~200px tall) that uses the technique's image as a background with a gradient overlay. The back button and pin button will be overlaid on top of the image (white text/icons for contrast). For techniques without a mapped image (e.g. MILD at index 1, WBTB at index 2), fall back to the current emoji display.

**3. Move back/pin buttons into the image header** — The navigation bar (lines 47-64) moves inside the image container with absolute positioning so it sits on top of the background image with white icons.

**4. Adjust title/subtitle styling** — Title and subtitle below the image remain as-is but with reduced top margin since the image provides visual weight.

### Image-to-Index Map

```typescript
const TECHNIQUE_IMAGES: Record<number, string> = {
  0: realityChecksImg,
  3: wildImg,
  4: ssildImg,
  5: fildImg,
  6: deildImg,
  7: meditationImg,
};
```

### Technical Detail

| Section | Before | After |
|---------|--------|-------|
| Hero | 120px emoji + sparkle dots | ~220px background image with gradient overlay |
| Back/Pin buttons | Below safe area, dark themed | Overlaid on image, white themed |
| Fallback (no image) | N/A | Shows emoji as before for indices 1, 2 |

Single file change: `src/components/insights/TechniqueDetailPage.tsx`

