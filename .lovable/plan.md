

## Set Up Google and Apple OAuth for Native iOS (Capacitor)

### Problem
Currently, when a user taps "Continue with Google" or "Continue with Apple" on the native iOS app, the OAuth flow opens in the browser but has no way to redirect back into the app. The code uses `window.location.origin` as the redirect URL, which doesn't work for native apps.

### Solution Overview
1. Register a custom URL scheme so the native app can receive OAuth callbacks
2. Listen for deep links in the app and extract the OAuth session tokens
3. Update the OAuth redirect URL to use the Supabase callback, which will redirect to the custom scheme
4. Configure Info.plist with the URL scheme
5. Update Supabase dashboard redirect URLs

---

### Step 1: Add Custom URL Scheme to Info.plist

Add a `CFBundleURLTypes` entry so iOS knows to open the app when a URL like `app.dreamweaver.lucidrepo://` is triggered. The scheme will be `app.dreamweaver.lucidrepo`.

**File: `ios/App/App/Info.plist`**

### Step 2: Create a Deep Link Handler Utility

Create `src/utils/oauthDeepLink.ts` that:
- Imports `App` from `@capacitor/app` and `Capacitor` from `@capacitor/core`
- On native platforms, listens for `appUrlOpen` events
- When an OAuth callback URL arrives (containing `access_token` and `refresh_token` in the URL fragment), calls `supabase.auth.setSession()` to log the user in
- On web, does nothing (standard browser redirect handles it)

### Step 3: Initialize the Deep Link Listener on App Startup

In `src/App.tsx`, import and call `setupOAuthDeepLinkListener()` inside a `useEffect` so it starts listening as soon as the app loads.

### Step 4: Update OAuth Redirect URLs in Auth.tsx

Change the `redirectTo` in `handleGoogleSignIn` and `handleAppleSignIn`:
- On native: use `app.dreamweaver.lucidrepo://callback` (the custom URL scheme)
- On web: keep `window.location.origin + '/'`

This is done by checking `Capacitor.isNativePlatform()`.

### Step 5: Configure Supabase Dashboard (Manual Step)

You will need to:
1. Go to **Supabase Dashboard > Authentication > URL Configuration**
2. Add `app.dreamweaver.lucidrepo://callback` to the **Redirect URLs** list
3. Under **Authentication > Providers**, enable **Google** and **Apple** with your credentials

---

### Technical Details

**Files to create:**
- `src/utils/oauthDeepLink.ts` -- Deep link listener that parses OAuth tokens from the callback URL and sets the Supabase session

**Files to modify:**
- `ios/App/App/Info.plist` -- Add `CFBundleURLTypes` with scheme `app.dreamweaver.lucidrepo`
- `src/pages/Auth.tsx` -- Use native redirect URL when on Capacitor
- `src/App.tsx` -- Initialize deep link listener on mount

**Deep link flow:**
```text
User taps "Sign in with Google"
  -> Opens browser with Supabase OAuth URL
  -> User authenticates with Google
  -> Supabase redirects to: app.dreamweaver.lucidrepo://callback#access_token=...&refresh_token=...
  -> iOS opens the app via URL scheme
  -> appUrlOpen listener fires
  -> App extracts tokens, calls supabase.auth.setSession()
  -> User is logged in, navigated to home
```

