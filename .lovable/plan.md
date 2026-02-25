

# Convert Settings Modal to Full-Screen Slide-In

## Overview
Replace the current `Dialog`-based Settings modal with a full-screen slide-in overlay, matching the Messages screen pattern exactly (using `framer-motion` `AnimatePresence` + `motion.div` sliding in from the right).

## Changes

### `src/components/profile/SettingsDialog.tsx` -- Full rewrite

**Remove:**
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` imports
- `ScrollArea` import
- All Dialog wrapper components

**Add:**
- `AnimatePresence` and `motion` from `framer-motion`
- `ArrowLeft` icon from lucide for the back button

**New layout** (matching MessagesDialog pattern):
```text
+------------------------------------------+
| [<- Back]        Settings                |
|------------------------------------------|
|                                          |
|  Profile                                 |
|    Social Links                          |
|                                          |
|  Appearance                              |
|    Color Scheme                          |
|                                          |
|  Notifications                           |
|    Push Notifications                    |
|    Wake Timer                            |
|  ...                                     |
|  (scrollable content)                    |
+------------------------------------------+
```

Key structural changes:
- Outer wrapper: `AnimatePresence` with `motion.div` that slides in from `x: "100%"` to `x: 0` (spring damping 28, stiffness 300)
- Fixed header bar with back arrow, centered "Settings" title, and `safe-area-inset-top` padding
- Body: native `overflow-y-auto` div containing all the existing setting buttons/sections
- All existing sub-dialogs (CommunityGuidelines, BlockedUsers, DeleteAccount, AIContext, etc.) remain unchanged -- they still open as regular dialogs on top

### No other files need changes
The `SettingsDialog` already receives `open`/`onOpenChange` props which work identically with this pattern. `ProfileDialogs.tsx` continues to render it the same way.

