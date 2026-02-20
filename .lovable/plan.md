

## Fix and Enhance Notifications for iOS

### Problems to Fix

1. **ID Conflict**: Both Morning Reminder and Wake Timer use notification ID `1`, so enabling one cancels the other on iOS.
2. **Wake Timer has no platform check**: It calls Capacitor APIs directly without checking if running on web, causing crashes in the browser.
3. **Wake Timer uses clunky inputs**: Two separate number fields instead of a native time picker.
4. **No custom message support**: Users can't personalize their notification text.
5. **Cancellation reliability**: Need to ensure each notification type can be independently stopped without affecting the other.

### Changes

#### 1. Assign unique notification IDs

| Feature | ID |
|---------|----|
| Morning Reminder | `100` |
| Wake Timer | `200` |
| Reality Checks | `300`-`304` |

This ensures enabling/disabling one feature never interferes with another.

#### 2. Fix `notificationUtils.ts`
- Change morning reminder notification ID from `1` to `100`.
- Add `message` field to `NotificationSettings` so users can customize the notification body.
- Update `cancelAllNotifications` to only cancel morning reminder IDs (not wake timer ones).
- Add a dedicated `cancelMorningReminder()` function.

#### 3. Fix `WakeTimerDialog.tsx`
- Add `Capacitor.isNativePlatform()` check before calling `LocalNotifications`.
- Add web fallback using browser `Notification` API + `setTimeout`.
- Replace two separate hours/minutes number inputs with a single `<input type="time">`.
- Change notification ID from `1` to `200`.
- Add custom message input field.
- Add a dedicated cancel function that only cancels ID `200`.
- Match the app's cosmic aurora styling.

#### 4. Enhance `NotificationsDialog.tsx`
- Add a custom message input (default: "Remember to log your dream from last night!").
- Pass the custom message through to `saveNotificationSettings`.
- Style to match the app's aesthetic.

#### 5. Update `useNotificationManager.tsx`
- Use IDs `300`-`304` for reality check notifications instead of `1`-`5`.
- Add platform check before scheduling.

### Files to Modify

| File | What Changes |
|------|-------------|
| `src/utils/notificationUtils.ts` | Use ID `100`, add `message` field, add `cancelMorningReminder()`, update reschedule to use custom message |
| `src/components/profile/NotificationsDialog.tsx` | Add custom message input, pass to save, improve styling |
| `src/components/profile/WakeTimerDialog.tsx` | Platform check, web fallback, time input, ID `200`, custom message, cancel fix, styling |
| `src/hooks/useNotificationManager.tsx` | Use IDs `300`+ for reality checks, add platform safety |

### Technical Details

**Updated NotificationSettings interface:**
```text
{
  enabled: boolean
  time: string       // "HH:MM"
  message: string    // custom notification body text
}
```

**Updated WakeTimer storage (key: `wakeTimer`):**
```text
{
  enabled: boolean
  time: string       // "HH:MM" (single time input)
  message: string    // custom body text
}
```

**iOS-specific handling preserved:**
- The existing iOS reschedule-on-delivery pattern stays, but uses ID `100` and the custom message.
- Wake timer uses the same iOS non-repeat + reschedule pattern with ID `200`.
- Each cancel function only targets its own ID, so stopping wake timer won't affect morning reminders and vice versa.

