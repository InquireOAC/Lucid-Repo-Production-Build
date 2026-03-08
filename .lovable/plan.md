

## Plan: Starry Background for NewDream + Full-Page Edit Dream

### 1. Add muted animated starry background to NewDream page

**File: `src/pages/NewDream.tsx`**
- Change the root `div` from `bg-background` to `starry-background` class (already exists in CSS with animated cosmic drift)
- Update the sticky header from `bg-background/80` to `bg-background/60` so stars subtly show through
- Update the bottom save bar similarly

The existing `starry-background` CSS class already has muted star dots with a slow `cosmic-drift` animation. The stars are already subtle (0.2-0.4 opacity). No CSS changes needed — it's already muted and animated.

### 2. Convert EditDreamDialog from modal to full-page route

**File: `src/pages/EditDream.tsx`** (new)
- Create a new page component that mirrors NewDream but operates in edit mode
- Accept a `dreamId` URL param, fetch the dream from the store, and pre-populate all fields
- Use `handleEditDream` from `useDreamJournal` instead of `handleAddDream`
- Header shows "Edit Dream" instead of "Record New Dream", Save button calls edit handler
- Same `starry-background` class
- On save, navigate back to journal

**File: `src/App.tsx`**
- Add route: `<Route path="journal/edit/:dreamId" element={<EditDream />} />`

**File: `src/pages/Journal.tsx`**
- Change `handleOpenEditDialog` to navigate to `/journal/edit/${dream.id}` instead of opening the modal
- Remove `EditDreamDialog` import and usage
- Remove `isEditingDream`, `setIsEditingDream` state usage

**File: `src/components/journal/EditDreamDialog.tsx`**
- Can be left in place (unused) or removed

### Summary of changes
| File | Action |
|------|--------|
| `src/pages/NewDream.tsx` | Swap `bg-background` → `starry-background` on root + adjust header/footer opacity |
| `src/pages/EditDream.tsx` | New file — clone of NewDream adapted for editing (pre-fills from existing dream, calls edit handler) |
| `src/App.tsx` | Add `/journal/edit/:dreamId` route |
| `src/pages/Journal.tsx` | Navigate to edit page instead of opening modal; remove modal code |

