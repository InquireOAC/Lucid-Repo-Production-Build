

## Fix: Lucid Repo Tag Filtering

### Problem
When you select a filter tag (e.g., "Lucid") on the Lucid Repo page, it shows "No dreams found" because of a data mismatch:

- The filter passes the **public_dream_tags UUID** (e.g., `19bb001c-cb66-4f73-a54b-1c8d09885506`)
- But dreams store tags as **lowercase names** (e.g., `"lucid"`, `"nightmare"`) or user-specific tag UUIDs from the `dream_tags` table
- These never match, so every dream gets filtered out

### Solution
Change the filter logic to match by **tag name** instead of tag ID. When a public tag is selected, look up its name and compare it (case-insensitive) against the dream's stored tag values.

### Technical Changes

**File: `src/components/repos/LucidRepoFilters.tsx`**
- Accept the `tags` (public_dream_tags list) as a new prop
- When `activeTags` contains selected tag IDs, resolve them to tag names
- Compare dream tag values against those names using case-insensitive matching

**File: `src/pages/LucidRepoContainer.tsx`**
- Pass `filteredDreamTags` (the public tags list) into `useLucidRepoFilters` so it can resolve IDs to names

### How it will work after the fix

1. User clicks "Lucid" tag -- `activeTags` = `["19bb001c-..."]`
2. Filter resolves that ID to the name `"Lucid"`
3. Each dream's tags (e.g., `["lucid", "adventure"]`) are compared case-insensitively against `"Lucid"`
4. Dreams with matching tag names are shown correctly

