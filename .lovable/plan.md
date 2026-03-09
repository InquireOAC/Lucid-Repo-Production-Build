

## Switch to Grid View When Category Filter is Active

### Current Behavior
When a category filter (e.g. "Lucid", "Nightmare") is selected, the page still shows the discovery layout (horizontal rows), just with fewer dreams visible in each row. This is confusing and doesn't surface all matching dreams.

### New Behavior
When any filter other than "All" is selected:
- Replace the discovery rows with a **2-column masonry grid** showing ALL dreams matching that tag
- Default sort: **Popular** (by like_count + comment_count)
- Show a small **sort dropdown** (Popular / New) aligned right, below the category filter bar
- When "All" is selected, revert to the current discovery layout (hero + rows)

### Changes

**`src/pages/LucidRepoContainer.tsx`**

1. Add a `sortMode` state: `"popular" | "new"` (default `"popular"`)
2. Reset `sortMode` to `"popular"` when `activeFilter` changes
3. When `activeFilter !== "All"`:
   - Filter `uniqueDreams` by the active tag
   - Sort by engagement (popular) or `created_at` (new) based on `sortMode`
   - Render a sort dropdown button (right-aligned, small) below the filter bar
   - Render `MasonryDreamGrid` with the filtered+sorted dreams instead of the discovery rows
4. When `activeFilter === "All"`: keep current discovery layout unchanged

The sort dropdown will be a simple `<select>` or pair of pill buttons styled consistently with the existing UI. No new components needed — just inline JSX in `LucidRepoContainer.tsx`.

