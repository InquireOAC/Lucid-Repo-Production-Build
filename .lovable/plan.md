

## Plan: Fix Android Subscription Plan Display to Match iOS

### Problem
On Android, RevenueCat product identifiers differ from the hardcoded iOS IDs, so products fall into the fallback branch showing raw Google Play titles and "All features included" instead of clean names with feature lists.

### Fix — `src/hooks/useNativeSubscription.ts` (lines 70-103)

Add fuzzy matching so Android products are correctly categorized even with different identifiers:

```typescript
const identifier = pkg.product.identifier.toLowerCase();
const title = (pkg.product.title || '').toLowerCase();

const isBasic = identifier === PRODUCT_IDS.BASIC 
  || identifier.includes('limited') 
  || identifier.includes('basic')
  || identifier.includes('dreamer');

const isPremium = identifier === PRODUCT_IDS.PREMIUM 
  || identifier.includes('unlimited') 
  || identifier.includes('premium')
  || identifier.includes('mystic');
```

This ensures Android products with identifiers like `app.dreamweaver.lucidrepo:premium.monthly` or titles containing "Premium" get the correct clean name ("Basic"/"Premium") and full feature list — identical to iOS.

### Files Modified (1)
`src/hooks/useNativeSubscription.ts` — ~5 lines changed in product matching logic

