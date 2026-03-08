

## Fix: Remove Scrollbar Gap on App

The empty space on the right side is caused by the 6px-wide custom scrollbar defined in `src/index.css`. On mobile and in the preview, this creates an awkward gap.

### Solution

**`src/index.css`** — Set the main scrollbar width to 0 and use `overlay` scrollbar behavior so it doesn't consume layout space:

- Change `::-webkit-scrollbar` width from `6px` to `0px` for the global scrollbar
- Set `scrollbar-width: none` globally instead of `thin`
- Alternatively, apply `overflow-y: overlay` on the main content div (deprecated but widely supported), or simply hide the scrollbar globally since this is a mobile app where users scroll by touch

**`src/layouts/MainLayout.tsx`** — Add `scrollbar-none` class to the main content div to ensure no scrollbar gap.

### Files Changed
| File | Change |
|------|--------|
| `src/layouts/MainLayout.tsx` | Add `scrollbar-none` to main content area |

This is the simplest fix — one class addition. The `scrollbar-none` utility already exists in the CSS.

