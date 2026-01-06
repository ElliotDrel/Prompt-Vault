# Copy Button Performance Optimization

## 🎯 Goal

Eliminate the ~580ms delay when clicking the "Copy" button in the History tab's View dialog by reducing database roundtrips and implementing optimistic UI updates.

## 📋 Current State & Problem

**User Experience Issue:**
- Click handler takes ~580ms minimum before success toast appears
- Chrome DevTools shows performance violations:
  - `[Violation] 'click' handler took <N>ms`
  - `[Violation] Forced reflow while executing JavaScript took <N>ms`

**Technical Root Cause:**

The copy operation in `handleCopyHistoryEvent` (CopyHistory.tsx:47-73) performs 4 sequential database roundtrips:

| Step | Operation | Location | Roundtrips | State Updates |
|------|-----------|----------|------------|---------------|
| 1 | Fetch current prompt | supabaseAdapter.ts:175 | 1 DB call | 0 |
| 2 | Update `times_used` | supabaseAdapter.ts:177-183 | 1 DB call | 0 |
| 3 | Update prompts state | PromptsContext.tsx:226 | 0 | 1 re-render |
| 4 | Reload stats | PromptsContext.tsx:227 | 1 DB call | 1 re-render |
| 5 | Insert copy event | addCopyEvent | 1 DB call | 0 |
| 6 | Update history state | CopyHistoryContext.tsx:110 | 0 | 1 re-render |
| **TOTAL** | | | **4 roundtrips** | **3 re-renders** |

**Performance Calculation:** 4 × 100ms (avg DB latency) + 3 × 50ms (re-render overhead) = ~550-650ms

## 🏗️ Architecture Changes

### Current Flow

```
User clicks Copy
    ↓
copyToClipboard (fast)
    ↓
Promise.all([
  incrementCopyCount() → no-op
  incrementPromptUsage() → read-then-write (2 DB calls) → loadStats (1 DB call)
])
    ↓
addCopyEvent() → insert (1 DB call)
    ↓
toast.success (finally!)
```

### Optimized Flow (Phase 1)

```
User clicks Copy
    ↓
Optimistically update local state (instant)
    ↓
toast.success (instant feedback!)
    ↓
Background: DB operations + realtime sync confirms
```

### Optimized Flow (Phase 2)

```
Same as Phase 1, but:
- incrementPromptUsage uses atomic RPC (1 DB call instead of 2)
- Total roundtrips: 2 instead of 4
```

## 🔄 Implementation Phases

### **Phase 1: Optimistic Updates** (Quick Win - No Migrations)

Implement client-side optimistic updates to provide instant feedback while background operations complete.

#### Step 1.1: Remove Redundant Stats Reload

**File:** `src/contexts/PromptsContext.tsx`

**Location:** Line 227 within `incrementPromptUsage` callback

**Change:**
- Remove the `await loadStats(adapter);` line after prompt update
- Rationale: The `prompt_stats` view automatically recomputes when `prompts.times_used` changes
- Realtime subscription (PromptsContext.tsx:112-116) already triggers background stats refresh
- This eliminates 1 unnecessary DB roundtrip

#### Step 1.2: Add Optimistic State Updates

**File:** `src/contexts/PromptsContext.tsx`

**Location:** Lines 216-233 (entire `incrementPromptUsage` function)

**Changes:**
1. Before calling adapter method, store current state in rollback variables
2. Immediately update `prompts` array (increment `times_used` for target prompt)
3. Immediately update `stats` object (increment `totalPromptUses`)
4. Await server confirmation from adapter
5. On success: update with server-confirmed data
6. On error: rollback optimistic changes and throw

**Pattern Reference:** Similar to existing `addCopyEvent` optimistic update (CopyHistoryContext.tsx:110)

**Key Implementation Details:**
- Store `previousPrompts` and `previousStats` before optimistic update
- Use functional state updaters: `setPrompts((prev) => ...)`
- Increment `times_used` using `(prompt.times_used ?? 0) + 1`
- Increment `totalPromptUses` using `(prev?.totalPromptUses ?? 0) + 1`
- Wrap server call in try/catch with rollback in catch block
- Remove `loadStats` dependency from useCallback deps array

**User Experience Impact:**
- Toast appears instantly (~10ms)
- Stats counter updates immediately
- Background sync confirms with realtime subscription

---

### **Phase 2: Atomic Database Operations** (Requires Migration)

Replace read-then-write pattern with atomic PostgreSQL RPC function.

#### Step 2.1: Create RPC Migration

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_increment_prompt_usage_rpc.sql` (new)

**Objectives:**
- Create PostgreSQL function `increment_prompt_usage(p_id UUID, p_user_id UUID)`
- Use atomic `UPDATE ... SET times_used = COALESCE(times_used, 0) + 1`
- Return updated row using `RETURNING *`
- Grant execution to authenticated users

**SQL Pattern:**
```sql
CREATE OR REPLACE FUNCTION increment_prompt_usage(p_id UUID, p_user_id UUID)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY UPDATE prompts SET times_used = ... WHERE ... RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why This Works:**
- PostgreSQL handles atomic increment (no race conditions)
- Single UPDATE eliminates SELECT roundtrip
- `RETURNING *` provides updated row (no extra SELECT)
- RLS enforced via `user_id` parameter check
- `updated_at` trigger still fires automatically

#### Step 2.2: Update Adapter to Use RPC

**File:** `src/lib/storage/supabaseAdapter.ts`

**Location:** Lines 173-190 (`incrementPromptUsage` method)

**Changes:**
1. Remove `fetchPromptRowById` call (line 175)
2. Replace `.update()` PostgREST call with `.rpc()` call:
   ```typescript
   const { data, error } = await supabase
     .rpc('increment_prompt_usage', { p_id: id, p_user_id: userId })
     .single();
   ```
3. Keep error handling and `mapPromptRow` mapping unchanged

**Performance Impact:** Reduces 2 DB roundtrips to 1 (50% improvement for this operation)

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/YYYYMMDDHHMMSS_create_increment_prompt_usage_rpc.sql` | PostgreSQL RPC function for atomic increment |

## 📝 Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `src/contexts/PromptsContext.tsx` | 216-233 | Add optimistic updates with rollback; remove `loadStats` call |
| `src/lib/storage/supabaseAdapter.ts` | 173-190 | Replace read-then-write with RPC call |

## ✅ Testing Checklist

### Phase 1 Verification

- [ ] **Instant Feedback:** Toast appears immediately when copying from history
- [ ] **Stats Accuracy:** `times_used` and `totalPromptUses` increment correctly in UI
- [ ] **Database Sync:** Verify database shows correct `times_used` value after operation
- [ ] **Realtime Refresh:** Stats update via realtime subscription (not manual reload)
- [ ] **Error Handling:** Simulate DB failure → verify rollback restores previous state
- [ ] **Race Conditions:** Rapid clicks don't cause incorrect counts
- [ ] **Console Clean:** No new errors or warnings in browser console

### Phase 2 Verification

- [ ] **RPC Execution:** `increment_prompt_usage` function executes successfully
- [ ] **RLS Enforcement:** Cannot increment prompts owned by other users (test with 2 accounts)
- [ ] **Trigger Preservation:** `updated_at` column still updates automatically
- [ ] **Concurrent Safety:** Multiple tabs incrementing same prompt produces correct count
- [ ] **Error Messages:** Failures return meaningful error messages
- [ ] **Realtime Compatibility:** Realtime subscriptions still trigger on changes
- [ ] **Migration Safety:** `npx supabase db push` succeeds without errors

### Integration Testing

- [ ] Copy from PromptCard still works
- [ ] Copy from PromptView still works
- [ ] Copy from CopyHistory still works
- [ ] All three use optimized path
- [ ] Chrome DevTools shows no performance violations

## 📊 Performance Comparison

| Implementation | DB Roundtrips | Perceived Delay | Improvement |
|----------------|---------------|-----------------|-------------|
| **Current (Baseline)** | 4 | ~580ms | - |
| **Phase 1 Only** | 3 | ~10ms (optimistic) | **98% faster UX** |
| **Phase 1 + Phase 2** | 2 | ~10ms (optimistic) | **98% faster UX + 33% backend efficiency** |

## 🚨 Risk Assessment

### Low Risk Changes

| Change | Risk | Mitigation |
|--------|------|------------|
| Remove `loadStats` call | Low | Realtime subscription already handles this; tested pattern in codebase |
| Optimistic prompts update | Low | Rollback logic prevents data inconsistency; matches existing patterns |
| Adapter RPC update | Low | Drop-in replacement; same interface, better implementation |

### Medium Risk Changes

| Change | Risk | Mitigation |
|--------|------|------------|
| PostgreSQL RPC function | Medium | Thoroughly test RLS, triggers, concurrency; add migration rollback script |
| Optimistic stats update | Medium | Complex state object; validate all consumers handle optimistic updates |

### Rollback Plan

**Phase 1 Rollback:**
1. Restore `await loadStats(adapter);` line in PromptsContext.tsx:227
2. Remove optimistic update code (revert to await-then-update pattern)
3. Clear browser cache to reset any stale state

**Phase 2 Rollback:**
1. Create new migration that drops RPC function: `DROP FUNCTION IF EXISTS increment_prompt_usage;`
2. Restore read-then-write adapter code
3. Run `npx supabase db push`

## 📌 Key Decisions

### Why Optimistic Updates?

- **User Expectation:** Copy operations should feel instant (clipboard APIs are ~1ms)
- **Existing Pattern:** `addCopyEvent` already uses optimistic prepend successfully
- **Failure Recovery:** Rollback mechanism ensures data consistency even if server fails
- **Progressive Enhancement:** Works with or without Phase 2

### Why RPC Instead of Native UPDATE?

- **PostgREST Limitation:** Supabase `.update()` doesn't support SQL expressions like `times_used + 1`
- **Atomic Guarantee:** PostgreSQL RPC prevents lost updates from concurrent increments
- **Performance:** 50% reduction in roundtrips for increment operation
- **Precedent:** Existing `update_updated_at_column` trigger shows PL/pgSQL pattern

### Why Not Just Remove All Stats Reloads?

- Optimistic updates need coordinated state changes across prompts + stats
- Different operations modify different stats (prompts count, copies count, usage count)
- Realtime subscriptions handle eventual consistency, optimistic updates handle immediate feedback

## 🔗 Related Files Reference

**Copy Flow Entry Points:**
- `src/pages/CopyHistory.tsx` (lines 47-73) - handleCopyHistoryEvent
- `src/components/PromptCard.tsx` (lines 84-94) - handleCopy
- `src/components/PromptView.tsx` (lines 130-133, 183-186) - handleCopy

**State Management:**
- `src/contexts/PromptsContext.tsx` (lines 70-80, 216-233) - loadStats, incrementPromptUsage
- `src/contexts/CopyHistoryContext.tsx` (lines 101-116) - addCopyEvent

**Database Layer:**
- `src/lib/storage/supabaseAdapter.ts` (lines 173-190, 290-293) - incrementPromptUsage, incrementCopyCount
- `supabase/migrations/20260104000002_update_prompt_stats_view.sql` - Stats view schema

## ✨ Success Criteria

- ✅ Chrome DevTools Performance tab shows no violations for copy operation
- ✅ Click handler execution time <100ms
- ✅ User sees toast notification within 50ms of click
- ✅ Database `times_used` increments correctly (verified via Supabase dashboard)
- ✅ No race conditions with rapid or concurrent copies
- ✅ Error handling preserves data integrity (rollback on failure)
- ✅ Realtime sync works across multiple browser tabs
- ✅ All existing copy functionality unchanged (PromptCard, PromptView, CopyHistory)
