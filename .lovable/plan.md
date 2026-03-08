

## Add Wattpad-Style Category Filter Bar to Lucid Repo

Add a horizontally scrollable category filter bar directly below the search input, matching the Wattpad reference screenshot style — bold text labels, active state with an orange/primary underline, scrollable overflow.

### Filter Categories
Hardcoded list: `All`, `Lucid`, `Nightmare`, `Recurring`, `Adventure`, `Spiritual`, `Flying`, `Prophetic`, `Sleep Paralysis`

### Behavior
- "All" is selected by default — shows the normal discovery feed (no filtering)
- Selecting a category filters ALL discovery rows (trending, new releases, following, tag sections) to only show dreams with that tag
- Active filter gets bold text + primary-colored bottom border (like the Wattpad orange underline)
- Inactive filters are muted text, no underline
- Bar scrolls horizontally with no scrollbar visible

### Changes

**`src/pages/LucidRepoContainer.tsx`**
- Add `activeFilter` state (default: `"All"`)
- Render filter bar between the search input and the content area
- Filter bar: `flex overflow-x-auto gap-4 no-scrollbar` with button items
- Update `filterBySearch` to also filter by active tag when not "All"
- Apply the combined filter to all discovery rows

Single file edit, no new components needed. The filter categories are hardcoded since they match the existing `TAG_SECTIONS` pattern in `useDiscoveryDreams`.

