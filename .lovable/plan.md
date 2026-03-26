

## Plan: Redesign Paywall to Selection-Based Layout

**Inspiration**: The reference screenshot shows a single-select plan picker (Yearly/Monthly cards) with one shared "Subscribe" button at the bottom, instead of per-plan subscribe buttons.

### Design
- Remove per-plan feature lists and individual subscribe buttons
- Show the feature hero section (icon + title + description) at top
- Below: two selectable plan cards (radio-style) — user taps to select, highlighted with primary border
- The more expensive/better-value plan gets a "Best value!" badge
- One shared "Subscribe" CTA button pinned at the bottom
- Restore purchases link and terms text below the button

### Changes in `src/components/paywall/PaywallDialog.tsx`

**Stripe plans section** (replace lines 198-261):
- Add `selectedPlan` state (defaults to the premium/best-value plan)
- Render each product as a selectable card showing: plan name, total price, per-month breakdown
- Selected card gets `border-primary` ring, unselected gets `border-border/30`
- Premium plan gets "Best value!" badge (positioned like the screenshot)
- Remove feature lists from plan cards — keep the hero description as the selling point
- Move the Subscribe button to a fixed bottom bar outside the scroll area

**Native plans section** (NativePaywallPlans):
- Same selection pattern: selectable cards + single subscribe button

**Bottom bar** (new fixed section):
- "Subscribe" button, full-width, primary color
- Terms text below

### Files
| File | Action |
|---|---|
| `src/components/paywall/PaywallDialog.tsx` | Redesign plan selection UI |

