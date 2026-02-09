

# Messaging Revamp - Instagram-Style DMs

## Overview
Redesign the Messages feature from its current clunky dialog-based approach into a clean, Instagram-inspired DM experience. The current implementation has several UX issues: it's crammed into a dialog, the chat window fights with the dialog container, there's no proper avatar/photo support, and the overall layout feels dated.

## Current Problems
- Messages are in a modal Dialog which constrains the layout and feels cramped
- ChatWindow renders inside the dialog but tries to use `h-[calc(100vh-4rem)]` causing overflow conflicts
- No profile pictures in conversations or chat bubbles
- Purple/pink gradients don't match the new cosmic aurora design system
- Input area positioning is awkward inside the dialog
- The conversation list and chat view both share the same constrained dialog space
- No visual distinction between read/unread messages
- Header layout is cluttered with Select/Cancel buttons

## Instagram DM Design Approach

### Conversation List (Messages Screen)
- Clean header with "Messages" title and compose icon
- Each conversation row: avatar (with online dot), name, last message preview, timestamp
- Unread indicator (bold text + blue dot)
- Swipe-to-delete option (existing multi-select can stay as alternative)
- Search bar at top

### Chat Window (Individual Conversation)
- Clean header: back arrow, avatar + name (tappable to profile), info icon
- Messages: sent = solid color bubble (right), received = subtle bg bubble (left)
- Instagram-style: sent messages use a gradient, received messages use a muted background
- Timestamps shown between message groups, not on every message
- Smooth input bar at bottom with text field, share dream button, send button
- Typing indicator area

## Technical Implementation

### Key Structural Change
Convert MessagesDialog from a `Dialog` to a **full-screen overlay/page** that slides in from the right, similar to Instagram's DM flow. This avoids all the dialog container constraints.

### Files to Modify

**1. `src/components/profile/MessagesDialog.tsx`** - Complete rewrite
- Replace `Dialog` wrapper with a full-screen animated overlay (`framer-motion` AnimatePresence + slide from right)
- Remove DialogHeader/DialogTitle boilerplate
- Clean Instagram-style header: back arrow, "Messages" centered, compose button
- Search bar below header
- Scrollable conversation list takes remaining space
- Remove the cluttered Select/Delete UI from the header; move delete to swipe or long-press

**2. `src/components/profile/ChatWindow.tsx`** - Complete rewrite  
- Remove the `h-[calc(100vh-4rem)]` fixed height hack
- Instagram-style header: back arrow, avatar circle, display name + "Active now" subtitle, tappable
- Message bubbles: sent = aurora gradient (from-primary to-accent), received = muted card bg
- Group consecutive messages from same sender (no repeated avatar)
- Time separators between message groups instead of per-message timestamps
- Clean bottom input: rounded input field, share icon, send icon with gradient
- Remove the glass-card styling on header/input - use clean borders instead
- Fix iOS scroll issues by using proper flex layout

**3. `src/components/profile/ConversationList.tsx`** - Restyle
- Remove green online dot (no real-time presence system)
- Cleaner row layout: 56px avatar, name + last message, right-aligned time
- Truncate last message to single line
- Add unread message indicator styling (bold name + dot) - visual only for now
- Match Instagram spacing: 16px horizontal padding, 12px vertical per row
- Use profile avatar (SymbolAvatar) instead of generic initial circle

**4. `src/index.css`** - Add new message-specific styles
- `.message-bubble-sent`: gradient background matching aurora theme
- `.message-bubble-received`: subtle muted background
- `.messages-overlay`: full-screen slide-in overlay styles
- Smooth transitions for the overlay open/close

**5. `src/components/profile/ProfileDialogs.tsx`** - Update MessagesDialog usage
- Pass any additional props needed for the new full-screen approach

### Design Specifications

#### Color Scheme (matching existing aurora theme)
- Sent bubble: `bg-gradient-to-r from-primary to-accent` (aurora purple-to-violet)
- Received bubble: `bg-muted/50` with `border border-border/50`
- Header: `bg-background/95 backdrop-blur-xl border-b border-border`
- Input area: `bg-background border-t border-border`
- Active/online: `text-primary` (not green dot)

#### Layout
- Full viewport height overlay
- Header: 56px fixed
- Search: 48px (conversation list only)
- Messages: flex-1 scrollable
- Input: auto-height, 56px minimum

#### Typography
- Conversation name: `font-semibold text-sm`
- Last message: `text-sm text-muted-foreground truncate`
- Timestamp: `text-xs text-muted-foreground`
- Message text: `text-sm`

#### Spacing
- Conversation rows: `px-4 py-3`
- Message bubbles: `px-3 py-2 rounded-2xl max-w-[75%]`
- Sent: rounded-br-sm (Instagram style notch)
- Received: rounded-bl-sm

### Animation
- Overlay slides in from right using framer-motion
- Messages fade in on load
- Send button scales on press

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/profile/MessagesDialog.tsx` | Rewrite | Full-screen overlay, Instagram-style layout |
| `src/components/profile/ChatWindow.tsx` | Rewrite | Clean chat bubbles, proper layout, grouped timestamps |
| `src/components/profile/ConversationList.tsx` | Restyle | Instagram-style conversation rows with SymbolAvatar |
| `src/index.css` | Add | Message bubble styles, overlay transitions |
| `src/components/profile/ProfileDialogs.tsx` | Minor update | Adjust props if needed |

## Expected Outcome
- Messages feel native and familiar (Instagram-like)
- Full-screen experience instead of cramped dialog
- Clean chat bubbles with aurora-themed gradients
- Proper scrolling on iOS
- Consistent with the app's cosmic aurora design system
- Preserved existing functionality: send, receive, share dreams, delete conversations

