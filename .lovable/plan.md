

# Double-Page Spread Book Preview

## Overview
Redesign the export preview to look like an open novel with double-page spreads. Each dream entry will be displayed as two facing pages side by side -- the dream image on the left page, and the story text (title, date, content, analysis) on the right page. The user scrolls vertically through these spreads like flipping through a book.

## Preview Design

### Cover Spread
- Full-width single "cover" styled like a book front cover with a subtle paper/parchment background, centered title, author name, and stats.

### Dream Entry Spreads
Each dream is rendered as a horizontal two-page spread:

```text
+-------------------------+-------------------------+
|                         |  Dream Title             |
|                         |  January 15, 2026 - Calm |
|     [Dream Image]       |  #lucid #flying          |
|     (full bleed,        |                          |
|      covers entire      |  The dream began in a    |
|      left page)         |  vast forest where the   |
|                         |  trees were made of...   |
|                         |                          |
|                         |  --- Analysis ---        |
|                         |  This dream represents...|
|                         |                          |
|         pg 1            |         pg 2             |
+-------------------------+-------------------------+
```

- **Left page**: Dream image filling the page (or a decorative placeholder gradient if no image)
- **Right page**: Title, date/mood/lucid badge, tags, dream description text, and analysis section
- Subtle book spine shadow/divider down the center
- Page numbers at bottom corners
- Paper-like background color with slight shadow to look like a physical book

### Dreams Without Images
- Left page shows a decorative gradient or pattern with the dream title overlaid in large text, creating an artistic chapter-opener feel

## Technical Changes

### `src/components/profile/ExportJournalDialog.tsx`
- Replace the current vertical card list with horizontal double-page spread components
- Each spread is a flex row with two equal-width "pages" side by side
- Left page: `aspect-[3/4]` image container with `object-cover`
- Right page: Scrollable text content with title, metadata, body, and analysis
- Add book-like styling: paper background (`bg-amber-50/5` or similar warm tone), subtle drop shadow around each spread, a thin vertical divider (spine shadow) between pages
- On mobile (narrow screens), stack pages vertically (image on top, text below) since side-by-side won't fit -- but still maintain the "page" aesthetic with borders and paper styling
- Cover page remains full-width as a single centered spread

### `src/utils/exportDreamJournalPdf.ts`
- Update the PDF generation to use landscape A4 format with a two-column layout per page (left = image, right = text) to match the preview's double-page spread concept
- Each dream entry becomes a landscape spread: image on the left half, text content on the right half
- Cover page remains a single portrait page (or landscape centered)
- Adjust margins and content widths for the landscape two-column layout

## Styling Details
- Each spread container: `rounded-lg shadow-xl overflow-hidden border border-border/30`
- Left page: image with slight sepia/warm overlay for a vintage book feel
- Right page: warm off-white background, serif-like styling for text (using `font-serif` class)
- Center spine: `border-r border-border/20` with a subtle gradient shadow
- Page numbers: bottom-left on left page, bottom-right on right page
- Vertical spacing between spreads to simulate page gaps

