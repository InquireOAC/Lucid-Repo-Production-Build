

## Fix: Dream Image & Logo Not Rendering in Share Card on iOS

### Problem
The `preloadImageAsDataUrl` function uses `fetch()` with `mode: 'cors'` to convert images to base64. On iOS/mobile Safari (especially in Capacitor webviews), this silently fails for cross-origin Supabase storage URLs. When it fails, it returns `null`, so neither the dream image nor the logo ever renders in the preview or the saved output.

### Root Cause
- `fetch(url, { mode: 'cors' })` is unreliable on iOS for cross-origin image URLs
- The catch block swallows errors and returns `null` silently
- The preview conditionally renders images only when base64 is available, so nothing shows

### Solution
Replace the fetch-based `preloadImageAsDataUrl` with a canvas-based approach that:
1. Creates an `<img>` element with `crossOrigin = "anonymous"`
2. Draws it to a hidden canvas on load
3. Exports as data URL via `canvas.toDataURL()`
4. Falls back to using the original URL directly if canvas export also fails (tainted canvas)

Additionally, update the preview card to show images using the original URL as fallback when base64 conversion fails, so the user always sees their content. The save/capture path will still work because `html2canvas` with `useCORS: true` can handle direct URLs.

### Files Changed

| File | Change |
|------|--------|
| `src/components/share/ShareButton.tsx` | Replace `preloadImageAsDataUrl` with canvas-based converter + direct URL fallback; always show images in preview even without base64 |

### Key Details
- **Canvas-based conversion**: `new Image()` -> `onload` -> `canvas.drawImage()` -> `toDataURL()` bypasses fetch CORS issues
- **Fallback chain**: canvas base64 -> original URL -> null (never leaves user with blank card)
- **Logo**: Also converted via canvas, with same fallback to original path
- **`allImagesReady` loosened**: Allow save even with original URLs since html2canvas handles them
- **No changes to `shareUtils.ts`**: The capture logic is already solid with retries

