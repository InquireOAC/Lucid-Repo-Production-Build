

# Fix PDF Preview - Render Pages as Images

## Problem
The `iframe`-based PDF preview doesn't work in sandboxed environments (Lovable preview, many mobile browsers). The iframe just shows a broken file icon instead of rendering the PDF content.

## Solution
Instead of embedding the PDF in an iframe, convert each page of the generated PDF to a JPEG image using jsPDF's internal rendering and an HTML canvas, then display the images in a scrollable container. This works universally across all browsers and environments.

## Technical Changes

### 1. `src/utils/exportDreamJournalPdf.ts`
- Change the export function to return **both** the PDF blob and an array of page image data URLs (base64 JPEG strings).
- After building the PDF, loop through each page using `doc.setPage(p)` and `doc.output("datauristring")` -- but since jsPDF doesn't have a per-page-to-image API, we'll use `doc.output("arraybuffer")` for the blob and separately generate page preview images using an offscreen canvas approach with jsPDF's internal canvas mode.
- Alternatively (simpler): use `doc.output("datauristring")` and let the dialog render page images. However, the most reliable approach is to generate page snapshots during PDF creation.
- **Chosen approach**: Modify the function signature to return `{ blob: Blob, pageImages: string[] }`. For each page, after rendering its content, capture a snapshot using jsPDF's `internal.getCanvas()` or by converting each page to a data URL. Since jsPDF doesn't natively support per-page canvas export, we'll instead render a simplified preview using the dream entry data directly in the dialog component (showing dream title, image, description as styled cards).

**Revised simpler approach**: Keep the PDF generation as-is (returns a Blob). In the dialog, instead of an iframe, render a card-based preview of the dream entries directly in React, showing what will be in the PDF. This is more reliable and provides a better mobile UX than trying to render actual PDF pages.

### 2. `src/components/profile/ExportJournalDialog.tsx`
- Remove the `iframe` approach entirely.
- Remove `pdfUrl` / `useMemo` / `useEffect` for object URL cleanup.
- After PDF generation succeeds, show a scrollable preview of dream entry cards (styled to look like book pages) instead of the iframe:
  - Cover card: "Dream Journal" title, author name, dream count, date range
  - Dream entry cards: title, date, mood, image thumbnail, truncated content, analysis indicator
- Keep the Download, Share, and Regenerate buttons pinned at the bottom.
- The preview acts as a visual confirmation of what's in the PDF before downloading.

This approach is:
- Universally compatible (no iframe/PDF viewer dependency)
- Better UX on mobile (native scrolling, not a PDF viewer in an iframe)
- Lightweight (no additional dependencies needed)

