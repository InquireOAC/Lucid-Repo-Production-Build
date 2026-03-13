

## Plan: 5 Changes

### 1. Fix dream opening in filtered Lucid Repo grid

**Root cause**: `handleOpenDream` in `useLucidRepoDreamActions` sets `selectedDream` state, but `LucidRepoContainer` never renders `DreamDetailWrapper` or navigates anywhere with it. The `selectedDream` state is set but unused.

**Fix**: Change `handleOpenDream` to navigate to `/dream/${dream.id}` instead of setting local state. This matches the existing route `<Route path="dream/:dreamId" element={<DreamStoryPage />} />`.

**File**: `src/hooks/useLucidRepoDreamActions.tsx` — replace `setSelectedDream` with `navigate(`/dream/${dream.id}`)`.

---

### 2. Dream Connections — limit to recent data

**Root cause**: All queries in `useDreamConnections.tsx` fetch up to 50/20 items with no time filter, showing stale historical data.

**Fix**: Add time filters to each fetch:
- `dream_matches`: `.gte('created_at', last24h)`  
- `sync_alerts`: `.gte('created_at', last48h)`  
- `collective_waves`: `.gte('created_at', last72h)`  
- `dream_clusters`: `.gte('event_date', today)`

**File**: `src/hooks/useDreamConnections.tsx`

---

### 3. Fix notification counter not resetting

**Root cause**: The `markAsRead` function decrements `unreadCount` by 1 even if the notification was already read, and the `markAllAsRead` sets count to 0 but the badge component reads from `useNotificationStore` which may have a stale selector. The real bug: when `markAsRead` is called for an already-read notification, it still decrements. Need to guard against that.

**Fix**: In `markAsRead`, check if the notification is actually unread before decrementing. Also ensure `markAllAsRead` properly persists and the store update triggers re-render of `NotificationBell`.

**File**: `src/store/notificationStore.ts`

---

### 4 & 5. Remove all toast messages

**Scope**: 68 files import `toast` from `sonner`. Remove all `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.loading()`, `toast.dismiss()` calls. Keep only `console.error`/`console.warn` for error logging. Remove unused `import { toast } from "sonner"` lines. Also remove the `<Toaster />` component from the app and the sonner-related files.

**Files**: All 68 files that import from sonner, plus:
- `src/components/ui/sonner.tsx` — delete or empty
- `src/main.tsx` or wherever `<Toaster />` is rendered — remove it
- `src/components/ui/toaster.tsx` — remove if unused after
- `src/hooks/use-toast.ts` — remove if unused after

This is a large mechanical change across many files — every `toast.*()` call becomes either nothing (for success/info) or just the `console.error` that usually precedes it (for errors).

