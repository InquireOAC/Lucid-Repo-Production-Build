

# Lucid Stats Dashboard — Implementation Plan

This is a large feature spanning database migrations, edge functions, new UI components, and form updates. Given scope, I'll present a phased approach that can be implemented incrementally.

---

## Phase 1: Database Schema & Migrations

**Migration 1 — Add new columns to `dream_entries`:**
- `lucidity_level` integer nullable (1-3)
- `technique_used` text nullable
- `dream_symbols` text[] default '{}'
- `word_count` integer nullable
- `dream_date` date nullable

**Migration 2 — Backfill existing data:**
- Set `dream_date = date::date` for all entries
- Compute `word_count` from `content` for all entries

**Migration 3 — Create new tables:**
- `dream_insights` (id, user_id, summary_message, recommendation_message, motivation_message, generated_at, based_on_entry_count, based_on_date_range)
- `lucid_achievement_definitions` (id, key, title, description, icon, category, unlock_rule)
- `lucid_user_achievements` (id, user_id, achievement_id, unlocked_at) with unique constraint on (user_id, achievement_id)

**Migration 4 — Indexes:**
- `(user_id, dream_date)` on dream_entries
- `(user_id, lucid)` on dream_entries
- GIN index on `dream_symbols`

**Migration 5 — RLS policies:**
- dream_insights: users can read/write their own
- lucid_achievement_definitions: anyone can read
- lucid_user_achievements: users can read/insert their own

**Migration 6 — RPC function `get_lucid_stats(p_user_id uuid)`:**
Returns a JSON payload with all computed stats in one call:
- total_lucid_dreams, lucid_this_month, current/longest lucid streak, days_since_last_lucid
- total_entries, total_nights, current/longest recall streak, avg_dreams_per_night, avg_word_count
- technique breakdown (technique, uses, successes, rate)
- top dream symbols with counts
- avg lucidity level, level distribution
- lucid chart data (date, count) for time ranges
- recall chart data (date, count)
- latest AI insight
- unlocked achievement IDs

This single RPC avoids multiple round-trips and keeps computation server-side.

**Seed achievement definitions** (via insert tool):
- First Lucid Dream, 10 Lucid Dreams, 25 Lucid Dreams, 7-Day Recall Streak, 30-Day Recall Streak, First Full Control Dream, Tried 3 Techniques, Logged 50 Dreams, etc.

---

## Phase 2: Routing & Navigation

**`src/App.tsx`:**
- Replace `DreamConnections` import/route with new `LucidStats` page
- Route: `/lucid-stats`
- Remove `/connections` route

**`src/layouts/MainLayout.tsx`:**
- Change third nav tab from `Link2` icon + "Connections" → `Sparkles` icon + "Stats"
- Point to `/lucid-stats`

---

## Phase 3: Dream Entry Form Updates

**`src/components/DreamEntryForm.tsx`:**
- Add `lucidity_level` selector (1/2/3 scale) — only visible when `lucid` is checked
- Add optional `technique_used` dropdown (MILD, WILD, Reality Checks, WBTB, Meditation, Supplements, None)
- Auto-compute `word_count` from content on save
- Set `dream_date` from the date field
- Pass new fields through to insert/update queries

**`src/types/dream.ts`:**
- Add `lucidity_level`, `technique_used`, `dream_symbols`, `word_count`, `dream_date` fields

---

## Phase 4: Core Stats Hook

**New file: `src/hooks/useLucidStats.ts`**
- Calls the `get_lucid_stats` RPC
- Returns typed stats object + loading/error states
- Caches via React Query with sensible stale time (~5 min)
- Provides time range state (7d/30d/90d/all)

---

## Phase 5: UI Components

All components go in `src/components/lucid-stats/`:

```text
LucidStats page
├── StatsHeroCard (summary + AI sentence)
├── LucidFrequencyCard (metrics + line/bar chart + time toggle)
├── RecallStrengthCard (streak metrics + mini bar chart)
├── TechniqueEffectivenessCard (ranked bars + highlight)
├── TriggerDetectionCard (top 5 symbol chips + counts)
├── LucidityTrendCard (trend chart + donut breakdown)
├── AICoachCard (cached insight or default educational card)
├── AchievementsCard (horizontal badge scroller)
├── EmptyStateCard (per-section fallback)
└── LoadingSkeletonStats (skeleton layout)
```

Design:
- Cosmic purple/blue gradients, glassmorphism cards using existing `vault-glass` / `glass-card` patterns
- Recharts for charts (already installed)
- Each section degrades independently — catches its own errors
- Empty states per section with contextual messaging
- `stable-card` class on all cards for scroll stability

**Page: `src/pages/LucidStats.tsx`**
- Scrollable dashboard
- Calls `useLucidStats` once
- Distributes data to section components
- PullToRefresh support

---

## Phase 6: AI Dream Coach Edge Function

**New edge function: `supabase/functions/generate-dream-insight/index.ts`**
- Accepts `user_id`, fetches stats via service role
- Sends summary to OpenAI for 3 coaching messages
- Stores result in `dream_insights` table
- Only generates if: last insight > 3 days old OR 5+ new entries since last insight
- Returns cached insight otherwise

---

## Phase 7: Achievement Checking

**New file: `src/hooks/useLucidAchievements.ts`**
- After stats load, check unlock conditions against achievement definitions
- Insert new unlocks into `lucid_user_achievements` (upsert, ignore conflicts)
- Show toast notification on new unlock

---

## Scope & Constraints

- **Dream symbol extraction** (AI-based) will be deferred to a background process — the stats page will work without it initially, using tags as a proxy for triggers
- The `get_lucid_stats` RPC handles all heavy computation server-side
- Charts use Recharts (already in deps)
- Total new files: ~15 components + 2 hooks + 1 edge function + 6 migrations
- Modified files: App.tsx, MainLayout.tsx, DreamEntryForm.tsx, types/dream.ts, supabase types

This is production-grade scope. Implementation will proceed migration-first, then routing, then UI top-to-bottom.

