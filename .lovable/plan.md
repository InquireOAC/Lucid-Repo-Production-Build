

# Fix Video Title Page — Remove Cropping, Black Bars & Extra Border

## Problems
1. **`object-contain` + `bg-background`** causes visible black bars around the video since the container aspect doesn't match the video's natural aspect
2. **Extra wrapper div** with `rounded-2xl`, `boxShadow`, and `w-[85%]` creates a visible border/container around the media
3. **Reader mode** has the same issue with `aspect-[9/16]` + `object-contain bg-background`

## Fix — Both Book & Reader Mode Title Pages

Replace the constrained container approach with **edge-to-edge `object-cover`** media that fills the available space naturally, with text overlaid at the bottom via gradient.

### Book Mode Title Page (lines 200-266)
- Remove the `w-[85%] rounded-2xl` wrapper with its box-shadow — make media fill the entire page with `absolute inset-0`
- Switch from `object-contain bg-background` to `object-cover` — no black bars, no background color showing through
- Remove the separate text section below; instead overlay title/metadata at the bottom using `absolute bottom-0` with a `bg-gradient-to-t from-black/80 via-black/40 to-transparent` for legibility
- Keep the ornamental divider, tags, lucid badge etc. inside the overlay

### Reader Mode Title Page (lines 74-131)
- Remove the `mx-4 mt-4 rounded-2xl` wrapper and its box-shadow
- Remove the inner `aspect-[9/16]` div — let the media use `aspect-[9/16] w-full` directly with `object-cover`, no `bg-background`
- Remove extra border/container styling from the article wrapper
- Keep text below the media (not overlaid) since reader mode scrolls vertically

### MediaElement default
- Keep default class as `object-cover` (already is for non-overridden cases)

## Files Changed

| File | Change |
|------|--------|
| `src/components/dream-book/DreamBookPageSpread.tsx` | Fix both book-mode and reader-mode title pages to use edge-to-edge object-cover media, remove extra containers/borders |

