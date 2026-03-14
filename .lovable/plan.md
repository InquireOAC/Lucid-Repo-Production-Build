

# Lucid Stats — Cardless Section-Based Redesign

Remove all individual `glass-card` wrappers and restructure the page as a single continuous page with distinct sections separated by dividers and spacing. Content sits directly on the page background.

## Changes

### 1. `src/pages/LucidStats.tsx` — New section-based layout
- Remove the grid layout of cards
- Render each section sequentially with `Separator` dividers between them
- Add a page title header at top
- Each section: section title + content, no card wrapper
- On `lg+`: use a two-column layout for paired sections (frequency + recall side by side, techniques + triggers side by side) using CSS grid, with dividers spanning full width between row groups

### 2. All section components — Strip card wrappers
Each component loses its `glass-card rounded-2xl p-5 border` wrapper and becomes bare content:

- **`StatsHeroCard.tsx`**: Remove gradient card wrapper. Render as a page header section — large title, subtitle, and the 3 metric pills inline. Keep the pills styled.
- **`LucidFrequencyCard.tsx`**: Remove `glass-card` div. Just render heading, stat row, chart, and footnote directly.
- **`RecallStrengthCard.tsx`**: Same — remove card wrapper, keep stat grid and chart.
- **`TechniqueEffectivenessCard.tsx`**: Remove card, keep heading + bars.
- **`TriggerDetectionCard.tsx`**: Remove card, keep heading + badge cloud.
- **`LucidityTrendCard.tsx`**: Remove card, keep segmented bar + legend.
- **`AICoachCard.tsx`**: Keep its gradient background as a subtle highlight strip (not a card — full-width banner style).
- **`AchievementsCard.tsx`**: Remove card, keep horizontal scroll of achievement items.

### 3. Visual separation approach
- Use `Separator` component between major sections
- Generous vertical spacing (`py-8` between sections)
- Section headings: `text-lg font-semibold` with `text-muted-foreground` subtitles
- On desktop (lg+), paired sections sit side-by-side in a 2-col grid; a full-width separator sits between each row

