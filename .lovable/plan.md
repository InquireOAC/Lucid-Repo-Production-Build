

## Plan: Redesign Home Stats + Add Lucid Insights Section + Repo Activity Stat

### What Changes

**1. Redesign the top stats row** (currently 3 plain icon+number pairs that look unfinished)
- Replace with a single glass card containing 3 stat columns with colored accent bars/dots, proper spacing, and visual hierarchy
- Each stat gets a subtle colored top border accent matching its icon color

**2. Add "Lucid Insights" section before the Following Feed**
- A glass card with a small area chart (recharts `AreaChart`) showing lucid dream frequency over the last 30 days from `stats.lucid_chart`
- Below the chart: a row of 3 mini stats — lucid rate (lucid/total as %), best technique, and avg lucidity level
- Tappable to navigate to `/lucid-stats` for full details

**3. Add "Dreams Added Today" community stat**
- New query in Home that counts public `dream_entries` created today (`created_at >= start of today`)
- Displayed as a small banner/pill between the quick links and the insights section: "🌙 X dreams shared to the Repo today"

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Redesign `MiniStatCard` into a proper stats card, add Lucid Insights chart section, add today's repo count query, reorder sections |

### Technical Detail

**Stats card redesign:**
```
┌─────────────────────────────────────┐
│  🔥 12        🧠 23       📖 94    │
│  Day Streak   Lucid       Total    │
│              Dreams      Dreams    │
└─────────────────────────────────────┘
```
Single glass card, 3 columns, each with colored icon above bold number above muted label.

**Lucid Insights section:**
- Uses recharts `AreaChart` with gradient fill from `stats.recall_chart` (last 14 days for compactness)
- Below: lucid rate `(total_lucid / total_entries * 100)%`, top technique name + rate, avg lucidity level
- Wrapped in a tappable card that navigates to `/lucid-stats`

**Today's repo count:**
```typescript
const { data: todayCount } = useQuery({
  queryKey: ["repo-today-count"],
  queryFn: async () => {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("dream_entries")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true)
      .gte("created_at", today);
    return count ?? 0;
  },
  staleTime: 60_000,
});
```

