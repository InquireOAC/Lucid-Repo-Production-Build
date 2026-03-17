

# Incorporate Scene Images and Videos into Dream Book

## Overview
Extend the Dream Book so each dream with scenes becomes a multi-page illustrated story. Scene images get their own page spreads (image left, scene text right), and videos (both hero and scene-level) auto-play inline as muted looping elements.

## Data Changes

### `useJournalEntries.tsx`
- Add `section_images` to the field mapping (currently omitted)
- Add `section_images` to the `DreamEntry` type

### `types/dream.ts`
- Add `section_images?: Array<{ section: number; text: string; image_url?: string; prompt?: string; video_url?: string }>` to `DreamEntry`

## Book Structure Changes

### Current: 1 page per dream
```text
Cover → TOC → [Dream1: image|text] → [Dream2: image|text] → ...
```

### New: Multiple pages per dream (story format)
```text
Cover → TOC → [Dream1 Title Page] → [Scene1: image|text] → [Scene2: image|text] → ... → [Dream2 Title Page] → ...
```

For dreams **without** scenes: keep the current single spread (hero image + full content).

For dreams **with** scenes: render a title/intro page, then one spread per scene (scene image left, scene text right). The hero image and video appear on the title page.

## Component Changes

### `DreamBook3DViewer.tsx`
- Update page generation logic: for each dream, if `section_images` has entries, emit a title page + one page per scene instead of a single spread
- Update total page count accordingly

### `DreamBookPageSpread.tsx`
- Add a new rendering path for scene spreads: accepts an optional `scene` prop with `{ text, image_url, video_url }`
- When `video_url` is present, render `<video autoPlay muted loop playsInline>` instead of `<img>` (both in book and reader modes)
- Apply same treatment to the hero `video_url` on the main dream spread

### `DreamBookReader.tsx`
- For dreams with scenes, render each scene as a separate visual section within the dream article
- Videos auto-play inline (muted, looping)

### `DreamBookTableOfContents.tsx`
- Show scene count per dream entry (e.g., "3 scenes")

### `exportDreamBookPdf.ts`
- For dreams with scenes, generate one PDF page per scene spread
- Videos are represented by their poster frame (the `image_url` from the scene) since PDF can't play video

## Files Changed

| File | Change |
|------|--------|
| `src/types/dream.ts` | Add `section_images` field |
| `src/hooks/useJournalEntries.tsx` | Map `section_images` from DB |
| `src/components/dream-book/DreamBook3DViewer.tsx` | Multi-page scene expansion |
| `src/components/dream-book/DreamBookPageSpread.tsx` | Scene spread + video autoplay |
| `src/components/dream-book/DreamBookReader.tsx` | Scene sections + video autoplay |
| `src/components/dream-book/DreamBookTableOfContents.tsx` | Scene count display |
| `src/utils/exportDreamBookPdf.ts` | Multi-scene PDF pages |
| `src/pages/DreamBook.tsx` | Update totalPages calculation |

