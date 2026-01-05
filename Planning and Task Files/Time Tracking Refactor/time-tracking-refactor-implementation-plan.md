# Time Tracking Refactor: Database-to-Frontend Calculation Migration

**Created:** 2026-01-04
**Status:** Planning
**Target Branch:** `feature/frontend-time-calculation`

---

## 🎯 Goal

Migrate time-saved calculations from database storage (accumulated values) to frontend computation (dynamic calculation using `timesUsed × multiplier`). This reduces database writes, makes the multiplier configurable, and simplifies data models.

---

## 📋 Current Architecture

### Existing Behavior
- **Database:** `prompts.time_saved_minutes` column accumulates +5 minutes on every prompt copy
- **Storage Adapters:** Both Supabase and localStorage increment `time_saved_minutes` in `incrementPromptUsage()` and `incrementCopyCount()`
- **UI Display:** Two components show time saved:
  - `PromptCard.tsx` (line 202): Shows per-prompt `prompt.timeSavedMinutes`
  - `StatsCounter.tsx` (lines 33-37): Shows total `stats.timeSavedMinutes`
- **Hardcoded Value:** Multiplier of 5 minutes is hardcoded in 4 locations across adapters

### Problems with Current Design
1. **Inflexible:** Cannot change multiplier without database migration
2. **Write-Heavy:** Every copy operation writes to database twice (copy_count + time_saved)
3. **Duplicated Logic:** Same "+5" hardcoded in 4 different adapter methods
4. **Not Future-Proof:** No way to customize multiplier per user or prompt type

---

## 🏗️ Target Architecture

### New Behavior
- **Database:** Remove `time_saved_minutes` column; store multiplier in `user_settings` table
- **View Integration:** `prompt_stats` view includes `time_saved_multiplier` via JOIN with `user_settings`
- **Frontend Calculation:**
  - Per-prompt: `(prompt.timesUsed || 0) × stats.timeSavedMultiplier`
  - Total stats: `(stats.totalPromptUses || 0) × stats.timeSavedMultiplier`
- **Default Multiplier:** 5 minutes (initialized automatically for all users)

### Benefits
1. **Configurable:** Multiplier stored in database, ready for future UI controls
2. **Fewer Writes:** Removes time_saved_minutes updates from every copy operation
3. **Consistent:** Single source of truth for multiplier value
4. **Efficient:** View aggregates `SUM(times_used)` already; no iteration needed

## 📝 Implementation Steps

### Phase 1: Database Schema Changes

**Objective:** Add `user_settings` table and update `prompt_stats` view without breaking existing code.

#### Step 1.1: Create Migration Files
Create three migration files in `supabase/migrations/`:

1. **`20260104000001_create_user_settings_table.sql`**
   - Create `user_settings` table with columns:
     - `user_id` (UUID, PRIMARY KEY, references auth.users)
     - `time_saved_multiplier` (INTEGER, default 5)
     - `created_at`, `updated_at` (TIMESTAMPTZ)
   - Enable Row Level Security (RLS)
   - Add policies: SELECT, INSERT, UPDATE (users can only access their own settings)
   - Create trigger function `initialize_user_settings()` to auto-create settings on user signup
   - Backfill settings for all existing users with multiplier = 5

2. **`20260104000002_update_prompt_stats_view.sql`**
   - Drop existing `prompt_stats` view
   - Recreate view with additional JOIN to `user_settings`
   - Add `total_prompt_uses` column: `SUM(p.times_used)`
   - Add `time_saved_multiplier` column: `COALESCE(us.time_saved_multiplier, 5)`
   - Keep existing columns: `total_prompts`, `total_copies`

3. **`20260104000003_remove_time_saved_minutes.sql`**
   - Drop `time_saved_minutes` column from `prompts` table
   - **⚠️ Run ONLY after code deployment to avoid breaking changes**

#### Step 1.2: Apply Migrations
```bash
npx supabase db push
npx supabase gen types typescript --linked > src/types/supabase-generated.ts
```

### Phase 2: TypeScript Type Updates

**Objective:** Remove `timeSavedMinutes` from data models and add new stats fields.

#### Step 2.1: Update Core Interfaces

**File:** `src/types/prompt.ts`
- Remove property: `timeSavedMinutes?: number`
- Keep: `timesUsed?: number` (still needed for frontend calculations)

**File:** `src/lib/storage/types.ts`
- Update `StatsStorageAdapter.getStats()` return type:
  - **Add:** `totalPromptUses: number` (sum of all prompts' timesUsed)
  - **Add:** `timeSavedMultiplier: number` (from user_settings)
  - **Remove:** `timeSavedMinutes: number`

#### Step 2.2: Update Context Interface

**File:** `src/contexts/PromptsContext.tsx` (lines ~16-20)
- Update `stats` object in context interface:
  ```typescript
  stats: {
    totalPrompts: number;
    totalCopies: number;
    totalPromptUses: number;     // ADD
    timeSavedMultiplier: number; // REPLACE timeSavedMinutes
  };
  ```
- Update `defaultStats` initialization (lines ~29-33) to match

### Phase 3: Supabase Adapter Updates

**Objective:** Remove all `time_saved_minutes` writes and add multiplier to stats response.

**File:** `src/lib/storage/supabaseAdapter.ts`

#### Step 3.1: Remove time_saved_minutes from CRUD Operations

**Location: Line ~34 (`mapPromptRow` function)**
- Remove `time_saved_minutes` from row-to-Prompt mapping
- Keep `times_used` mapping intact

**Location: Line ~96 (`addPrompt` method)**
- Remove `time_saved_minutes: promptData.timeSavedMinutes ?? 0` from insert payload
- Remove conditional check for `timeSavedMinutes`

**Location: Line ~128 (`updatePrompt` method)**
- Remove `time_saved_minutes` from update payload
- Remove conditional check: `if (typeof promptData.timeSavedMinutes === 'number')`

#### Step 3.2: Simplify incrementPromptUsage

**Location: Lines 179-201**
- **Before:** Updates both `times_used` (+1) and `time_saved_minutes` (+5)
- **After:** Only update `times_used` field
- Change: `update({ times_used: (currentPrompt.times_used ?? 0) + 1 })`

#### Step 3.3: Update getStats to Return Multiplier

**Location: Lines 272-302**
- Change return type signature (add `totalPromptUses` and `timeSavedMultiplier`)
- Map view columns to new interface:
  - `total_prompt_uses` → `totalPromptUses`
  - `time_saved_multiplier` → `timeSavedMultiplier`
- Default fallback: `timeSavedMultiplier: 5` if no settings found

### Phase 4: LocalStorage Adapter Updates

**Objective:** Mirror Supabase changes for localStorage fallback mode.

**File:** `src/lib/storage/localStorageAdapter.ts`

#### Step 4.1: Add User Settings Support

**Location: Line ~8 (STORAGE_KEYS constant)**
- Add new key: `USER_SETTINGS: 'userSettings'`

**Add new helper function (after STORAGE_KEYS):**
```typescript
interface UserSettings {
  timeSavedMultiplier: number;
}

function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) return JSON.parse(stored);
    const defaultSettings: UserSettings = { timeSavedMultiplier: 5 };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch {
    return { timeSavedMultiplier: 5 };
  }
}
```

#### Step 4.2: Remove time_saved_minutes from Operations

**Location: Line ~20 (`withPromptDefaults` helper)**
- Remove `timeSavedMinutes` field initialization

**Location: Lines 115-136 (`incrementPromptUsage` method)**
- Remove line: `timeSavedMinutes: (prompt.timeSavedMinutes ?? 0) + 5`
- Keep only: `timesUsed` increment and `updatedAt` timestamp

**Location: Lines 200-208 (`incrementCopyCount` method)**
- Remove `timeSavedMinutes` from stats update
- Update only: `totalCopies`

#### Step 4.3: Update getStats to Return Multiplier

**Location: Lines 175-198**
- Call `getUserSettings()` to get multiplier
- Compute `totalPromptUses` by reducing over prompts array: `prompts.reduce((sum, p) => sum + (p.timesUsed ?? 0), 0)`
- Return object with `totalPromptUses` and `timeSavedMultiplier`

### Phase 5: Frontend Component Updates

**Objective:** Replace static time values with dynamic calculations.

#### Step 5.1: Update PromptCard Component

**File:** `src/components/PromptCard.tsx`

**Location: After line 49 (inside component, before return)**
- Add local calculation:
  ```typescript
  const timeSavedMinutes = (prompt.timesUsed || 0) * stats.timeSavedMultiplier;
  ```

**Location: Line 202 (display area)**
- **Before:** `<span>Saved {formatTime(prompt.timeSavedMinutes || 0)}</span>`
- **After:** `<span>Saved {formatTime(timeSavedMinutes)}</span>`

#### Step 5.2: Update StatsCounter Component

**File:** `src/components/StatsCounter.tsx`

**Location: After line 7 (inside component, before formatTime)**
- Add total calculation:
  ```typescript
  const totalTimeSaved = (stats.totalPromptUses || 0) * stats.timeSavedMultiplier;
  ```

**Location: Lines 32-37 (statsData array, 'time' entry)**
- Change `value` from `formatTime(stats.timeSavedMinutes)` to `formatTime(totalTimeSaved)`
- Update explanation text to use dynamic multiplier: `` `On average, you would spend ${stats.timeSavedMultiplier} minutes...` ``

#### Step 5.3: Clean Up Sample Data

**File:** `src/data/samplePrompts.ts`
- Remove `timeSavedMinutes` property from all three sample prompts (lines 12, 22, 32)

## 🔄 Deployment Strategy

**CRITICAL**: Follow this 3-stage approach to avoid breaking changes:

### Stage 1: Database Foundation (Non-Breaking ✅)
1. Run migration 1: Create `user_settings` table
2. Run migration 2: Update `prompt_stats` view (adds columns, keeps old ones)
3. Regenerate TypeScript types from remote schema
4. **Result:** Database ready, old code still works

### Stage 2: Code Deployment (Breaking - Deploy Together ⚠️)
5. Update all TypeScript interfaces and types
6. Update both storage adapters (Supabase + localStorage)
7. Update context and components
8. Run `npm run lint` and `npm run build`
9. Deploy to production
10. **Result:** New code live, using new fields

### Stage 3: Database Cleanup (After Verification ✅)
11. Wait 24-48 hours, monitor for issues
12. Run migration 3: Drop `time_saved_minutes` column
13. **Result:** Clean database schema

---

## ✅ Testing & Verification

### Pre-Deployment Testing

**Build Verification**
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` succeeds
- [ ] TypeScript compilation clean (no `any` types or suppressions)
- [ ] No console errors in development mode

**Functional Testing (Authenticated Mode)**
- [ ] Copy a prompt → `times_used` increments by 1
- [ ] PromptCard displays time saved correctly: `timesUsed × 5`
- [ ] StatsCounter shows total time saved: `sum of all times_used × 5`
- [ ] Stats update after copy operation
- [ ] Multiplier value is 5 (default)

**Functional Testing (Unauthenticated Mode)**
- [ ] Copy a prompt → localStorage updates `times_used`
- [ ] StatsCounter shows time saved using localStorage data
- [ ] Default multiplier (5) is used
- [ ] Switching to authenticated mode syncs correctly

**Database Verification**
- [ ] New users have `user_settings` row created automatically (check via Supabase dashboard)
- [ ] Existing users have settings backfilled with multiplier = 5
- [ ] `prompt_stats` view returns `time_saved_multiplier` column
- [ ] `prompt_stats` view returns `total_prompt_uses` column

### Post-Deployment Verification

**Production Smoke Test**
- [ ] Load dashboard → stats display correctly
- [ ] Copy any prompt → no errors in console
- [ ] Refresh page → time saved values persist
- [ ] Check Supabase logs → no query errors

**Rollback Readiness**
- [ ] Previous commit tagged and ready
- [ ] Database migration 3 NOT yet applied (can revert code without DB changes)
- [ ] Backup of current production database taken

## 📊 Files Modified

### Database Schema (3 new migrations)
| File | Purpose | Breaking? |
|------|---------|-----------|
| `supabase/migrations/20260104000001_create_user_settings_table.sql` | Create settings table with multiplier | No |
| `supabase/migrations/20260104000002_update_prompt_stats_view.sql` | Update view with JOIN to settings | No |
| `supabase/migrations/20260104000003_remove_time_saved_minutes.sql` | Drop obsolete column | Yes (run last) |

### TypeScript Types (2 files)
- `src/types/prompt.ts` - Remove `timeSavedMinutes` from Prompt interface
- `src/lib/storage/types.ts` - Update StatsStorageAdapter return type

### Storage Layer (2 adapters)
- `src/lib/storage/supabaseAdapter.ts` - 5 methods modified:
  - `mapPromptRow()` - Remove time_saved_minutes mapping
  - `addPrompt()` - Remove time_saved_minutes from insert
  - `updatePrompt()` - Remove time_saved_minutes from update
  - `incrementPromptUsage()` - Only update times_used
  - `getStats()` - Return multiplier and totalPromptUses

- `src/lib/storage/localStorageAdapter.ts` - 4 methods modified + 1 helper added:
  - `getUserSettings()` - NEW helper function
  - `incrementPromptUsage()` - Remove timeSavedMinutes update
  - `incrementCopyCount()` - Remove timeSavedMinutes update
  - `getStats()` - Return multiplier and compute totalPromptUses

### Application Layer (3 files)
- `src/contexts/PromptsContext.tsx` - Update stats interface
- `src/components/PromptCard.tsx` - Add frontend calculation
- `src/components/StatsCounter.tsx` - Add frontend calculation

### Sample Data (1 file)
- `src/data/samplePrompts.ts` - Remove timeSavedMinutes from 3 prompts

## 🚨 Rollback Strategy

### If Issues in Stage 2 (Code Deployment)

**Quick Rollback (Recommended)**
1. Revert to previous commit or tagged release
2. Redeploy application
3. Database compatible (migration 3 not yet run)
4. **Downtime:** <5 minutes

### If Issues in Stage 3 (After Column Dropped)

**Emergency Database Recovery**

Create rollback migration:
```bash
npx supabase migration new emergency_restore_time_saved
```

Migration actions:
- Re-add `time_saved_minutes` column (INTEGER, default 0)
- Backfill values: `UPDATE prompts SET time_saved_minutes = times_used * 5`
- Revert `prompt_stats` view to previous structure
- **Downtime:** ~10-15 minutes

---

## 🎯 Design Decisions

### Why Frontend Calculation?

**Current Problem:** Time values stored in database make multiplier changes require data migration.

**Solution:** Calculate `timesUsed × multiplier` on-the-fly in components.

**Trade-offs:**
- ✅ Multiplier changes take effect instantly (no migration)
- ✅ Fewer database writes per copy operation
- ✅ Single source of truth for multiplier value
- ⚠️ Adds trivial computation to render (negligible cost: <1ms)

### Why user_settings Table vs. Global Config?

**Decision:** Per-user settings table instead of application-wide constant.

**Rationale:**
1. Enables future per-user customization (Phase 2 roadmap item)
2. Supports A/B testing different multipliers across user cohorts
3. Aligns with existing RLS security model (user-scoped data)
4. Minimal overhead (1 row per user, PRIMARY KEY index)

### Why Keep times_used Counter?

**Decision:** Preserve `times_used`, remove only `time_saved_minutes`.

**Rationale:**
- `times_used` is atomic counter (source of truth for copy events)
- Required for calculation: `timesUsed × multiplier`
- Powers analytics and "popular prompts" features
- Not derivable from other data (copy_events tracks different metric)

---

## ✨ Success Criteria

**Implementation complete when:**

- [ ] All quality gates pass (`npm run lint`, `npm run build`)
- [ ] Both storage modes work (authenticated + unauthenticated)
- [ ] Time saved calculations accurate (`timesUsed × 5`)
- [ ] Copy operations increment only `times_used`
- [ ] New users auto-initialize settings (multiplier = 5)
- [ ] Zero TypeScript errors or console warnings
- [ ] Stats refresh correctly after operations
- [ ] Supabase query logs clean (no errors)

**Post-deployment validation (24-48 hours):**
- No calculation errors reported by users
- Error logs show no spikes
- Stats remain consistent across sessions
- Safe to proceed with migration 3 (column drop)

---

## 📚 Future Enhancements

This architecture supports upcoming features:

1. **Settings UI** - User-adjustable multiplier (5-60 minute range)
2. **Smart Multipliers** - Auto-calculate based on prompt complexity
3. **Per-Prompt Values** - Different multipliers for different prompt types
4. **Team Defaults** - Organization-wide multiplier settings
5. **Analytics Dashboard** - Track multiplier impact on engagement

---

## 📌 Summary

Migrate time-saved calculations from database storage (accumulated `time_saved_minutes`) to frontend computation (`timesUsed × multiplier`). Store configurable multiplier (default: 5) in new `user_settings` table, accessible via updated `prompt_stats` view. Benefits: fewer database writes, instant multiplier changes, cleaner data model, ready for future customization features.
