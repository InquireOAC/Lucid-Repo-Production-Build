

# Fix: Long-Press Image Save Not Triggering

## Root Causes

1. **iOS native context menu intercepts touch** — On iOS Safari, long-pressing an `<img>` triggers the native "Save Image / Copy" popup before the custom 500ms timer fires. Fix: add `-webkit-touch-callout: none` and `-webkit-user-select: none` to image containers.

2. **Drawer z-index buried under Dialog** — `DreamImageWithVideo` renders its action Drawer at `z-50`, same as the parent Dialog overlay. The Drawer gets trapped behind it. Fix: bump Drawer to `z-[60]`.

3. **Story page images have no action drawer** — `HeroImage` and `SectionImage` in `DreamStoryPage` call `shareOrSaveImage` directly (silent download), not the visible action sheet the user expects. Fix: add an action drawer matching `DreamImageWithVideo`'s pattern.

## Changes

### 1. `src/components/dreams/DreamImageWithVideo.tsx`
- Add `WebkitTouchCallout: 'none'` and `WebkitUserSelect: 'none'` to the container's inline style object (suppresses iOS native menu)
- Pass `className="z-[60]"` to `<DrawerContent>` so it renders above any parent Dialog

### 2. `src/components/ui/drawer.tsx`
- Add optional `overlayClassName` prop to `DrawerContent` and pass it to `<DrawerOverlay>` so callers can bump overlay z-index when needed

### 3. `src/pages/DreamStoryPage.tsx`
- Replace `useLongPressSave` on `HeroImage` and `SectionImage` with inline long-press state + a `<Drawer>` action sheet showing "Save Image"
- Add `-webkit-touch-callout: none` style to both image containers
- Import `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` and `Download` icon

### 4. `src/components/profile/DreamGalleryDialog.tsx`
- Add `WebkitTouchCallout: 'none'` and `WebkitUserSelect: 'none'` inline styles to the `GalleryFullView` container

### 5. `src/hooks/useLongPressSave.ts`
- Export a `suppressNativeStyle` constant from the hook for convenience:
  ```ts
  { WebkitTouchCallout: 'none', WebkitUserSelect: 'none' } as React.CSSProperties
  ```

