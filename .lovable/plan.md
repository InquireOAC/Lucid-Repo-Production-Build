

# Fix Horizontal Scrolling on Lucid Repo Page

## Problem
The tag carousel in `LucidRepoHeader` uses `-mx-4 px-4` negative margins to bleed to screen edges, which causes unwanted horizontal scrolling on the page.

## Changes

### 1. `src/components/repos/LucidRepoHeader.tsx`
- Remove the `-mx-4 px-4` from the tag carousel container
- Change tags to wrap instead of scroll horizontally (`flex-wrap` instead of `overflow-x-auto`)
- Remove `scrollbar-hide`, `flex-shrink-0`, `WebkitOverflowScrolling`, and the `useRef` since horizontal scrolling is no longer needed
- Tags will simply wrap to the next line if they don't fit in one row

### 2. `src/pages/LucidRepoContainer.tsx`
- Add `overflow-x-hidden` to the outer container div as a safety net to prevent any horizontal scroll on the page

## Result
- Only vertical scrolling on the Lucid Repo page
- Tags wrap naturally within the container width
- No horizontal overflow from any child elements

