

## Fix: Replace DOM Screenshot with Direct Canvas Rendering

### Why It Keeps Failing

The current approach uses `html2canvas` / `html-to-image` to screenshot a DOM element. On iOS WebKit (especially in Capacitor), this is fundamentally broken for cross-origin images:

1. `html2canvas` clones the DOM and re-renders it — cross-origin images get blocked or produce blank canvases
2. Even pre-converting to base64 via canvas fails because iOS taints the canvas for Supabase storage URLs
3. `html-to-image` uses SVG `foreignObject` which has size limits on mobile Safari

No amount of retries, delays, or CORS headers fixes this reliably. It's a WebKit platform limitation.

### The Fix: Draw Directly on Canvas

Instead of rendering HTML and screenshotting it, **compose the share card image entirely using the Canvas 2D API**:

1. Create a 1080x1920 canvas
2. Load the dream image via `new Image()` and `drawImage()` it as the background
3. Draw gradient overlays using `createLinearGradient()`
4. Draw text (title, date, excerpt, label) using `fillText()` with proper fonts
5. Load and draw the logo image
6. Export via `canvas.toDataURL('image/png')`

This completely bypasses `html2canvas`, `html-to-image`, and all DOM-to-image conversion. Canvas `drawImage()` with loaded `Image` objects works reliably on iOS even for cross-origin images loaded into memory.

### Files Changed

| File | Change |
|------|--------|
| `src/components/share/ShareButton.tsx` | Replace the preview-card DOM capture approach with a `renderShareCardToCanvas()` function that draws everything programmatically on a canvas. The preview dialog still shows the DOM-based preview (for visual feedback), but the Save button calls the canvas renderer directly. |

### How It Works

```text
User clicks Share
  → Dialog opens with DOM-based preview (visual only)
  → Images preloaded into Image objects

User clicks Save
  → Create offscreen 1080x1920 canvas
  → drawImage(dreamImage, ...) as full-bleed background
  → Draw gradient overlay with createLinearGradient
  → fillText() for title, date, excerpt, label
  → drawImage(logoImage, ...) for branding
  → canvas.toDataURL('image/png')
  → Save/share via Capacitor or download
```

### Key Details

- The DOM preview card stays as-is for user feedback — it doesn't need to be pixel-perfect since it's just a preview
- The actual saved image is rendered entirely via Canvas 2D, which is reliable across all platforms
- Image loading uses `img.onload` promises with error fallbacks
- If dream image fails to load (CORS), the canvas draws the cosmic gradient fallback instead
- Text wrapping for the excerpt is handled manually with `measureText()` and line splitting
- No dependency on `html2canvas` or `html-to-image` for this flow

