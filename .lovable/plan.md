

## Plan: Multi-Character Dream Avatar Builder

### Overview
Transform the single-avatar Dream Avatar page into a multi-character builder with a scrollable carousel, per-character reference photos, and add/edit modes.

### 1. New Database Table: `dream_characters`

Create a new table to store multiple characters per user. The existing `ai_context` table stays for backward compatibility (visual fingerprint usage in edge functions).

```sql
CREATE TABLE public.dream_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  photo_url text,          -- generated avatar
  face_photo_url text,     -- reference face
  outfit_photo_url text,   -- reference outfit
  accessory_photo_url text,-- reference accessory
  avatar_style text DEFAULT 'digital_art',
  visual_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_characters ENABLE ROW LEVEL SECURITY;

-- RLS policies (own data only)
CREATE POLICY "Users can view own characters" ON public.dream_characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON public.dream_characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON public.dream_characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.dream_characters FOR DELETE USING (auth.uid() = user_id);
```

### 2. Rewrite AIContextDialog (`src/components/profile/AIContextDialog.tsx`)

**New UI layout:**

```text
┌──────────────────────────────────────┐
│  ← Dream Avatar                      │
├──────────────────────────────────────┤
│                                      │
│   ○ ○ [●] ○  [+]    ← carousel      │
│   (character circles, scrollable)    │
│                                      │
│   "Character Name"                   │
│                                      │
│   [Edit Avatar]  [Delete]            │
│                                      │
│  ─── When editing/adding: ───────── │
│                                      │
│   Reference Photos                   │
│   [ Face ] [ Outfit ] [ Accessory ]  │
│                                      │
│   Avatar Style (horizontal scroll)   │
│                                      │
│   Name input                         │
│                                      │
│   [Generate Character]               │
│   [Save]  [Cancel]                   │
└──────────────────────────────────────┘
```

**Behavior:**
- On open, fetch all `dream_characters` for the user
- Display characters in a horizontal scrollable carousel (circles with generated avatar images)
- Last item in carousel is a "+" button to add a new character
- Tapping "+" enters **add mode**: blank form (face/outfit/accessory uploads, style picker, name input)
- Tapping "Edit Avatar" on the selected character enters **edit mode**: pre-populates form with that character's data
- Reference photos section only visible in add/edit mode
- Save in add mode: INSERT into `dream_characters`
- Save in edit mode: UPDATE existing character
- Also sync the selected/primary character's `photo_url` to `ai_context` so existing features (profile avatar picker, image generation) continue working
- Delete button removes a character

### 3. Update EditProfileDialog (`src/components/profile/EditProfileDialog.tsx`)

- Change the Dream Avatar option to query `dream_characters` instead of `ai_context` for the avatar URL
- Show the first character's photo_url (or let user pick which character to use as profile pic)

### 4. Update edge function reference (`analyze-character-image`)

- No changes needed immediately; we'll sync the active character to `ai_context` on save so the fingerprint flow continues working

### 5. Update aiContextUtils (`src/utils/aiContextUtils.ts`)

- Keep as-is since `ai_context` will still be synced with the primary/active character

### Summary of changes

| File | Action |
|------|--------|
| Migration SQL | Create `dream_characters` table with RLS |
| `src/components/profile/AIContextDialog.tsx` | Full rewrite: carousel, add/edit modes, multi-character CRUD |
| `src/components/profile/EditProfileDialog.tsx` | Query `dream_characters` for avatar options instead of just `ai_context` |

