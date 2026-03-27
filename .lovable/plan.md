

## Plan: Ensure Notification Count Resets Properly After Mark All Read

### Problem
After pressing "Mark all as read", the unread count should go to 0 and stay at 0 until a genuinely new notification arrives (at which point it should show 1). There's a potential race condition: the realtime subscription in `useNotifications` calls `fetchNotifications` on every INSERT to `activities`. If a new activity is inserted right around the time `markAllAsRead` runs, the refetch could re-read stale localStorage state or the save might not have completed.

### Root Cause Analysis
The `markAllAsRead` function saves current notification IDs to localStorage and sets `unreadCount: 0`. When `fetchNotifications` is triggered by realtime, it reads localStorage to determine which IDs are read. This should work, but:
1. The `saveReadIds` function caps at 200 entries — if there are more, older IDs get evicted and could appear "unread" again on refetch
2. There's no timestamp-based approach — we track individual IDs rather than saying "everything before this time is read"

### Fix
Add a `readAllBefore` timestamp to localStorage alongside the ID set. When `markAllAsRead` is called, store the current timestamp. During `fetchNotifications`, any notification with `created_at` before that timestamp is automatically marked as read, regardless of whether its ID is in the set. This is more reliable than tracking 200 individual IDs.

### Changes in `src/store/notificationStore.ts`
1. Add `getReadAllTimestamp()` / `saveReadAllTimestamp()` helpers using a separate localStorage key
2. In `markAllAsRead`: save `new Date().toISOString()` as the "read all before" timestamp
3. In `fetchNotifications` enrichment: mark a notification as read if its `created_at` is before the saved timestamp OR its ID is in the read set
4. Keep the existing ID-based tracking for individual `markAsRead` calls on newer notifications

### Files
| File | Action |
|---|---|
| `src/store/notificationStore.ts` | Add timestamp-based "read all" tracking alongside existing ID tracking |

