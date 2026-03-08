
## Investigation: Dream Avatar Page Issues

### Problem Analysis
The user is experiencing two issues with the dream avatar page:
1. Current avatar not displaying (shows empty when it shouldn't)
2. Empty page when no avatar exists instead of showing the new character creation interface

### Investigation Steps

**Step 1: Explore Dream Avatar Components**
- Look for dream avatar related components and pages
- Check profile avatar display logic
- Understand how avatars are stored and retrieved

**Step 2: Check Database Schema**
- Examine `ai_context` table for avatar data
- Look at `dream_characters` table structure
- Check `profiles` table for avatar references

**Step 3: Trace Avatar Display Logic**
- Follow the avatar display chain from profile to components
- Check how `avatar_url` vs symbol avatars work
- Identify where the empty state logic is failing

**Step 4: Examine Profile Avatar Logic**
- Check `ProfileAvatar.tsx` and `SymbolAvatar.tsx`
- See how `avatarUrl` is handled vs symbol avatars
- Understand the fallback logic

### Files to Review
- `src/components/profile/` - Profile avatar components
- `src/pages/` - Look for dream avatar/character pages
- Database tables: `ai_context`, `dream_characters`, `profiles`
- Profile data hooks and context

### Expected Findings
- Mismatched avatar URL field names or data flow
- Missing default/empty state handling
- Incorrect avatar loading logic
- Missing navigation to character creation flow

### Fix Strategy
Once I understand the current implementation, I'll:
1. Fix avatar display logic to show current avatar properly
2. Add proper empty state that directs to character creation
3. Ensure consistent avatar data flow throughout the app
4. Update profile avatar display if needed
