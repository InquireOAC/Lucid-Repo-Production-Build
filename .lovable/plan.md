## Plan: Reorder Home Page Sections

Move Dream Academy, Lucid Insights, and Following Feed above the "While Falling Asleep" section.

### Current order (lines 144-207):

1. Pinned Techniques
2. While Falling Asleep
3. Dream Academy Card
4. Today's Repo Activity
5. Lucid Insights
6. Following Feed

### New order:

1. Pinned Techniques
2. Dream Academy Card
3. Lucid Insights
4. Following Feed
5. Today's Repo Activity
6. While Falling Asleep

### Change in `src/pages/Home.tsx` (lines 144-207)

Rearrange the JSX blocks so lines 150-207 (Academy, Repo Activity, Insights, Feed) come before line 148 (FallingAsleepSection), with Today's Repo Activity moved to the end after While Falling Asleep.