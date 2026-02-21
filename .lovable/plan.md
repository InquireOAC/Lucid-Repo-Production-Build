

# Fix: Share Card Images Missing on Mobile

## Root Cause

The share card preview contains two images — the dream visualization and the footer logo. When `html-to-image` captures the card, it tries to re-fetch every `<img>` from its `src` URL. On desktop browsers this works, but on mobile (especially iOS WebView / Capacitor) it fails due to:

1. **CORS restrictions** on cross-origin Supabase storage URLs
2. **Relative path resolution** — the logo at `/lovable-uploads/...` may not resolve inside `html-to-image`'s internal fetch on native platforms
3. **Timing** — the current `preloadImageAsDataUrl` runs only at save-time, but `html-to-image` may still use stale `src` attributes or race against the DOM update

## The Fix

Convert all images to **base64 data URLs eagerly** when the share dialog opens, not at save time. This way every `<img src>` is already an inline `data:image/...` string and `html-to-image` never needs to fetch anything externally.

### Changes to `src/components/share/ShareButton.tsx`

1. **Add state for base64 versions** of both the dream image and the logo
2. **On dialog open** (`handleShareClick`), fetch both images as data URLs using the existing `preloadImageAsDataUrl` helper, and store them in state
3. **Render the preview card** using these base64 data URLs instead of the original URLs
4. **Remove the save-time image conversion loop** in `handleSaveCard` (it becomes unnecessary since images are already inline)
5. **Add a loading state** so the Save button stays disabled until both images are converted to base64

### Technical Detail

```text
Dialog Opens
  |
  +-- fetch dream image as data URL --> store in state
  +-- fetch logo as data URL ----------> store in state
  |
  v
Preview renders with data: URLs in <img src>
  |
  v
Save button enabled (allImagesReady)
  |
  v
html-to-image captures card (no external fetches needed)
```

For the logo specifically, we will resolve it to an absolute URL using `window.location.origin` before fetching, to ensure it works on native platforms where relative paths may not resolve.

### Files Changed

| File | Change |
|---|---|
| `src/components/share/ShareButton.tsx` | Add eager base64 preloading on dialog open; render with data URLs; remove save-time conversion loop |

No other files need changes.

