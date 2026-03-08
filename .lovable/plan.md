

## Fix: Notifications not persisting read state across navigation

### Root Cause

`useNotifications()` is called independently in two places:
1. `NotificationBell` (in ProfileHeader, stays mounted)
2. `Notifications` page (mounts/unmounts on navigation)

Each hook instance has its **own independent state**. When you mark all as read on the Notifications page, it updates localStorage and *that instance's* `unreadCount` to 0. But the `NotificationBell` instance still holds its stale `unreadCount` from when it first fetched -- it never re-runs `fetchNotifications` because its `user` dependency hasn't changed.

### Fix

Replace the two independent hook instances with a **shared Zustand store** for notification state. This way both components read from and write to the same state.

| File | Change |
|------|--------|
| `src/store/notificationStore.ts` | New Zustand store holding `unreadCount`, `notifications`, `loading`, and actions (`fetchNotifications`, `markAsRead`, `markAllAsRead`). Keeps existing localStorage logic for read IDs. |
| `src/hooks/useNotifications.tsx` | Rewrite to be a thin wrapper around the Zustand store. The `useEffect` for fetching + realtime subscription stays here but writes to the store. |
| `src/components/notifications/NotificationBell.tsx` | Reads `unreadCount` from the store instead of calling `useNotifications()` independently. |
| `src/pages/Notifications.tsx` | No changes needed -- it already uses `useNotifications()` which will now share state via the store. |

### How it works

- Zustand store is a singleton -- both `NotificationBell` and `Notifications` page read the same `unreadCount`
- When `markAllAsRead` is called on the Notifications page, the store's `unreadCount` updates to 0 immediately, and `NotificationBell` re-renders with 0
- `fetchNotifications` in the store reads localStorage read IDs to correctly compute unread count on re-fetch
- Realtime subscription stays in the hook (mounted once via ProfileHeader's NotificationBell)

