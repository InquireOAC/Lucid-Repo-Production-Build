

# LucidRepo Wattpad-Style Redesign + Dream Series

## Overview
Transform LucidRepo from a tab-based masonry grid into a Wattpad-style discovery page with curated horizontal scroll rows and add a dream series (multi-chapter) system.

This is a large feature set. I recommend splitting into two phases:
- **Phase 1**: Restructure LucidRepo layout into Wattpad-style horizontal rows
- **Phase 2**: Add dream series (multi-chapter dreams)

---

## Phase 1: Wattpad-Style Discovery Layout

### Current vs New Structure

```text
CURRENT:
┌─────────────────────────┐
│ [Following][Recent][Pop]│  ← tabs
│ [Search bar]            │
│ [Tag pills]             │
│ ┌──────┐ ┌──────┐      │
│ │ card │ │ card │      │  ← masonry grid
│ └──────┘ │      │      │
│ ┌──────┐ └──────┘      │
│ │      │ ┌──────┐      │
│ └──────┘ └──────┘      │
└─────────────────────────┘

NEW (Wattpad-style):
┌─────────────────────────┐
│ [Search bar]            │
│                         │
│ ═══ Featured Dream ═══  │  ← hero banner (top dream)
│ ┌───────────────────┐   │
│ │  large cover card │   │
│ └───────────────────┘   │
│                         │
│ Trending Now        →   │
│ ┌────┐┌────┐┌────┐┌──  │  ← horizontal scroll
│ └────┘└────┘└────┘└──  │
│                         │
│ From People You Follow →│
│ ┌────┐┌────┐┌────┐┌──  │
│ └────┘└────┘└────┘└──  │
│                         │
│ Popular in Lucid    →   │
│ ┌────┐┌────┐┌────┐┌──  │
│ └────┘└────┘└────┘└──  │
│                         │
│ Dream Series        →   │
│ ┌────┐┌────┐┌────┐┌──  │
│ └────┘└────┘└────┘└──  │
│                         │
│ [Browse by tag pills]   │
│ Nightmare Dreams    →   │
│ ┌────┐┌────┐┌────┐┌──  │
│ └────┘└────┘└────┘└──  │
└─────────────────────────┘
```

### New Components

| Component | Purpose |
|-----------|---------|
| `DiscoveryHero` | Large featured dream banner at top (most liked dream with image) |
| `DiscoveryRow` | Reusable horizontal scroll row with section title and "See all" link |
| `DiscoveryDreamCard` | Tall book-cover-style card (aspect-[2/3]) with image, title, author, read count |
| `DiscoverySeriesCard` | Similar card but for series with chapter count badge |

### Data Sections (rows)
Each row fetches its own slice of dreams:
1. **Featured** -- single hero card, highest engagement dream with image
2. **Trending Now** -- dreams with most likes in last 7 days
3. **From People You Follow** -- reuse `useFeedPublicDreams` hook
4. **Popular in [Tag]** -- top dreams per tag (Lucid, Nightmare, etc.)
5. **Dream Series** -- series with recent updates (Phase 2)
6. **New Releases** -- most recent public dreams

### Files to Modify/Create

| File | Action |
|------|--------|
| `src/pages/LucidRepoContainer.tsx` | Replace masonry layout with discovery rows |
| `src/components/repos/DiscoveryHero.tsx` | New -- hero banner |
| `src/components/repos/DiscoveryRow.tsx` | New -- horizontal scroll row container |
| `src/components/repos/DiscoveryDreamCard.tsx` | New -- tall book-cover card |
| `src/hooks/useDiscoveryDreams.tsx` | New -- fetches categorized dream data for all rows |
| `src/components/repos/LucidRepoHeader.tsx` | Simplify to just search bar (remove tabs) |

---

## Phase 2: Dream Series

### Database Changes
New tables via migration:

**`dream_series`** table:
- `id` uuid PK
- `user_id` uuid (references auth.users, NOT NULL)
- `title` text NOT NULL
- `description` text
- `cover_image_url` text
- `tags` text[] DEFAULT '{}'
- `is_public` boolean DEFAULT false
- `status` text DEFAULT 'ongoing' (ongoing, completed, hiatus)
- `like_count` integer DEFAULT 0
- `view_count` integer DEFAULT 0
- `chapter_count` integer DEFAULT 0
- `created_at` timestamptz DEFAULT now()
- `updated_at` timestamptz DEFAULT now()

**`dream_series_chapters`** table:
- `id` uuid PK
- `series_id` uuid FK -> dream_series.id ON DELETE CASCADE
- `dream_id` uuid FK -> dream_entries.id ON DELETE CASCADE
- `chapter_number` integer NOT NULL
- `created_at` timestamptz DEFAULT now()
- UNIQUE(series_id, dream_id)
- UNIQUE(series_id, chapter_number)

**`dream_series_follows`** table:
- `id` uuid PK
- `user_id` uuid NOT NULL
- `series_id` uuid FK -> dream_series.id ON DELETE CASCADE
- `created_at` timestamptz DEFAULT now()
- UNIQUE(user_id, series_id)

RLS policies:
- Anyone can SELECT public series
- Owner can INSERT/UPDATE/DELETE their own series
- Anyone can SELECT chapters of public series
- Owner can manage chapters
- Users can follow/unfollow series

### New Components for Series

| Component | Purpose |
|-----------|---------|
| `src/components/series/SeriesDetailPage.tsx` | Full series view with chapter list, follow button, cover |
| `src/components/series/CreateSeriesDialog.tsx` | Modal to create/edit a series |
| `src/components/series/AddChapterDialog.tsx` | Modal to add existing dreams as chapters |
| `src/components/series/SeriesCard.tsx` | Card for discovery rows |
| `src/hooks/useDreamSeries.tsx` | CRUD hook for series |
| `src/hooks/useSeriesFollow.tsx` | Follow/unfollow series |

### Series Flow
1. User goes to Profile -> "My Series" tab -> "Create Series"
2. Picks a title, description, cover image, tags, and adds existing dreams as chapters
3. Series appears in LucidRepo discovery under "Dream Series" row
4. Other users can follow a series and get notified of new chapters

---

## Implementation Order
1. **Database migration** -- create the 3 series tables with RLS
2. **Discovery layout** -- rebuild LucidRepoContainer with horizontal rows
3. **Discovery components** -- DiscoveryHero, DiscoveryRow, DiscoveryDreamCard
4. **useDiscoveryDreams hook** -- categorized dream fetching
5. **Series CRUD** -- hooks and create/edit dialogs
6. **Series detail page** -- reading view with chapter navigation
7. **Series in discovery** -- add series row to LucidRepo
8. **Profile integration** -- "My Series" tab on profile page

This is a multi-session effort. I recommend starting with Phase 1 (discovery layout) in this session.

