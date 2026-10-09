# Lucid Repo — Cinematic Redesign

## Identity Shift

Lucid Repo today reads as a **dream journal with analytics**: greeting + quick-action CTAs, a lucidity trend chart, a grid of dream entries, and a row of "techniques" to study. The product moment is logging an entry and reflecting on it.

The product is actually about **turning dreams into cinematic experiences**. Users record dreams so they can watch them — as still scenes, as 30-second cinematic shorts, as a personal film library. The UI should lead with that. Dreams are films waiting to be made; the app is a streaming platform for your own subconscious.

The **LucidRepo** page already nails this aesthetic — full-bleed hero, horizontal poster rails, frosted-glass sticky header, Netflix-style category pills. The plan is to bring that same visual language to **Home** and **Journal**, and to retire the journaling/analytics cues that pull the app back toward "Notion for dreams."

---

## Design Language (already built — reuse)

Living in `src/components/repos/`:

| Component | Purpose | Key classes |
|---|---|---|
| `HeroPoster` | Full-bleed featured item | `aspect-[3/4]` mobile → `aspect-[21/9]` desktop, layered gradients `from-background/80`, floating CTA cluster bottom-left |
| `PosterRail` | Horizontal carousel | `flex overflow-x-auto gap-2 snap-x snap-mandatory scrollbar-hide` with section title + "See all" chevron |
| `PosterCard` | 2:3 vertical poster | `w-[110-150px] aspect-[2/3] rounded-md`, minimal overlay |
| `TopTenCard` | Ranked poster | huge stroked rank number + overlapping poster |
| `CategoryHeroCard` | Wide feature card | `aspect-[4/5]` with Ken Burns animation, big uppercase title |
| Sticky header | Frosted glass | `sticky top-0 z-30 bg-background/80 backdrop-blur-md` + category pills |

Color tokens, fonts, motion (`framer-motion`, `tailwindcss-animate`, `aurora-shift`) are already defined in `tailwind.config.ts` and `src/index.css`. No new design tokens are needed — the existing palette (`primary` aurora purple, `secondary` blue, gold accent) on the dark base is exactly right.

---

## Home Page (`src/pages/Home.tsx`)

### Remove

- The lucidity trend `AreaChart` (recharts) — journaling metric, breaks the cinematic spell
- The dual quick-action card row ("Record Dream", "Dream Book") that currently anchors the top of the page
- The "Dream Techniques" grid — push to a dedicated `/learn` route, not the home hero
- The text-led greeting block — replace with a visual hero

### New layout (top → bottom)

```
┌─────────────────────────────────────────┐
│  <HeroPoster> — featured dream          │
│  Full-bleed image/video, gradient fade  │
│  Title · Mood · Date                    │
│  [▶ Watch Cinematic]  [Open]  [♡]       │
├─────────────────────────────────────────┤
│  3 dreams · 1 cinematic · 12 scenes     │  ← stats strip, text only
├─────────────────────────────────────────┤
│  Continue Creating          See all ›   │
│  ◻ ◻ ◻ ◻ ◻  ← PosterRail of in-progress │
├─────────────────────────────────────────┤
│  Your Cinematic Dreams       See all ›  │
│  ▶ ▶ ▶ ▶ ▶  ← rail with play overlay   │
├─────────────────────────────────────────┤
│  Featured Dreamscapes        See all ›  │
│  ◻ ◻ ◻ ◻ ◻  ← public/community dreams  │
└─────────────────────────────────────────┘
                                     ⊕ New Dream  ← FAB
```

### Hero selection logic
Pick the most recent dream that has, in priority order:
1. A finished cinematic `video_url`
2. A `section_images[0].image_url`
3. A standalone `image_url`

Fallback: an atmospheric placeholder still with a "Create your first cinematic" CTA overlay.

### Rails
- **Continue Creating** — 5 most recent dreams *without* a cinematic. Tap → `EditDream`.
- **Your Cinematic Dreams** — dreams with `video_url`. Card variant: `PosterCard` + centered play-icon overlay. Tap → opens the cinematic player.
- **Featured Dreamscapes** — public dreams (same data source as LucidRepo's discovery rails).

### Stats strip
Single horizontal line, `text-xs text-muted-foreground`, between hero and first rail:
`{n} dreams this week · {n} cinematics created · {n} scenes generated`

No chart. Just numbers. If a metric is zero, omit it.

### FAB
Floating `+` button, fixed bottom-right, sits above bottom nav on mobile:
`bg-primary text-primary-foreground rounded-full px-4 py-3 shadow-lg`
Label: "New Dream". Tap → `NewDream` route.

---

## Journal Page (`src/pages/Journal.tsx`)

### Remove

- The motivational quote header (`JournalHeader`'s daily quote section)
- The "Record Dream" header button (replaced by FAB)
- The responsive grid in `DreamsList`
- The standalone tag pill bar (replaced by sticky category pills)

### New layout

```
┌─────────────────────────────────────────┐
│  My Dreams              🔍              │  ← sticky, frosted glass
│  All · Lucid · Nightmare · Peaceful ··· │  ← scrollable category pills
├─────────────────────────────────────────┤
│  <HeroPoster compact>                   │  ← latest dream as feature
│  aspect-[21/9] desktop, [16/9] mobile   │
│  [Open]  [▶ Watch Cinematic]            │
├─────────────────────────────────────────┤
│  Recently Added             See all ›   │
│  ◻ ◻ ◻ ◻ ◻                              │
├─────────────────────────────────────────┤
│  Lucid Dreams               See all ›   │
│  ◻ ◻ ◻ ◻ ◻                              │
├─────────────────────────────────────────┤
│  Your Cinematics            See all ›   │
│  ▶ ▶ ▶ ▶ ▶                              │
├─────────────────────────────────────────┤
│  This Month                 See all ›   │
│  ◻ ◻ ◻ ◻ ◻                              │
└─────────────────────────────────────────┘
                                     ⊕ New Dream  ← FAB
```

### Category pills (replaces tag filter)
- `All` (default)
- `Lucid`, `Nightmare`, `Peaceful` (mood filters)
- Then the user's top tag names as additional pills (scrollable horizontally)
- Active pill: `bg-foreground text-background`; inactive: `bg-transparent border-border/30`
- Sticks to top of viewport under the main app nav

### Rails by grouping
Replace the flat grid with semantically grouped rails. Each rail uses `PosterRail` + `PosterCard`:
- **Recently Added** — most recent 8 entries
- **Lucid Dreams** — `mood === "lucid"` (or any lucid tag)
- **Your Cinematics** — has `video_url`
- **This Month** — date filter

When a category pill is active, the page collapses to a single full-grid (still cards, not list rows) of just that filter — same `PosterCard` style, multiple rows.

### Empty state (`EmptyJournal.tsx`)
Full-screen, atmospheric — dark backdrop, blurred dream image, centered text:
> **Your dream cinema is empty**
> Record your first dream to start your library.
> [Record First Dream]

No icons-of-pencils. Cinematic, not stationery.

---

## DreamCard (journal variant)

**Current**: floating glass card overlaid on hero image, Edit / Public-Private / Delete action buttons stacked prominently.

**Target**: `PosterCard` behavior — narrow vertical poster, image-only by default, just the title underneath in `text-xs`. Action buttons disappear from the resting state.

Reveal actions on:
- **Long-press** (mobile)
- **Hover** (desktop)

Action sheet slides up from bottom (mobile) or appears as an absolute overlay (desktop) with Edit / Share / Delete. This matches how streaming apps surface "More info" — actions are present but not visually dominant.

---

## Navigation & Language

Subtle relabeling reinforces the identity shift:

| Today | After |
|---|---|
| Journal | My Dreams |
| Record Dream | New Dream |
| Edit | Open |
| Generate Image | Create Scene |
| Generate Video | Create Cinematic |
| Lucid Repo | Lucid Repo *(unchanged — already on-brand)* |
| Home | Home *(unchanged)* |

Icons follow: `Film` for My Dreams tab; `Plus` for the FAB; `Play` overlay on cinematic posters.

---

## Typography Scale

Bump titles app-wide to feel like film cards rather than list rows:

| Element | Now | After |
|---|---|---|
| Dream title in card | `text-base` | `text-lg font-semibold` |
| Section/rail title | `text-lg` | `text-xl font-bold tracking-tight` |
| Metadata (date, tags) | `text-sm` | `text-xs text-muted-foreground` |
| Hero title | `text-2xl` | `text-3xl md:text-4xl font-black` |

---

## Files to Modify / Add

**Modify**
- `src/pages/Home.tsx` — full restructure per layout above
- `src/pages/Journal.tsx` — replace header + delegate to rail layout
- `src/components/journal/JournalHeader.tsx` — restyle as sticky cinematic header (or replace with a new `CinematicJournalHeader`)
- `src/components/journal/DreamsList.tsx` — swap grid for grouped rails
- `src/components/journal/DreamCard.tsx` — add a `variant="poster"` mode
- `src/components/journal/EmptyJournal.tsx` — cinematic empty state
- `src/components/layout/Navigation.tsx` (and mobile equivalent) — rename "Journal" → "My Dreams", icon → `Film`

**Add**
- `src/components/ui/FAB.tsx` — reusable floating action button
- `src/components/dreams/DreamPosterRail.tsx` *(optional)* — thin wrapper around repo's `PosterRail` that accepts `DreamEntry[]` instead of repo data; only needed if `PosterRail` is too tightly coupled to the repo data shape

**Reuse from `src/components/repos/`** (extend prop signatures if currently typed to repo data only):
- `HeroPoster`, `PosterRail`, `PosterCard`, `CategoryHeroCard`

**No backend changes required.** All data already exists on `dream_entries` (`video_url`, `image_url`, `section_images`, `mood`, `tags`, `created_at`).

---

## Implementation Order

1. **Generalize the repo components** — make `HeroPoster`, `PosterRail`, `PosterCard` accept a `DreamEntry` (or a normalized `MediaItem` interface) so they're reusable outside `/repo`.
2. **Build `FAB`** — used on both pages.
3. **Rewrite `Home.tsx`** — hero, stats strip, three rails, FAB.
4. **Rewrite `Journal.tsx`** + `CinematicJournalHeader` — sticky header, hero, four rails, FAB.
5. **Update `DreamCard`** with `variant="poster"`.
6. **Replace `EmptyJournal`** with the cinematic version.
7. **Rename nav labels** + swap icons.
8. **Bump typography** across affected components.

---

## Verification

1. Open Home. The dominant element above the fold is a full-bleed dream still or video — not text, not a chart.
2. Scroll Home — three horizontal rails, no grid, no recharts canvas anywhere.
3. Tap a poster in "Continue Creating" → goes to `EditDream`.
4. Tap a poster in "Your Cinematic Dreams" → opens the cinematic player.
5. Open Journal. Sticky header at top has frosted glass + category pills. No motivational quote anywhere.
6. Tap "Lucid" pill → only lucid-mood dreams render, in poster cards.
7. With no dreams in account: full-screen cinematic empty state, single CTA, no list affordances.
8. FAB labelled "New Dream" is visible bottom-right on both pages, sits above the bottom nav on mobile.
9. `grep -rn "Lucidity Trend\|AreaChart\|Daily Quote\|Dream Techniques" src/pages/Home.tsx src/pages/Journal.tsx` returns zero matches.
10. Side-by-side: Home, Journal, and Lucid Repo all share the same visual vocabulary — hero, rails, pills, posters.
