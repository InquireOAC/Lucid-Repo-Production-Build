

## Plan: Use DreamStoryPage for Journal Dreams

Currently, tapping a journal dream opens a modal dialog (`DreamDetail`). The Lucid Repo uses a full-page story reader (`DreamStoryPage`) at `/lucid-repo/:dreamId`. We'll reuse that same page for journal dreams by adding a dedicated route and navigating to it instead of opening a modal.

### Changes

**1. `src/App.tsx`** — Add a new route for journal dream detail:
```
/dream/:dreamId → DreamStoryPage
```
This generic route serves both journal and repo dreams since `DreamStoryPage` fetches by ID regardless. The existing `/lucid-repo/:dreamId` route stays for backward compatibility.

**2. `src/pages/Journal.tsx`** — Replace the modal-based detail view with navigation:
- Change `onSelect` in `DreamsList` to navigate to `/dream/${dream.id}` using `useNavigate` instead of setting `selectedDream`
- Remove the `DreamDetail` modal rendering block (lines 193-210)
- Keep `selectedDream` state only for the edit dialog flow

**3. `src/pages/DreamStoryPage.tsx`** — Add owner actions for private dreams:
- When the user is the dream owner, show Edit, Delete, and Toggle Public buttons in the sticky header bar (next to Back and Share)
- Add a small dropdown menu (three-dot icon) with these actions
- For Edit: navigate to the journal edit flow or open an edit dialog
- For Delete: show confirmation dialog, then navigate back on success
- For Toggle Public: inline toggle with toast feedback
- Skip incrementing view count when the viewer is the owner

### Files Changed
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/dream/:dreamId` route pointing to `DreamStoryPage` |
| `src/pages/Journal.tsx` | Replace modal with `navigate(`/dream/${dream.id}`)`, remove `DreamDetail` import and rendering |
| `src/pages/DreamStoryPage.tsx` | Add owner action menu (edit, delete, toggle public) in header |

