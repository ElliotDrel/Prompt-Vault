# Realtime Subscription Stability Implementation Plan
**Created:** 2026-01-04
**Status:** Planning

---

## dYZ_ Project Goal

Eliminate Supabase realtime subscription mismatches by ensuring a single, stable channel per topic per user session, while preserving existing realtime updates for prompts, copy events, and stats.

---

## dY"< Requirements

### Reliability
- No "mismatch between server and client bindings for postgres changes" errors
- Single active realtime channel per topic, per authenticated user
- Clean teardown on logout, auth changes, and React unmounts

### User Experience
- Prompts and copy history continue to refresh in real time
- No visible regressions in loading states or CRUD flows
- Console stays clean aside from expected dev logs (Vite/React/Vercel)

### Technical
- Adapter lifecycle is centralized (no per-context instantiation)
- Subscriptions are idempotent and safe under hot reloads
- Channel cleanup removes bindings from the realtime client, not just unsubscribes

---

## dY"< Current Architecture

### Existing Behavior
- `createStorageAdapter()` is called independently in multiple contexts
- Each call constructs a new `SupabaseAdapter` and subscribes to the same channel name
- `channel.unsubscribe()` is called, but the channel can remain cached by the realtime client

### Problems
1. Multiple adapters reuse the same channel topic with different bindings
2. HMR and auth changes can create stale bindings that the server rejects
3. Console errors obscure real issues and break realtime updates

---

## dY?-‹,? Target Architecture

### New Behavior
- A single shared storage adapter instance is created once and reused
- Realtime channels are unique per user session and removed on cleanup
- Subscriptions are created only once per adapter lifecycle

### Benefits
1. Prevents binding mismatches on the realtime server
2. Reduces redundant connections and subscription churn
3. Keeps all contexts in sync with the same realtime stream

---

## dY"? Files to Create

### `src/contexts/StorageAdapterContext.tsx`
Provide a top-level adapter provider to initialize and share one adapter instance:
- Initialize adapter once on app mount
- Expose `adapter`, `loading`, and `error` state via a hook
- Handle auth changes by reinitializing the adapter if needed

---

## dY"? Files to Modify

### `src/main.tsx` (or root provider entry)
- Wrap the app with `StorageAdapterProvider` so all contexts share the adapter

### `src/contexts/PromptsContext.tsx`
- Replace direct `createStorageAdapter()` usage with the shared adapter hook
- Guard subscription setup until the adapter is ready

### `src/contexts/CopyHistoryContext.tsx`
- Replace direct `createStorageAdapter()` usage with the shared adapter hook
- Guard subscription setup until the adapter is ready

### `src/lib/storage/supabaseAdapter.ts`
- Make `subscribe()` idempotent per adapter instance
- Remove channel using `supabase.removeChannel(channel)` during cleanup
- Use a user-scoped channel name to avoid collisions across auth sessions

### `src/lib/storage/index.ts`
- Keep `createStorageAdapter()` as the factory used by the provider
- Ensure it does not create multiple adapters per render path

---

## dY", Implementation Phases

### Phase 1: Centralize Adapter Lifecycle
1. Create `StorageAdapterContext` and provider
2. Initialize adapter once and expose via hook
3. Update root provider tree to use the new adapter provider

### Phase 2: Update Context Consumers
1. Refactor `PromptsContext` to use the shared adapter
2. Refactor `CopyHistoryContext` to use the shared adapter
3. Ensure subscriptions are created only after adapter readiness

### Phase 3: Harden Realtime Subscriptions
1. Update `SupabaseAdapter.subscribe()` to be idempotent
2. Ensure cleanup calls `supabase.removeChannel(channel)`
3. Scope channel name by `userId` to prevent cross-user collisions

### Phase 4: Verification and Cleanup
1. Verify realtime updates still fire for prompts and copy events
2. Confirm mismatch errors no longer appear
3. Document the new adapter lifecycle for future contributors

---

## ƒo. Testing Checklist

### Realtime Stability
- [ ] No "mismatch between server and client bindings" errors in console
- [ ] Realtime prompt updates still propagate across sessions
- [ ] Realtime copy history updates still propagate across sessions

### Auth and Lifecycle
- [ ] Login initializes a single adapter instance
- [ ] Logout tears down realtime channels cleanly
- [ ] Hot reload does not create duplicate subscriptions

### Regression Coverage
- [ ] Prompt CRUD flows unchanged
- [ ] Copy history flows unchanged
- [ ] Stats refresh still works

---

## dYs" Risk Mitigation

### Low Risk
- Introducing a shared adapter provider (isolated to context wiring)
- Channel name scoping by user (additive, no data changes)

### Medium Risk
- Rewiring subscription setup order (requires careful readiness checks)

### Rollback Plan
1. Revert contexts to call `createStorageAdapter()` directly
2. Remove the adapter provider wrapper
3. Restore previous `subscribe()` implementation

---

## dY"S Success Criteria

### Functional
- One active realtime channel per user session
- No subscription mismatch errors
- Realtime updates continue to work for prompts and copy events

### Quality
- No TypeScript errors
- No ESLint warnings
- Console remains clean in dev (aside from expected logs)

---

## dY"O Key Decisions from Discussion

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Adapter lifecycle | Shared provider instance | Prevents duplicate subscriptions |
| Channel cleanup | `removeChannel()` on teardown | Clears cached bindings |
| Channel naming | User-scoped topic | Avoids collisions across auth changes |

---

## dY"- Related Files Reference

### Core Files
- `src/lib/storage/supabaseAdapter.ts` - Realtime subscription logic
- `src/lib/storage/index.ts` - Adapter factory
- `src/contexts/PromptsContext.tsx` - Prompts subscription wiring
- `src/contexts/CopyHistoryContext.tsx` - Copy history subscription wiring

### Supporting Files
- `src/main.tsx` - Provider tree entry

---

## ƒo" Notes

- Vite, React DevTools, and Vercel Analytics logs are expected in development.
- The browser extension async listener error is out of scope for this fix.

---

**Status:** Ready for implementation ƒo.
