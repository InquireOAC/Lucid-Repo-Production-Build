
## Fix Avatar Highlight and Improve Long-Press for Video Generation

### Issue 1: Avatar and Name Getting Highlighted on Tap

The avatar/username button in the DreamDetail modal (lines 160-176 of `DreamDetail.tsx`) is a `<button>` element that naturally receives focus styling and tap highlight on iOS. When you tap to open a dream, the focus state transfers to this element.

**Fix:**
- Add `-webkit-tap-highlight-color: transparent` and `outline: none` / `focus:outline-none` to the avatar button in `DreamDetail.tsx` (line 161)
- Add `select-none` class to prevent text selection on the username span

### Issue 2: Long-Press Glitchy on iPhone for Video Generation

The current implementation uses Radix `ContextMenu` (right-click menu) in `DreamImageWithVideo.tsx`. On iOS, this conflicts with the native long-press behavior (image preview, copy, share sheet), causing a glitchy experience. The browser's native context menu fights with Radix's custom one.

**Fix:**
- Replace the Radix `ContextMenu` with a custom long-press handler using `onTouchStart`/`onTouchEnd` timers (e.g., 500ms threshold)
- On long-press detection, show a custom bottom sheet/action menu (using the existing `Drawer` or a simple popover) instead of the native context menu
- Add `touch-action: none` on the image container during the press to prevent iOS from intercepting
- Add a subtle scale animation (e.g., scale down to 0.97) during the press to give haptic-like visual feedback, making it feel intentional and smooth
- Cancel the long-press if the user moves their finger (touch move threshold)

### Files to Modify

1. **`src/components/DreamDetail.tsx`** -- Add tap highlight suppression and focus outline removal to the avatar button
2. **`src/components/dreams/DreamImageWithVideo.tsx`** -- Replace Radix ContextMenu with a custom touch-friendly long-press handler that shows a bottom drawer with the action options (Generate Video, Save Image)

### Technical Details

**DreamDetail.tsx (avatar button fix):**
```tsx
<button
  onClick={...}
  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit focus:outline-none select-none"
  style={{ WebkitTapHighlightColor: 'transparent' }}
>
```

**DreamImageWithVideo.tsx (long-press rewrite):**
- Use `useRef` for a timer and touch start position
- `onTouchStart`: record position, start 500ms timer that triggers menu open
- `onTouchMove`: if moved > 10px, cancel timer
- `onTouchEnd`: cancel timer
- Show a `Drawer` (vaul) from the bottom with the menu items instead of ContextMenu
- Add a press-and-hold visual: scale the image to 0.97 during the hold, reset on release
- Keep the desktop right-click ContextMenu as a fallback for non-touch devices
