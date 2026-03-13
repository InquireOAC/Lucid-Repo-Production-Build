

# Add Subscribers List to Admin Dashboard

## What
Add a new "Subscribers" tab (or section within the Users tab) that shows all accounts with active subscriptions, without requiring a search.

## Changes

### 1. `src/components/admin/SubscribersList.tsx` — New component
- On mount, query `stripe_subscriptions` where `status = 'active'` and `deleted_at is null`
- Join with `profiles` to get username, display_name, avatar_url
- Display each subscriber in a card showing: avatar, name, username, plan name (derived from `price_id`), subscription status, period end date, usage stats (`dream_analyses_used`, `image_generations_used`)
- Show total subscriber count at the top
- Include a loading skeleton state

### 2. `src/pages/AdminDashboard.tsx` — Add Subscribers tab
- Add a new tab `{ value: "subscribers", label: "Subs", icon: CreditCard }` with a badge showing `stats.activeSubscriptions`
- Import and render `SubscribersList` in the new `TabsContent`

### Technical detail
- Query pattern: fetch all active subscriptions, collect `user_id`s, then fetch matching profiles in a second query (same pattern as `UserManager`)
- Plan name derived from `price_id`: contains "premium" → "Mystic", contains "basic" → "Dreamer", else "Subscribed"
- Period end displayed as human-readable date (unix timestamp → `format(new Date(ts * 1000))`)
- Clicking a subscriber navigates to their profile

