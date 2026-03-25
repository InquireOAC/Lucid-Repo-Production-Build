## Platform Review: High-Impact Improvements for Value & Retention

After reviewing the full codebase, here are the key gaps and opportunities organized by impact.

---

### 2. No Home Feed / Social Discovery on Landing

The app's home page (`/`) just redirects to `/journal`. There's no social feed showing dreams from followed users. A `Feed` component exists (`src/components/social/Feed.tsx`) but is unused.

**Fix**: add a new tab called **Home page** that combines:

- A "Record Dream" CTA at the top
- A feed of followed users' dreams (using the existing `Feed` component)
- A "Today's Challenge" card if an active community challenge exists
- Quick links to Chat, Insights, and Dream Book

This gives users a reason to open the app daily beyond just logging.

---

### 3. No Daily Engagement Hooks on Journal Page

The Journal page has a daily quote but lacks engagement drivers.

**Fix**: Add to the Journal page:

- **Streak counter** showing current dream logging streak (data already computed in `useLucidStats`)
- **Daily challenge prompt** pulled from active `community_challenges`
- **"Your dream recall is X% this week"** micro-insight from stats

---

### 4. Mobile Nav Labels Missing

The bottom nav tabs removed labels in a previous update -- tabs only show icons with no text. This hurts discoverability.

**Fix**: Re-add labels below icons in `NavTab` component (they're passed as props but not rendered).

---

### 6. No Reading History / Continue Reading

Users browsing Lucid Repo have no way to resume where they left off. The reading queue was planned but the "Continue Reading" row hasn't been connected to persistent state.

**Fix**: Track viewed dream IDs in localStorage or a `reading_history` table. Show a "Continue Reading" row at the top of Lucid Repo with the last 5 viewed dreams.

---

### 7. No Push Notification Integration for Web

Wake Timer uses Capacitor local notifications (native only). Web users get no reminders.

**Fix**: Add Web Push notification support (service worker + Notification API) for dream logging reminders. Fall back gracefully when permission is denied.

---

### Summary of Proposed Changes


| Priority | Change                                                      | Files                                                         |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| High     | Add Explore & DreamConnections routes                       | `src/App.tsx`                                                 |
| High     | Re-add nav labels on mobile tabs                            | `src/layouts/MainLayout.tsx`                                  |
| High     | Add 5th "More" nav tab or reorganize nav                    | `src/layouts/MainLayout.tsx`                                  |
| High     | Wire Feed component into a home/social tab                  | `src/pages/Index.tsx` or new Home page                        |
| Medium   | Add streak + challenge card to Journal                      | `src/components/journal/JournalHeader.tsx`                    |
| Medium   | Add reading history to Lucid Repo                           | `src/pages/LucidRepoContainer.tsx`, `src/store/dreamStore.ts` |
| Medium   | Add entry points to Insights/Chat/DreamBook from main pages | Various profile/journal components                            |
| Lower    | Web push notifications for reminders                        | New service worker + hook                                     |


### Technical Approach

- Routes: Add `<Route path="explore" element={<Explore />} />` and `<Route path="connections" element={<DreamConnections />} />` to App.tsx
- Mobile nav: Either expand to 5 tabs (Journal, Repo, Stats, Explore, Profile) or add a "More" sheet from the 5th tab that links to Chat, Insights, DreamBook, Connections, Learn
- Home feed: Create a new `Home.tsx` that renders `Feed` + engagement widgets, make `/` point there, move journal to `/journal` only
- Streak on journal: Import `useLucidStats` in `JournalHeader` and show a small streak badge next to the date
- Reading history: Add `viewedDreamIds: string[]` to the existing zustand dream store, persist to localStorage