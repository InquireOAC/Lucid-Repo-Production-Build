

## Plan: Prioritize Videos Over Images in Share Media Collection

### Change

Update `collectDreamMedia()` in `src/utils/shareVideoRenderer.ts` so that when a video exists for a given slot (hero or section), it replaces the image rather than both being added.

**Current behavior**: Hero image + hero video + section image + section video all added sequentially → duplicates each scene.

**New behavior**: For each slot (hero, each section), if a video exists use that; otherwise fall back to the image. This means a dream with hero video + section 1 video + section 2 image-only produces exactly 3 items: video, video, image.

### File: `src/utils/shareVideoRenderer.ts` (lines 158-178)

Replace the collection logic:
```typescript
// Hero: prefer video over image
if (dream.video_url) {
  items.push({ type: 'video', url: dream.video_url });
} else {
  const heroImage = dream.image_url || dream.generatedImage;
  if (heroImage) items.push({ type: 'image', url: heroImage });
}

// Sections: prefer video over image per section
if (dream.section_images) {
  for (const section of dream.section_images) {
    if (section.video_url) {
      items.push({ type: 'video', url: section.video_url });
    } else if (section.image_url) {
      items.push({ type: 'image', url: section.image_url });
    }
  }
}
```

One file, ~10 lines changed.

