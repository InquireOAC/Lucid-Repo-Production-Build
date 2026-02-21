

# Fix: Share Card Failing to Save on Mobile

## Root Cause

The `html2canvas` call is crashing on mobile due to the complex CSS in the share card (multiple `radial-gradient` background images in the starfield overlay, `box-shadow` with multiple values, etc.). When `html2canvas` throws, the catch block shows "Failed to save share card" -- there is no fallback.

Additionally, the card element inside the dialog may be clipped by `overflow-y: auto` on `DialogContent`, which can cause `html2canvas` to produce incomplete or failed output.

## The Fix

### Changes to `src/utils/shareUtils.ts`

1. Add a **try-catch with fallback**: try `html2canvas` first on mobile, and if it fails, fall back to `toPng` (which may produce degraded images but at least produces *something*)
2. Add detailed error logging so we can see what actually fails

### Changes to `src/components/share/ShareButton.tsx`

1. Before capturing, temporarily set `overflow: visible` on the preview card's parent to prevent clipping by the dialog scroll container
2. After capturing, restore the original overflow
3. Wrap the entire save flow with better error granularity -- separate "capture failed" from "file write failed" from "share failed"

### Summary

| File | Change |
|---|---|
| `src/utils/shareUtils.ts` | Add try/catch fallback: try html2canvas first, fall back to toPng on failure |
| `src/components/share/ShareButton.tsx` | Temporarily unclip dialog overflow before capture; improve error handling |

