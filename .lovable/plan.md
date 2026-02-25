

# Redesign Explore Page -- Premium Informational Vault

## Overview

Transform the Explore page from a simple technique browser into a premium "Knowledge Vault" for meditation and lucid dreaming -- featuring curated video content, links to peer-reviewed research studies, and a polished vault-glass aesthetic. The user search stays but everything else is rebuilt around two knowledge domains: **Lucid Dreaming** and **Meditation**.

## New Page Structure

```text
+---------------------------------------+
|  Explore              [Search users]  |
|  Your knowledge vault                 |
+---------------------------------------+
|  [Lucid Dreaming] [Meditation] (tabs) |
+---------------------------------------+
|                                       |
|  --- Featured Video ---               |
|  [ Large thumbnail card w/ play ]     |
|                                       |
|  --- More Videos ---                  |
|  [ thumb ] [ thumb ] (horiz scroll)   |
|                                       |
|  --- Research & Studies ---           |
|  [ Study card with journal, year,   ] |
|  [   title, key finding, link icon  ] |
|  [ Study card ...                   ] |
|                                       |
|  --- Techniques ---                   |
|  [ existing technique cards scroll ]  |
|                                       |
|  --- Daily Insight ---                |
|  [ tip banner ]                       |
|                                       |
+---------------------------------------+
```

## New Files

### 1. `src/data/vaultContent.ts` -- Static curated content

Contains all the curated data for both tabs:

- **Videos**: Array of objects with `title`, `thumbnailUrl`, `youtubeUrl`, `duration`, `author`, `category` ("lucid-dreaming" | "meditation")
- **Research studies**: Array of objects with `title`, `journal`, `year`, `authors`, `keyFinding`, `doi` (link to the paper), `category`
- **Daily insights**: Separate tip arrays per category

Includes ~6-8 curated YouTube videos per category (real, well-known lucid dreaming and meditation channels) and ~5-6 real peer-reviewed studies per category (e.g., LaBerge's work, Voss et al., Stumbrys et al. for lucid dreaming; mindfulness/meditation meta-analyses).

### 2. `src/components/explore/FeaturedVideoCard.tsx`

A large glass-card with:
- Full-width thumbnail (aspect-ratio 16/9) with rounded corners
- Play icon overlay with hover animation
- Title, author, duration badge
- Opens YouTube link in new tab on click
- Uses `vault-glass` styling with subtle glow on hover

### 3. `src/components/explore/VideoThumbnailCard.tsx`

Compact horizontal-scroll card:
- Small thumbnail (w-[200px], aspect 16/9)
- Title (line-clamp-2), author, duration
- Opens YouTube link on click

### 4. `src/components/explore/ResearchStudyCard.tsx`

Glass-card for each study:
- Journal name + year as a subtle badge
- Study title (bold)
- Key finding summary (1-2 lines, muted text)
- External link icon that opens the DOI/URL
- Left border accent using `border-l-2 border-primary/40`

### 5. `src/components/explore/VaultTabContent.tsx`

Renders the content for one tab (lucid dreaming or meditation):
- Featured video section
- Horizontal video scroll row
- Research studies list
- Techniques grid (filtered by relevance to the category)
- Daily insight banner

## Modified Files

### 6. `src/pages/Explore.tsx` -- Full rewrite

- Keep the user search bar and `UserSearchResults` component
- Add a tab switcher (two glass-style buttons: "Lucid Dreaming" / "Meditation") using simple `useState`
- Render `VaultTabContent` for the active tab
- Update page header: "Explore" with subtitle "Your knowledge vault"
- Remove the old static `meditations` array and `dailyTips` -- replaced by data in `vaultContent.ts`
- Keep importing `techniques` for the technique cards section

### 7. `src/components/explore/TechniqueGridCard.tsx` -- No changes

Stays as-is; reused inside VaultTabContent.

## Visual Design Details

- All cards use `glass-card` or `vault-glass` classes already defined in the project
- Section headers are clean text-only (no icons per the existing pattern)
- Video thumbnails have a dark overlay + centered `PlayCircle` icon on hover
- Research cards have a subtle `border-l-2 border-primary/40` accent
- Tab buttons use `bg-primary/15 text-primary` when active, `bg-card/60 text-muted-foreground` when inactive
- The featured video card gets a subtle `vault-card-lift` hover effect

## Technical Notes

- All video links open externally (`window.open(url, '_blank')`) -- no embedded players needed
- Research DOI links similarly open externally
- Content is fully static (hardcoded in `vaultContent.ts`) -- no database tables or edge functions needed
- The existing technique data is filtered by a simple mapping: techniques with indices 0-5 show under "Lucid Dreaming", meditation-related ones (index 7) under "Meditation"
- Tabs use a simple `useState<"lucid-dreaming" | "meditation">` -- no routing changes needed

