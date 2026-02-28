

# Auth Page: Live Dream Cards in Archive Section

## Changes

### 1. Remove logo and caption
- Remove the `<img src={lucidRepoLogo} ...>` line from the header section
- Remove the `lucidRepoLogo` import
- Remove the "No spam. Just stories." paragraph

### 2. Fetch 4 most recent public dreams
Add a `useEffect` + `useState` that queries Supabase directly (no auth required since `dream_entries` has a public SELECT policy for `is_public = true`):

```typescript
const [recentDreams, setRecentDreams] = useState<any[]>([]);

useEffect(() => {
  supabase
    .from("dream_entries")
    .select("id, title, generatedImage, created_at, profiles(username, display_name, avatar_symbol, avatar_color)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(4)
    .then(({ data }) => setRecentDreams(data || []));
}, []);
```

### 3. Replace static archive preview with dream cards
Replace the three italic dream text lines with a 2x2 grid of mini dream cards styled for the auth page palette. Each card will show:
- Dream image (or a Moon icon placeholder if none)
- Dream title (truncated)
- Username

Cards will be styled with the auth page's dark palette (`#0B0F19` background, `#F4F1EA` text, subtle border) rather than the app's default theme. They will be non-interactive (no click handlers) -- purely editorial/preview.

### Files Modified
- `src/pages/Auth.tsx` -- all changes in this single file

### No Database Changes
The existing RLS policy `Dreams: users see public dreams` already allows anonymous SELECT on public dreams, so no migration is needed.
