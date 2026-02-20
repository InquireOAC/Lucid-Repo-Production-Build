

# Dream Symbol Tracker + Technique Library

## Overview

Two new features: (1) an AI-powered Dream Symbol/Theme Tracker that analyzes all journal entries and displays recurring symbols, characters, places, and themes on a dedicated page, and (2) a structured Lucid Dreaming Technique Library with illustrated cards on its own tab/page.

Both will be accessible from the bottom nav bar via a new "Insights" tab that contains two sub-tabs: **Symbols** and **Techniques**.

---

## Part 1: Dream Symbol/Theme Tracker

### How It Works

- When the user opens the Insights page (Symbols tab), we fetch all their dream entries from Supabase
- An edge function (`analyze-dream-symbols`) sends batched dream content to OpenAI and returns categorized symbols:
  - **People/Characters** (e.g., "Mother", "Stranger", "Friend")
  - **Places** (e.g., "Ocean", "School", "Forest")
  - **Objects** (e.g., "Key", "Mirror", "Door")
  - **Themes** (e.g., "Being chased", "Flying", "Falling")
  - **Emotions** (e.g., "Fear", "Joy", "Anxiety")
- Results are cached in a new `dream_symbol_analyses` table so we don't re-analyze every time
- The page shows each category with cards displaying the symbol name, frequency count, percentage, and a progress bar
- A "Re-analyze" button lets users refresh after adding new dreams

### Database Changes

New table: `dream_symbol_analyses`
- `id` (uuid, PK)
- `user_id` (uuid, not null)
- `symbols` (jsonb) -- stores the full categorized analysis
- `dream_count` (integer) -- how many dreams were analyzed
- `last_analyzed_at` (timestamptz)
- `created_at` (timestamptz)
- RLS: users can only read/write their own rows

### New Edge Function: `analyze-dream-symbols`

- Accepts user's dream content array (titles + content concatenated)
- Calls OpenAI GPT-4o-mini with a system prompt to extract and categorize recurring symbols
- Returns structured JSON with categories and frequency counts
- Requires auth (uses existing OPENAI_API_KEY secret)

### New Files

- `src/pages/Insights.tsx` -- main page with Symbols/Techniques tabs
- `src/components/insights/SymbolTracker.tsx` -- symbol analysis display
- `src/components/insights/SymbolCategory.tsx` -- renders one category (People, Places, etc.)
- `src/hooks/useSymbolAnalysis.tsx` -- hook to fetch/trigger analysis
- `supabase/functions/analyze-dream-symbols/index.ts` -- edge function

---

## Part 2: Technique Library

### Structure

A curated, static library of lucid dreaming techniques displayed as illustrated cards. Each card includes:
- Technique name and acronym
- Difficulty level badge (Beginner / Intermediate / Advanced)
- Short description
- Illustrated icon/emoji
- Expandable detail section with step-by-step instructions

### Techniques Included

1. **MILD** (Mnemonic Induction of Lucid Dreams) -- Beginner
2. **WBTB** (Wake Back To Bed) -- Beginner
3. **Reality Checks** -- Beginner
4. **WILD** (Wake Initiated Lucid Dream) -- Intermediate
5. **SSILD** (Senses Initiated Lucid Dream) -- Intermediate
6. **FILD** (Finger Induced Lucid Dream) -- Intermediate
7. **DEILD** (Dream Exit Initiated Lucid Dream) -- Advanced
8. **Wake-Initiated Meditation** -- Advanced

### New Files

- `src/components/insights/TechniqueLibrary.tsx` -- grid of technique cards
- `src/components/insights/TechniqueCard.tsx` -- individual expandable card

---

## Part 3: Navigation Update

### MainLayout.tsx Changes

- Add a 4th tab to the bottom nav: **Insights** with a `Sparkles` icon
- Route: `/insights`

### App.tsx Changes

- Add route: `<Route path="insights" element={<Insights />} />`
- Add `/insights` to the public routes check if needed

---

## Technical Summary

| File | Action |
|------|--------|
| `supabase migration` | Create `dream_symbol_analyses` table with RLS |
| `supabase/functions/analyze-dream-symbols/index.ts` | New edge function for AI symbol extraction |
| `src/pages/Insights.tsx` | New page with Symbols/Techniques tabs |
| `src/components/insights/SymbolTracker.tsx` | Symbol analysis UI with categories |
| `src/components/insights/SymbolCategory.tsx` | Individual category card component |
| `src/components/insights/TechniqueLibrary.tsx` | Grid of technique cards |
| `src/components/insights/TechniqueCard.tsx` | Expandable technique card |
| `src/hooks/useSymbolAnalysis.tsx` | Hook for fetching/triggering symbol analysis |
| `src/layouts/MainLayout.tsx` | Add 4th nav tab "Insights" |
| `src/App.tsx` | Add `/insights` route |

