## Seed Mock Data for Marketing Screenshots

### Situation

- Currently 15 real profiles in the database
- No foreign key constraints on `profiles` or `dream_entries`, so mock data can be inserted directly via SQL
- Dream images require calling the AI generation pipeline (Gemini), which takes ~30s per image

### Plan

#### 1. Create a `seed-mock-data` edge function

A one-time-use edge function that:

**Phase A — 100 Mock Profiles**

- Generates 100 UUIDs and inserts into `profiles` with:
  - Realistic usernames (e.g., "lucid_explorer_42", "dreamcatcher_nova", "astral_wanderer")
  - Display names, bios, avatar symbols + colors (using the app's existing symbol avatar system)
  - Varied `created_at` dates over the past 3 months

**Phase B — Dream Entries (~3-5 per user, all public)**

- ~400 dream entries total with:
  - Creative dream titles and content (vivid, varied themes: flying, underwater, space, forests, cities, etc.)
  - Realistic tags from the default set (Nightmare, Lucid, Recurring, Adventure, Spiritual, Flying, Falling, Water)
  - Varied moods, `lucid` flags, like/comment/view counts
  - `is_public = true` on all entries
  - Staggered `created_at` dates

**Phase C — AI Image Generation for 10 Users**

- Select 20 users, pick 1-2 dreams each
- For each dream, call the existing `compose-cinematic-prompt` + `generate-dream-image` pipeline
- Store the resulting `image_url` on the dream entry
- This phase will take ~5-10 minutes due to AI generation time

#### 2. Populate Connections Data

- The `match_dream_on_insert` trigger won't fire for bulk SQL inserts, so after seeding dreams, run the matching logic manually to populate `dream_matches`, `sync_alerts`, and `collective_waves` with organic-looking data

### Technical Notes

- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for inserts
- The function is idempotent — checks if mock data already exists before inserting
- Mock user IDs won't have auth.users entries, so they can't log in (they're display-only for the Lucid Repo feed and marketing)
- After screenshots are done, a cleanup function can remove all mock data

### Estimated Generation Time

- Profiles + dreams: ~5 seconds
- 15-20 AI images: ~8-12 minutes (sequential generation)