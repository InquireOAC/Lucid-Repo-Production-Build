

# Move Notification Bell to Profile Page

## Problem
The notification bell is currently placed in `MainLayout.tsx` as a fixed overlay at the top of every page, but it's not visible. The user wants it **only on their own profile page**, next to the messages button.

## Changes

### 1. Remove NotificationBell from MainLayout
**File**: `src/layouts/MainLayout.tsx`
- Remove the `NotificationBell` import and the fixed top overlay that renders it (lines 5, 28-35)
- This cleans up the global header area

### 2. Add NotificationBell to ProfileHeaderActions (own profile only)
**File**: `src/components/profile/ProfileHeaderActions.tsx`
- Import `NotificationBell` component
- Add it as a button right after the Messages button in the "own profile" section
- It will appear as: `[Shield?] [Pro] [Settings] [Messages] [Bell]`
- The bell already has its own unread badge styling, so it fits naturally alongside the other rounded icon buttons

### Result
- The bell with unread count badge will only appear on the user's own profile page
- It sits in the action buttons row next to Messages, making it easy to find
- Tapping it navigates to `/notifications` as before

