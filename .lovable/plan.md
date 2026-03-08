

# Full-Page Dream Reader + Multi-Section Image Generation

## Part 1: Full-Page Dream Story Reader

Replace the dialog/popup dream detail with a dedicated full-page route at `/lucid-repo/:dreamId`.

### Changes

**`src/pages/DreamStoryPage.tsx`** (New)
- Full-page Wattpad-style reader
- Fetches dream by ID from Supabase with profile join
- Layout: hero image with title overlay → author bar with follow/like/comment/share → story text interleaved with section images → tags → collapsible analysis → comments
- Back button via `navigate(-1)`
- Scrolls to top on mount
- Owner sees "Generate Story Images" button if no section images exist

**`src/pages/LucidRepoContainer.tsx`** (Edit)
- Detect `dreamId` param from `useParams()`
- If present, render `DreamStoryPage` instead of the discovery feed
- Remove the `DreamDetailWrapper` dialog usage

**`src/components/repos/DiscoveryDreamCard.tsx`** (Edit)
- Replace `onOpenDream(dream)` with `navigate(\`/lucid-repo/${dream.id}\`)`

**`src/components/repos/DiscoveryHero.tsx`** (Edit)
- Same change — navigate to `/lucid-repo/${dream.id}` instead of calling `onOpenDream`

### Story Page Layout
```text
┌─────────────────────────────┐
│ ← Back                [Share]│
│ ┌─────────────────────────┐ │
│ │   HERO IMAGE (full-w)   │ │
│ │   Title + Tags overlaid │ │
│ └─────────────────────────┘ │
│  👤 @username · Mar 8, 2026 │
│  [Follow] [❤️ 12] [💬 3]   │
│ ─── Story ──────────────── │
│  Section 1 text...          │
│  [Section 1 Image]          │
│  Section 2 text...          │
│  [Section 2 Image]          │
│ ─── Analysis ───────────── │
│ ─── Comments ───────────── │
└─────────────────────────────┘
```

---

## Part 2: Multi-Section Image Generation

### Database
Add `section_images` JSONB column to `dream_entries`:
```sql
ALTER TABLE dream_entries ADD COLUMN section_images jsonb DEFAULT '[]'::jsonb;
```
Structure: `[{ section: 1, text: "...", image_url: "...", prompt: "..." }]`

### Edge Function: `split-dream-sections`
- Input: dream content text
- Uses Gemini (via Lovable AI Gateway) to split narrative into 2-4 story sections
- Returns array of `{ section, text }` objects
- Added to `config.toml` with `verify_jwt = false`

### Hook: `useSectionImageGeneration.ts`
- Orchestrates the pipeline: call `split-dream-sections` → for each section, call existing `compose-cinematic-prompt` → `generate-dream-image` → upload
- Stores results in `section_images` column
- Shows progress (e.g., "Generating 2/4...")
- Each section image = 1 credit; clear UI warning before generation

### DreamStoryPage Integration
- If `section_images` has data, render text sections interleaved with images
- If no section images and user is owner, show "Generate Story Images (uses X credits)" button
- Generation progress shown inline

---

## Implementation Order
1. Database migration (`section_images` column)
2. `split-dream-sections` edge function + config.toml entry
3. `DreamStoryPage` component
4. Wire routing (LucidRepoContainer param detection + card navigation)
5. `useSectionImageGeneration` hook
6. Section image generation UI on story page

