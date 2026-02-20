

## Fix Share Card Image Loading

### Problem
When tapping "Save" on the share card, the dream image hasn't finished loading in the DOM yet, so `html-to-image` captures the card without it. Tapping Save a second time works because the image has loaded by then.

**Root causes:**
1. The dialog opens and the preview card renders, but the `<img>` inside it starts loading only at that point
2. `handleSaveCard` uses `waitForImageLoad()` which creates a **separate** `new Image()` object -- this preloads the image in memory but doesn't guarantee the actual DOM `<img>` element has rendered
3. The 500ms delay after preload is unreliable
4. The Save button is never disabled while images are still loading

### Solution

**In `ShareButton.tsx`:**

1. **Track actual DOM image load** -- Use the `onLoad` callback already on the preview `<img>` to set `imageLoaded = true`, and reset it to `false` when the dialog opens
2. **Disable the Save button** until all images (dream image + logo) have loaded in the DOM
3. **Replace `waitForImageLoad`** with a proper poll/promise that waits for the actual DOM images inside `previewCardRef` to report `complete === true`
4. **Add a loading indicator** on the Save button while images are loading

**In `shareUtils.ts` (`elementToPngBase64`):**

5. **Replace the blind 2-second timeout** with a proper check that all `<img>` elements inside the target element have `complete === true` and `naturalWidth > 0`, with a timeout fallback (max 5 seconds)

### Files to Change

| File | Changes |
|------|---------|
| `src/components/share/ShareButton.tsx` | Reset `imageLoaded` on dialog open; disable Save until loaded; replace `waitForImageLoad` with DOM-based image readiness check; show loading state on button |
| `src/utils/shareUtils.ts` | Replace blind `setTimeout(2000)` in `elementToPngBase64` with a proper image-complete polling loop (checks every 100ms, max 5s) |

### Technical Detail

The new image-ready check in `elementToPngBase64`:
```text
- Query all <img> elements in the target element
- For each, check img.complete && img.naturalWidth > 0
- If not all ready, wait 100ms and re-check
- Timeout after 5 seconds and proceed anyway (graceful degradation)
```

The Save button state:
```text
- When dialog opens: imageLoaded = false
- <img onLoad> sets imageLoaded = true
- Save button: disabled={isSaving || (!imageLoaded && !!normalizedDream.generatedImage)}
- Button label shows "Loading image..." while waiting
```

