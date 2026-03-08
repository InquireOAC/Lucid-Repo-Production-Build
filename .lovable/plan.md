

## Plan: Dream Connections — No-AI Matching

### Matching Strategy (Zero AI Credits)

Instead of AI, use **tag-based and keyword matching** from data that already exists on every dream:

1. **Dream Matches**: Two dreams share 2+ tags → match. Match percentage = `(shared_tags / total_unique_tags) * 100`
2. **Sync Alerts**: 5+ public dreams with the same tag within 48 hours
3. **Collective Waves**: 15+ public dreams with the same tag within 72 hours
4. **Dream Clusters**: Admin-created manually (link event name to a tag surge)

No edge function needed for matching. Instead, a **database function** runs the comparison when a dream is saved, using pure SQL against the `tags` array column.

### Database Schema (4 new tables + 1 function)

```sql
-- dream_matches: paired similar dreams
CREATE TABLE public.dream_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  dream1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  dream2_id uuid NOT NULL,  -- must be public
  match_percentage integer NOT NULL DEFAULT 0,
  shared_elements text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- sync_alerts: 5+ dreamers same theme in 48h
CREATE TABLE public.sync_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  emoji text DEFAULT '🔗',
  description text,
  dreamer_count integer NOT NULL DEFAULT 0,
  is_trending boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- collective_waves: 15+ dreamers same theme in 72h
CREATE TABLE public.collective_waves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  emoji text DEFAULT '🌊',
  description text,
  dream_count integer NOT NULL DEFAULT 0,
  percent_change integer DEFAULT 0,
  top_symbols text[] DEFAULT '{}',
  timeframe_start timestamptz NOT NULL,
  timeframe_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- dream_clusters: admin-created event correlations
CREATE TABLE public.dream_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  emoji text DEFAULT '🌕',
  event_date date NOT NULL,
  description text,
  dream_count integer NOT NULL DEFAULT 0,
  top_themes text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: `dream_matches` visible where user is `user1_id` or `user2_id`. Others readable by all authenticated users. Only service role can insert/update (via db function trigger).

### Matching Logic — Pure SQL Database Function

A trigger function on `dream_entries` INSERT that:

1. Gets the new dream's tags
2. Queries public dreams from the last 7 days by other users
3. Computes tag overlap using `array_intersect` (PostgreSQL array operators: `&` operator or `array(select unnest(a) intersect select unnest(b))`)
4. If 2+ shared tags → inserts a `dream_matches` row
5. Counts public dreams per tag in last 48h → if 5+ → upserts `sync_alerts`
6. Same for 72h / 15+ → upserts `collective_waves`

This runs entirely in PostgreSQL with zero external API calls.

### Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | 4 tables + trigger function + RLS |
| `src/pages/DreamConnections.tsx` | Main page with header, stats, filter pills, card feed |
| `src/components/connections/ConnectionsHeader.tsx` | Title + 3 stat cards |
| `src/components/connections/ConnectionsFilterPills.tsx` | Filter row |
| `src/components/connections/SyncAlertCard.tsx` | Indigo synchronicity card |
| `src/components/connections/DreamMatchCard.tsx` | Side-by-side match card with % ring |
| `src/components/connections/CollectiveWaveCard.tsx` | Green wave card |
| `src/components/connections/DreamClusterCard.tsx` | Amber cluster card |
| `src/components/connections/EmptyConnections.tsx` | Empty state |
| `src/hooks/useDreamConnections.tsx` | Fetch matches/alerts/waves, compute sync score |
| `src/layouts/MainLayout.tsx` | Replace Explore with Connections nav item |
| `src/App.tsx` | Replace /explore route with /connections |

### Sync Score (Client-side, no AI)

```
score = min(100, matchCount * 5 + waveParticipation * 10 + journalStreak * 2)
```

Computed in the hook from query results.

### Privacy (unchanged)

- Other users' dreams only matched if `is_public = true`
- User's own dreams (any visibility) compared against public pool
- Match cards join on `dream_entries.is_public = true` for dream2 at query time

