

# Dream Book Feature Plan

## Overview
A new premium page at `/dream-book` where users view their dream journal as an interactive book with two modes: a CSS-based 3D book with page-flip animations, and a clean reading view. Includes filtering/curation and polished PDF export built on the existing jsPDF setup.

## Architecture

```text
src/
├── pages/DreamBook.tsx              (main page, mode toggle, filter state)
├── components/dream-book/
│   ├── DreamBook3DViewer.tsx         (CSS 3D book with flip animations)
│   ├── DreamBookReader.tsx           (flat reading view)
│   ├── DreamBookCover.tsx            (cover/title page rendering)
│   ├── DreamBookPageSpread.tsx       (single dream spread: image + text)
│   ├── DreamBookControls.tsx         (prev/next, page indicator)
│   ├── DreamBookFilterPanel.tsx      (filter drawer: all/lucid/favorites/date/manual)
│   ├── DreamBookExportModal.tsx      (export dialog with progress)
│   ├── DreamBookEmptyState.tsx       (beautiful empty state)
│   └── DreamBookTableOfContents.tsx  (optional TOC page)
├── utils/exportDreamBookPdf.ts       (enhanced PDF generation, reuses existing patterns)
```

## Key Decisions

- **3D Book**: Built with pure CSS `perspective` + `transform-style: preserve-3d` + framer-motion for page flips. No Three.js dependency in v1 — keeps bundle small and mobile-friendly. Architecture is modular so `DreamBook3DViewer` can be swapped to a react-three-fiber version later.
- **PDF Export**: Extends the existing `exportDreamJournalPdf.ts` pattern (jsPDF, landscape A4 spreads) but with enhanced chapter layouts, TOC, and end page. Called from structured data, not screenshots.
- **Data Source**: Uses `useJournalEntries` hook to fetch user dreams from Supabase, then filters client-side.

## Implementation Steps

### 1. Create `DreamBook` page + route
- New page at `src/pages/DreamBook.tsx`
- Add route `/dream-book` inside MainLayout in `App.tsx`
- State: `viewMode` (book/reader), `filteredDreams`, `currentPage`, filter state
- Entry point from Profile settings or Journal header

### 2. Filter Panel (`DreamBookFilterPanel.tsx`)
- Drawer/sheet with filter options:
  - All dreams (default)
  - Lucid only (`lucid === true`)
  - Date range (two date pickers)
  - Manual selection (checkboxes per dream)
- Outputs filtered + sorted `DreamEntry[]` to parent

### 3. 3D Book Viewer (`DreamBook3DViewer.tsx`)
- CSS 3D perspective container with book spine
- Pages as absolutely-positioned divs with `backface-visibility: hidden`
- Framer-motion `rotateY` animations for page flips (0 → -180deg)
- Each "spread" = left page (image or placeholder) + right page (text content)
- Cover page as first spread, TOC as second, then dream entries
- Subtle shadow/glow effects using existing aurora CSS vars
- Touch swipe support via framer-motion drag gestures

### 4. Reading View (`DreamBookReader.tsx`)
- Clean scrollable layout, one dream per section
- Uses existing glass-card aesthetic
- Dream image (full width), title, date, mood/tags, content, analysis
- Sticky navigation between entries
- Mobile-optimized with generous spacing

### 5. Page Components
- **`DreamBookCover.tsx`**: Renders cover with user's display name, dream count, date range, decorative elements matching cosmic theme
- **`DreamBookPageSpread.tsx`**: Single dream rendered as a book spread (image left, text right in 3D view; stacked in reader view)
- **`DreamBookTableOfContents.tsx`**: List of dream titles with page numbers
- **`DreamBookControls.tsx`**: Prev/next buttons, page indicator, view mode toggle

### 6. Export (`DreamBookExportModal.tsx` + `exportDreamBookPdf.ts`)
- Dialog with "Generating..." progress bar
- Enhanced PDF based on existing `exportDreamJournalPdf.ts`:
  - Cover page, title page, TOC, dream spreads, end page
  - Elegant typography (Playfair Display for titles, already imported)
  - Full-page image sections when image exists
  - Chapter-style layout with generous margins
- Uses `jsPDF` (already installed) + `loadImageAsBase64` pattern from existing code

### 7. Empty State (`DreamBookEmptyState.tsx`)
- Shown when user has no dreams or no dreams match filters
- Cosmic-themed illustration placeholder
- CTA: "Your dreams deserve to be kept like stories."
- Button navigating to `/journal/new`

### 8. Styling
- Cosmic theme using existing CSS variables (`--aurora-purple`, `--cosmic-black`, etc.)
- Glass-card backgrounds for controls
- Playfair Display for book typography (already imported in index.css)
- Subtle particle/glow effects via CSS gradients
- No toasts — all feedback via UI transitions and loading states

## Component Flow

```text
DreamBook (page)
├── DreamBookFilterPanel (drawer)
├── DreamBookControls (mode toggle, nav)
├── [viewMode === 'book']
│   └── DreamBook3DViewer
│       ├── DreamBookCover (first spread)
│       ├── DreamBookTableOfContents (second spread)
│       └── DreamBookPageSpread[] (one per dream)
├── [viewMode === 'reader']
│   └── DreamBookReader
│       ├── DreamBookCover (header)
│       └── DreamBookPageSpread[] (scrollable)
├── DreamBookExportModal
└── DreamBookEmptyState (conditional)
```

## Files Changed/Created

| File | Action |
|------|--------|
| `src/pages/DreamBook.tsx` | Create |
| `src/components/dream-book/DreamBook3DViewer.tsx` | Create |
| `src/components/dream-book/DreamBookReader.tsx` | Create |
| `src/components/dream-book/DreamBookCover.tsx` | Create |
| `src/components/dream-book/DreamBookPageSpread.tsx` | Create |
| `src/components/dream-book/DreamBookControls.tsx` | Create |
| `src/components/dream-book/DreamBookFilterPanel.tsx` | Create |
| `src/components/dream-book/DreamBookExportModal.tsx` | Create |
| `src/components/dream-book/DreamBookEmptyState.tsx` | Create |
| `src/components/dream-book/DreamBookTableOfContents.tsx` | Create |
| `src/utils/exportDreamBookPdf.ts` | Create |
| `src/App.tsx` | Add `/dream-book` route |

No database migrations needed — reads existing `dream_entries` table.

