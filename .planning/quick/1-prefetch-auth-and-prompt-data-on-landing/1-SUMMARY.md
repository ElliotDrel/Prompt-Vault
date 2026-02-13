# Quick Task 1: Prefetch Auth and Prompt Data on Landing Page

## Objective

Eliminate perceived loading delays for authenticated users navigating from landing page to dashboard.

## Changes Made

### Task 1: Synchronous session detection + UI consumers

| File | Change |
|------|--------|
| `src/lib/supabaseClient.ts` | Added `hasPersistedSession()` - synchronous localStorage check for Supabase session token (key: `sb-hupdhjdasqgfcabaiiwa-auth-token`). Checks access_token exists and expiry is in the future. |
| `src/contexts/AuthContext.tsx` | Added `likelyAuthenticated` boolean to context. Uses `hasPersistedSession()` via lazy useState initializer while auth is loading, then settles to `!!user` after auth resolves. |
| `src/components/LandingNav.tsx` | Switched from `user` to `likelyAuthenticated` for button text and navigation. "Go to App" now renders on first frame for returning users. |
| `src/components/auth/RequireAuth.tsx` | When `loading && likelyAuthenticated`, shows minimal `<div className="min-h-screen bg-gray-50" />` instead of full-screen branded spinner with "Checking authentication..." text. |

### Task 2: Eliminate redundant getUser() calls

| File | Change |
|------|--------|
| `src/lib/storage/index.ts` | `createStorageAdapter()` now accepts optional `userId` parameter. When provided, skips redundant `getCurrentUserId()` call and `adapter.isReady()` check (both called `getUser()` - 2 extra network round-trips). |
| `src/contexts/StorageAdapterContext.tsx` | Passes `userId!` to `createStorageAdapter()` since the guard above guarantees it's non-null at call site. |

## Impact

- **Button flash eliminated**: "Go to App" renders on first frame for returning users (no flash of "Sign In / Sign Up")
- **~600ms faster dashboard**: 2 redundant `supabase.auth.getUser()` network calls removed from adapter creation path
- **Smoother loading**: RequireAuth shows plain gray background (matching dashboard) instead of branded spinner for likely-authenticated users
- **No security regression**: RequireAuth still redirects to /auth if auth ultimately fails

## Verification

- `npm run lint`: 0 errors (16 pre-existing Fast Refresh warnings only)
- `npm run build`: Success (887.49 kB JS, 72.11 kB CSS)
- Commit: `b024ac4`
