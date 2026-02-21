

# Fix: Share Card Images Still Missing on Mobile

## Root Cause (the real one this time)

The `html-to-image` library's `toPng()` is called with `cacheBust: true`. This option appends a `?timestamp` query parameter to **every** image URL in the cloned DOM -- including the base64 data URLs we carefully preloaded. Appending query params to a `data:image/png;base64,...` string corrupts it, causing images to fail to load during the canvas render.

Additionally, `backdropFilter: 'blur(10px)'` on the dream content box is not reliably supported by canvas-based rendering on mobile WebKit.

## The Fix

### 1. `src/utils/shareUtils.ts` -- Disable `cacheBust`

Change `cacheBust: true` to `cacheBust: false` in the `toPng()` call. Since all images are already inline base64 data URLs, there is nothing to cache-bust. This single change is likely the primary fix.

Also remove `backdropFilter` workaround: add a `filter` option to `toPng()` that skips problematic nodes if needed.

### 2. `src/components/share/ShareButton.tsx` -- Remove `backdropFilter`

Remove the `backdropFilter: 'blur(10px)'` CSS from the dream content box. This property is not reliably rendered by `html-to-image` on mobile and can cause blank areas. The `background: rgba(...)` already provides the visual effect.

### 3. `src/components/share/ShareButton.tsx` -- Increase settle delay

Increase the settle delay from 300ms to 500ms before capturing, to give mobile browsers more time to paint base64 images.

## Summary of Changes

| File | Change |
|---|---|
| `src/utils/shareUtils.ts` | Set `cacheBust: false` in `toPng()` options |
| `src/components/share/ShareButton.tsx` | Remove `backdropFilter` from content box; increase settle delay to 500ms |

