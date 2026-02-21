

# Fix: Use html2canvas on Mobile Instead of html-to-image

## Root Cause

`html-to-image` (the `toPng` function) works by embedding the DOM inside an SVG `foreignObject`, then drawing that SVG to a canvas. Mobile Safari has strict size limits on data URLs within SVG foreignObject -- a base64-encoded dream image (often 1-2MB) silently fails to render. The purple gradient you see is actually a **fallback background** that `shareUtils.ts` explicitly sets on image containers (lines 22-28).

The preview looks correct because the browser renders the base64 `<img>` tags normally. The problem only occurs during the `toPng` capture step.

## The Fix

Switch to `html2canvas` for the capture step on mobile. `html2canvas` is already installed in the project and uses a fundamentally different approach -- it parses CSS and draws directly to canvas element-by-element, bypassing the SVG foreignObject limitation entirely.

### Changes to `src/utils/shareUtils.ts`

1. Import `html2canvas` alongside `toPng`
2. Detect mobile via user agent (already done)
3. On mobile: use `html2canvas` to capture the element
4. On desktop: keep using `toPng` (it produces higher quality output)
5. Remove the fallback gradient background code (lines 22-28) that overwrites image containers -- this was actively making images disappear

### Summary

| File | Change |
|---|---|
| `src/utils/shareUtils.ts` | Use `html2canvas` on mobile, keep `toPng` on desktop, remove gradient fallback code |

No other files need changes. The base64 preloading in `ShareButton.tsx` remains as-is and will benefit `html2canvas` too (no cross-origin fetches needed).

