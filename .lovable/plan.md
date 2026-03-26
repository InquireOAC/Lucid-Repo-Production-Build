

## Plan: Fix Feature List Not Switching Between Plans

### Root Cause
The tier detection logic on line 148-150 checks if the product name includes "mystic" or if the ID equals "price_premium". Real Stripe products have auto-generated IDs (like `price_1Abc...`) and may have different casing/naming. When neither condition matches, **both** plans fall through to the "dreamer" tier.

### Fix
In `src/components/paywall/PaywallDialog.tsx`, replace the name/ID-based tier detection with **price-based detection**: the most expensive product is "mystic" tier, the cheaper one is "dreamer" tier. This is reliable regardless of Stripe product naming.

**Change** (lines 147-151):
```tsx
// Before
const selectedProduct = products.find(p => p.id === selectedPlan);
const selectedTierKey = selectedProduct
  ? (selectedProduct.name.toLowerCase().includes("mystic") || selectedProduct.id === "price_premium" ? "mystic" : "dreamer")
  : "mystic";

// After
const selectedProduct = products.find(p => p.id === selectedPlan);
const maxPrice = Math.max(...products.map(p => parsePrice(p.price)));
const selectedTierKey = selectedProduct
  ? (parsePrice(selectedProduct.price) >= maxPrice ? "mystic" : "dreamer")
  : "mystic";
```

### Files
| File | Action |
|---|---|
| `src/components/paywall/PaywallDialog.tsx` | Fix tier detection to use price comparison instead of name/ID matching |

