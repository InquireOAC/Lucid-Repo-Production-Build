

# Explore Meditation Videos + Featured Dream Carousel

## 1. Add Guided Meditation & Energy Videos to Explore

**File: `src/data/vaultContent.ts`**
- Add new meditation-category videos to the `vaultVideos` array covering guided meditation and energy control topics (e.g., guided body scan meditations, breathwork/pranayama, chakra/energy work videos from reputable YouTube creators)
- These will automatically appear under the Meditation tab since `VaultTabContent` filters by category

## 2. Featured Dreams Carousel on Lucid Repo

**File: `src/pages/LucidRepoContainer.tsx`**
- Instead of selecting 1 featured dream, select up to 3 dreams with images (prioritizing ones with likes)
- Replace the single `<FeaturedDream>` render with a new `<FeaturedDreamCarousel>` component
- Filter the grid dreams to exclude all 3 featured dreams

**New File: `src/components/repos/FeaturedDreamCarousel.tsx`**
- Horizontal snap-scroll carousel showing one featured dream card at a time
- Uses CSS scroll-snap (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`) for native swipe behavior
- Dot indicators below showing which card is active (tracked via `IntersectionObserver` or scroll position)
- Container uses `overflow-x-auto` with `scrollbar-hide` but constrained within the page width so it doesn't cause page-level horizontal scroll

**File: `src/components/repos/FeaturedDream.tsx`**
- Make the card more compact: reduce image aspect ratio from `16/9` to `2/1`, reduce padding from `p-6` to `p-4`, reduce title from `text-2xl` to `text-lg`, and trim content to 1 line (`line-clamp-1`)
- Remove the `mb-6` margin (carousel container handles spacing)

## Technical Details

**Carousel scroll structure:**
```text
+--[overflow-x-auto, snap-x mandatory]--+
| [card 1 (w-full, snap-start)]         |
|        [card 2]        [card 3]        |
+----------------------------------------+
         [ . o . ]  <-- dot indicators
```

- Each card is `w-full flex-shrink-0` so exactly one shows at a time
- Dots update on scroll via a scroll event listener
- No horizontal page scroll since the carousel is contained within the page's padded content area

