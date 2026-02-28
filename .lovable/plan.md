

# Admin Dashboard Analytics Charts

## Overview
Add a rich analytics section to the Stats tab with interactive time-series charts using the existing recharts library and chart UI components. The charts will query Supabase data grouped by day/month and display trends for key platform metrics.

## Data Strategy
All metrics will be derived from existing tables using client-side Supabase queries with date grouping. A new `useAdminAnalytics` hook will fetch 30-day time-series data in a single batch of parallel queries.

### Metrics and Data Sources
| Metric | Source Table | Query Logic |
|--------|-------------|-------------|
| New Users / Day | `profiles` | GROUP BY `created_at::date` |
| New Subscriptions / Day | `stripe_subscriptions` | GROUP BY `created_at::date`, WHERE `deleted_at IS NULL` |
| Current MRR | `stripe_subscriptions` | Count active subs x price ($4.99 for limited, $15.99 for unlimited) |
| Monthly Active Users | `dream_entries` | Distinct `user_id` in last 30 days |
| Image Generations | `dream_entries` | Count WHERE `image_url IS NOT NULL`, grouped by day |
| Video Generations | `dream_entries` | Count WHERE `video_url IS NOT NULL`, grouped by day |
| Public Dream Entries | `dream_entries` | Count WHERE `is_public = true`, grouped by day |
| User Retention | Calculated | (Users active this week) / (Users active last week) as % |

## New Files

### `src/hooks/useAdminAnalytics.tsx`
- Fetches 30-day time-series data from Supabase
- Returns arrays of `{ date, value }` for each metric
- Computes MRR from active subscription price_ids
- Computes retention ratio
- Single `useEffect` with `Promise.all` for performance

### `src/components/admin/AnalyticsCharts.tsx`
- Renders a vertical stack of chart cards below the existing hero/secondary stat grids in `CommunityStats`
- Each chart card uses `ChartContainer` from the existing chart UI
- Uses `AreaChart` for trends (new users, dreams, generations) with gradient fills
- Uses `BarChart` for subscriptions
- Displays MRR and retention as large number KPI cards (not charts)
- A date range selector (7d / 14d / 30d) at the top to filter the view
- Mobile-optimized: charts are full-width, 180px tall, with proper touch scrolling

## Modified Files

### `src/components/admin/CommunityStats.tsx`
- Import and render `<AnalyticsCharts />` below the existing secondary stats grid
- No other changes

## UI Layout (top to bottom in Stats tab)
1. Hero Stats Row (existing - unchanged)
2. Secondary Stats Grid (existing - unchanged)
3. Date Range Selector: `[7d] [14d] [30d]` pill buttons
4. MRR + Retention KPI row (two side-by-side glass cards)
5. Chart Cards (scrollable vertical list):
   - "New Users" - AreaChart with primary gradient
   - "Subscriptions" - BarChart
   - "Monthly Active Users" - AreaChart
   - "Image Generations" - AreaChart
   - "Video Generations" - AreaChart
   - "Public Dreams" - AreaChart

Each chart card: glass variant, title + current period total in header, 180px chart area.

## Technical Details
- Uses existing `recharts` dependency and `ChartContainer`/`ChartTooltip` from `src/components/ui/chart.tsx`
- Uses existing `date-fns` for date formatting
- All queries use admin RLS (admin role has access to all rows)
- No database migrations needed -- all data already exists
- No edge functions needed

