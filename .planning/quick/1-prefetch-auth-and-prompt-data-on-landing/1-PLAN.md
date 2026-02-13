---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/supabaseClient.ts
  - src/contexts/AuthContext.tsx
  - src/components/LandingNav.tsx
  - src/components/auth/RequireAuth.tsx
  - src/lib/storage/index.ts
  - src/contexts/StorageAdapterContext.tsx
autonomous: true
must_haves:
  truths:
    - "Authenticated user sees 'Go to App' immediately on landing page (no flash of 'Sign In / Sign Up')"
    - "Adapter creation does not make redundant getUser() network calls when userId is already known"
    - "RequireAuth shows a subtle loading state (not full-screen spinner) when session likely exists"
    - "Security is preserved: RequireAuth still redirects to /auth if auth ultimately fails"
    - "Unauthenticated users still see 'Sign In / Sign Up' and full-screen auth check on protected routes"
  artifacts:
    - path: "src/lib/supabaseClient.ts"
      provides: "hasPersistedSession() synchronous helper"
    - path: "src/contexts/AuthContext.tsx"
      provides: "likelyAuthenticated boolean from synchronous localStorage check"
    - path: "src/components/LandingNav.tsx"
      provides: "Instant button state using likelyAuthenticated"
    - path: "src/components/auth/RequireAuth.tsx"
      provides: "Minimal loading state when likelyAuthenticated is true"
    - path: "src/lib/storage/index.ts"
      provides: "createStorageAdapter(userId) accepting userId parameter"
    - path: "src/contexts/StorageAdapterContext.tsx"
      provides: "Passes userId to createStorageAdapter()"
  key_links:
    - from: "src/lib/supabaseClient.ts"
      to: "src/contexts/AuthContext.tsx"
      via: "hasPersistedSession() called in useState initializer"
      pattern: "hasPersistedSession"
    - from: "src/contexts/AuthContext.tsx"
      to: "src/components/LandingNav.tsx"
      via: "likelyAuthenticated consumed from useAuth()"
      pattern: "likelyAuthenticated"
    - from: "src/contexts/StorageAdapterContext.tsx"
      to: "src/lib/storage/index.ts"
      via: "createStorageAdapter(userId) call"
      pattern: "createStorageAdapter\\(userId\\)"
---

<objective>
Eliminate perceived loading delays for authenticated users navigating from landing page to dashboard.

Purpose: Authenticated users currently see a flash of "Sign In / Sign Up" on the landing page while auth loads (~200-400ms), then wait through redundant `getUser()` calls during adapter creation (~600ms). This plan removes both issues using synchronous localStorage session detection and eliminating redundant network calls.

Output: Instant "Go to App" button for returning users, ~600ms faster adapter initialization, smoother RequireAuth loading state.
</objective>

<execution_context>
@C:/Users/2supe/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/2supe/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/supabaseClient.ts
@src/contexts/AuthContext.tsx
@src/components/LandingNav.tsx
@src/components/auth/RequireAuth.tsx
@src/lib/storage/index.ts
@src/lib/storage/types.ts
@src/lib/storage/supabaseAdapter.ts
@src/contexts/StorageAdapterContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add synchronous session detection and update UI consumers</name>
  <files>
    src/lib/supabaseClient.ts
    src/contexts/AuthContext.tsx
    src/components/LandingNav.tsx
    src/components/auth/RequireAuth.tsx
  </files>
  <action>
**1. src/lib/supabaseClient.ts** — Add `hasPersistedSession()` function after the existing helper functions (after line 143):

```typescript
/**
 * Synchronous check for persisted Supabase session in localStorage.
 * Used for optimistic UI (showing "Go to App" instantly) — NOT for security decisions.
 * The actual auth state is still resolved async by supabase.auth.getSession().
 */
export function hasPersistedSession(): boolean {
  try {
    const stored = localStorage.getItem('sb-hupdhjdasqgfcabaiiwa-auth-token');
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    // Check that access_token exists and expiry is in the future
    if (!parsed?.access_token || !parsed?.expires_at) return false;
    return parsed.expires_at > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
```

This is a pure synchronous read — no network call, no Supabase API. Returns true only if a non-expired session token exists in localStorage.

**2. src/contexts/AuthContext.tsx** — Expose `likelyAuthenticated` on the context:

- Import `hasPersistedSession` from `@/lib/supabaseClient`
- Add `likelyAuthenticated: boolean` to the `AuthContextType` interface
- Compute it: while `loading` is true, use `hasPersistedSession()` result (computed once via lazy `useState` initializer). Once `loading` is false, use `!!user`.
- Add to context value object.

Implementation pattern:
```typescript
const [optimisticAuth] = useState(() => hasPersistedSession());
// ...
const likelyAuthenticated = loading ? optimisticAuth : !!user;
```

This gives immediate `true` for returning users while auth resolves, then settles to the real value.

**3. src/components/LandingNav.tsx** — Use `likelyAuthenticated` instead of `user` for button text:

- Destructure `likelyAuthenticated` from `useAuth()` (alongside existing `user`)
- Change button text from `{user ? 'Go to App' : 'Sign In / Sign Up'}` to `{likelyAuthenticated ? 'Go to App' : 'Sign In / Sign Up'}`
- Keep `handleAuthClick` using `user` (not `likelyAuthenticated`) for the actual navigation decision — if auth hasn't resolved yet and they click, navigate to `/dashboard` and let RequireAuth handle it. Actually, use `likelyAuthenticated` for navigation too since RequireAuth will gate access anyway.

Updated handler:
```typescript
const handleAuthClick = () => {
  if (likelyAuthenticated) {
    navigate('/dashboard');
  } else {
    navigate('/auth');
  }
};
```

**4. src/components/auth/RequireAuth.tsx** — Show minimal loading when `likelyAuthenticated`:

- Destructure `likelyAuthenticated` from `useAuth()`
- When `loading` is true AND `likelyAuthenticated` is true: render a minimal translucent overlay instead of the full-screen branded spinner. This prevents layout shift — just show `{children}` isn't possible since children need auth data, so show a minimal empty container that matches dashboard dimensions:

```tsx
if (loading) {
  if (likelyAuthenticated) {
    // Minimal loading: session likely exists, avoid full-screen spinner
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50" />
      )
    );
  }
  // Full loading state for unknown auth
  return (
    fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* existing spinner JSX */}
      </div>
    )
  );
}
```

This way returning users see a plain gray background flash (matching dashboard bg) instead of the branded spinner with "Checking authentication..." text. Much less jarring.
  </action>
  <verify>
1. `npm run lint` passes with no new errors
2. `npm run build` succeeds
3. Manual test: Open app in incognito (no session) → landing page shows "Sign In / Sign Up" immediately (no flash of "Go to App")
4. Manual test: Log in, navigate to landing → "Go to App" shows immediately on page load (no flash of "Sign In / Sign Up")
5. Manual test: Click "Go to App" → dashboard loads, RequireAuth shows plain bg-gray-50 briefly (not branded spinner)
6. Manual test: Clear localStorage manually while on landing → shows "Sign In / Sign Up"
  </verify>
  <done>
Returning authenticated users see "Go to App" on first render of the landing page with zero flash of "Sign In / Sign Up". RequireAuth shows a minimal loading state (plain background) instead of the branded spinner when a session likely exists. Unauthenticated users see "Sign In / Sign Up" immediately and the full spinner on protected routes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Eliminate redundant getUser() calls in adapter creation</name>
  <files>
    src/lib/storage/index.ts
    src/contexts/StorageAdapterContext.tsx
  </files>
  <action>
**1. src/lib/storage/index.ts** — Update `createStorageAdapter()` to accept an optional `userId` parameter:

```typescript
export async function createStorageAdapter(userId?: string): Promise<StorageAdapter | null> {
  try {
    // Use provided userId (from AuthContext) to skip redundant getUser() call
    const resolvedUserId = userId ?? await getCurrentUserId();

    if (resolvedUserId) {
      const adapter = new SupabaseAdapter();
      // Skip isReady() check — it just calls getCurrentUserId() again,
      // which is redundant since we already confirmed userId exists.
      // The adapter is ready if the user is authenticated.
      return adapter;
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase adapter:', error);
    throw error;
  }

  return null;
}
```

Key changes:
- Accept optional `userId` parameter; fall back to `getCurrentUserId()` only if not provided (backward compat)
- Remove `adapter.isReady()` call entirely — it just calls `getCurrentUserId()` a second time. The adapter is a stateless wrapper around Supabase client; if we have a userId, it's ready.
- This eliminates 2 redundant `supabase.auth.getUser()` network calls (~300ms each)

**2. src/contexts/StorageAdapterContext.tsx** — Pass `userId` to `createStorageAdapter()`:

Change line 43 from:
```typescript
createStorageAdapter()
```
to:
```typescript
createStorageAdapter(userId)
```

The `userId` variable already exists on line 18 (`const userId = user?.id ?? null`) and is guaranteed non-null at this point (guarded by the `if (!userId)` check on line 30). So this is a simple one-line change: pass the userId we already have.

This is safe because:
- `userId` is derived from `user?.id` which comes from `AuthContext` (already verified by Supabase auth)
- The guard on line 30 ensures we only reach `createStorageAdapter(userId)` when userId is non-null
- Pass `userId` with non-null assertion or use the guard: since TypeScript knows userId could be null at declaration, but the control flow guard ensures it's string at call site, pass `userId!` or restructure slightly. Simplest: `createStorageAdapter(userId!)` with a comment referencing the guard above.
  </action>
  <verify>
1. `npm run lint` passes
2. `npm run build` succeeds
3. Open browser DevTools → Network tab → filter by `auth` or `user`
4. Navigate to dashboard: should see only ONE `getUser` or `getSession` call (from AuthContext), NOT the additional 2 from adapter creation
5. Prompts still load correctly after adapter initializes
6. Sign out → sign in → prompts load (adapter creation still works with auth flow)
  </verify>
  <done>
`createStorageAdapter()` accepts the known userId from AuthContext and skips the 2 redundant `supabase.auth.getUser()` network calls. Adapter initialization is ~600ms faster. No behavioral change — same adapter, same auth checks, just no redundant network round-trips.
  </done>
</task>

</tasks>

<verification>
1. `npm run lint && npm run build` — zero errors
2. Cold start (incognito): Landing shows "Sign In / Sign Up" instantly, protected routes show branded spinner, redirect to /auth works
3. Warm start (returning user): Landing shows "Go to App" instantly (frame 1), RequireAuth shows minimal loading (plain bg), dashboard loads with only 1 auth network call
4. Network tab: Only 1 `getUser`/`getSession` call per page load (from AuthContext), not 3
5. Sign out → landing shows "Sign In / Sign Up" immediately (localStorage cleared by Supabase signOut)
6. Expired session in localStorage → `hasPersistedSession()` returns false → shows "Sign In / Sign Up"
</verification>

<success_criteria>
- Zero flash of wrong button state on landing page for authenticated users
- ~600ms reduction in time-to-interactive on dashboard (2 fewer getUser() calls)
- No security regression: RequireAuth still redirects if auth actually fails
- All existing tests/lint/build pass
</success_criteria>

<output>
After completion, create `.planning/quick/1-prefetch-auth-and-prompt-data-on-landing/1-SUMMARY.md`
</output>
