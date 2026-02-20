

# Paginated Dream Content and Analysis

## Overview

Add swipeable pagination to the dream text and dream analysis sections so long content is broken into manageable pages instead of showing a massive wall of text.

## Approach

Use Embla Carousel (already installed) to create horizontally swipeable pages for both sections. Text will be split into chunks of ~500 characters (at sentence boundaries) and each chunk becomes a slide. A dot indicator shows the current page.

## Changes to `src/components/dreams/DreamDetailContent.tsx`

### 1. Text chunking utility

Add a helper function `splitTextIntoPages(text: string, maxChars: number)` that:
- Splits text at sentence boundaries (`. `, `! `, `? `, or newlines)
- Groups sentences into pages of ~500 characters each
- Returns an array of strings; if text is short enough (under maxChars), returns a single-element array (no pagination needed)

### 2. Paginated dream content

Replace the plain `<div className="text-sm whitespace-pre-wrap">{content}</div>` with:
- If content fits in 1 page: render as-is (no change)
- If content needs multiple pages: render an Embla Carousel with each page as a slide, capped at a fixed height (~200px) with a dot indicator row below showing current page and total

### 3. Paginated dream analysis

Same treatment for the analysis section:
- If analysis fits in 1 page: render as-is inside the existing `bg-muted/40` card
- If multiple pages: render a carousel inside the card with dot indicators

### 4. Dot indicator component

A small inline `PaginationDots` component:
- Row of small circles (6px), active dot uses primary color, inactive uses muted
- Shows current slide index
- Uses Embla's `onSelect` callback to track active index

## Layout per paginated section

```text
+----------------------------------+
| Dream text page 1 content...    |  <-- swipeable
| (fixed max-height with overflow  |
|  hidden, text truncated to fit)  |
+----------------------------------+
         o  o  *  o               <-- dot indicators
```

## Technical Details

- Import `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselApi` from existing `@/components/ui/carousel`
- Use `CarouselApi` state + `onSelect` to track active slide for dots
- Character threshold for pagination: 500 chars (adjustable)
- Each slide has `max-h-[200px] overflow-hidden` to keep consistent height
- No prev/next arrow buttons -- swipe only (mobile-first)
- The carousel `opts` will include `{ watchDrag: true }` for smooth swiping

## Files Changed

| File | Change |
|------|--------|
| `src/components/dreams/DreamDetailContent.tsx` | Add text chunking, carousel-based pagination for content and analysis sections, dot indicators |

