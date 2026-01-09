# Prompt Version History Implementation Plan

**Created:** 2026-01-09
**Status:** Ready for Implementation
**Complexity:** Medium-High
**Estimated Changes:** ~400-500 lines across 12+ files

---

## 🎯 Goal

Add Google Docs-style version history tracking for prompts, allowing users to view past versions with inline diff highlighting, see variable changes with visual badges, and revert to previous states without losing any history.

---

## 📋 Requirements

### Functional Requirements
- Track all changes to prompt title, body, and variables as discrete versions
- Display version history in a modal dialog with time-based grouping
- Show inline diff highlighting (green for additions, red for deletions)
- Display variable changes as chips with +/- badges
- Support reverting to any previous version
- Auto-save current state before revert (nothing ever lost)
- Treat initial prompt creation as version 1

### Non-Functional Requirements
- Tiered version consolidation to manage storage (granular recent → consolidated older)
- Background job for automatic consolidation (daily)
- Keep version history indefinitely (no retention limit)
- Paginated version fetching for prompts with extensive history

### UX Requirements
- History button visible in both view mode and edit mode
- Default diff view compares to previous version
- Toggle option to compare against current version
- Expandable time-based groups (Today, Yesterday, Last 7 days, monthly)
- Clear revert confirmation with explanation that current state will be saved

---

## 🏗️ Architecture

### Current State
- Prompts table stores only current state with `updated_at` timestamp
- No version tracking or change history exists
- Copy events capture snapshots but are separate from edit history

### Target Architecture

**New Table:** `prompt_versions`
- Stores immutable snapshots of prompt state at each edit
- Auto-incrementing version numbers per prompt
- Consolidation metadata for grouping older versions
- RLS policies matching existing prompt security model

**Data Flow:**
```
User Edits Prompt
       ↓
Adapter fetches current state BEFORE update
       ↓
If title/body/variables changed → Create version snapshot of OLD state
       ↓
Apply update to prompts table
       ↓
User sees updated prompt (version history grows silently)
```

**Consolidation Strategy:**
- Last 24 hours: Keep all individual versions
- 24h to 7 days: Consolidate to ~1 version per hour of activity
- Older than 7 days: Consolidate to ~1 version per day of activity
- Always preserve first and last version of each consolidated period

---

## 📝 Implementation Steps

### Phase 1: Database Schema

**Objective:** Create the version tracking infrastructure

#### Step 1.1: Create `prompt_versions` Table
- File: `supabase/migrations/YYYYMMDDHHMMSS_create_prompt_versions_table.sql`
- Columns: `id`, `prompt_id`, `user_id`, `version_number`, `title`, `body`, `variables`, `is_consolidated`, `consolidation_group_id`, `original_created_at`, `created_at`
- Unique constraint on `(prompt_id, version_number)`
- Foreign key to `prompts(id)` with CASCADE delete
- Indexes on `prompt_id`, `user_id`, `created_at DESC`, `consolidation_group_id`

#### Step 1.2: Create RLS Policies
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`
- No UPDATE policy (versions are immutable)

#### Step 1.3: Create Database Functions
- `create_prompt_version(prompt_id, title, body, variables)` — Creates version with auto-incrementing version_number
- `get_prompt_versions(prompt_id, offset, limit)` — Paginated fetch with total count

#### Step 1.4: Create Consolidation Function
- `consolidate_prompt_versions()` — Merges old versions per tiered strategy
- Keeps first and last of each time bucket
- Marks consolidated versions with `consolidation_group_id`

#### Step 1.5: Enable Realtime
- Add `prompt_versions` to `supabase_realtime` publication

---

### Phase 2: Type Definitions

**Objective:** Define TypeScript interfaces for version data

#### Step 2.1: Create Version Types
- File: `src/types/promptVersion.ts`
- Interface: `PromptVersion` with all table fields (camelCase mapped)
- Interface: `DiffSegment` with `type` ('added' | 'removed' | 'unchanged') and `value`
- Interface: `VersionGroup` for time-based grouping with `label` and `versions[]`
- Interface: `PaginatedVersions` with `versions`, `hasMore`, `totalCount`

#### Step 2.2: Extend Storage Types
- File: `src/lib/storage/types.ts`
- Add `VersionsStorageAdapter` interface with `getVersions()`, `createVersion()` methods
- Update `StorageAdapter` interface to include `versions` property

---

### Phase 3: Storage Adapter

**Objective:** Implement version CRUD and integrate with prompt updates

#### Step 3.1: Create Versions Adapter
- File: `src/lib/storage/supabaseAdapter.ts`
- Add `SupabaseVersionsAdapter` class implementing `VersionsStorageAdapter`
- Add `mapVersionRow()` helper for snake_case → camelCase conversion
- Wire into main adapter constructor

#### Step 3.2: Modify `addPrompt` Method
- After successful prompt insert, call `create_prompt_version` RPC to create v1
- Initial state captured as first version entry

#### Step 3.3: Modify `updatePrompt` Method
- Fetch current prompt state BEFORE applying update
- Compare title, body, and variables to detect content changes
- If changed: call `create_prompt_version` RPC with OLD state values
- Then proceed with normal update
- Skip version creation for metadata-only changes (pin state, usage count)

---

### Phase 4: Frontend Components

**Objective:** Build the version history UI

#### Step 4.1: Install Diff Library
- Package: `diff` (npm install diff @types/diff)
- Lightweight word-level diffing for prompt body comparison

#### Step 4.2: Create Diff Utilities
- File: `src/components/version-history/diffUtils.ts`
- Function: `computeDiff(version, compareWith)` — Returns title diff, body segments, variable changes
- Function: `groupVersionsByPeriod(versions)` — Groups into Today, Yesterday, Last 7 days, monthly

#### Step 4.3: Create VariableChanges Component
- File: `src/components/version-history/VariableChanges.tsx`
- Props: `added[]`, `removed[]`, `unchanged[]`
- Render: Green badges with + icon for added, red badges with - icon for removed, gray for unchanged

#### Step 4.4: Create VersionDiff Component
- File: `src/components/version-history/VersionDiff.tsx`
- Props: `version`, `compareWith`, `diffMode`
- Sections: Title diff (if changed), body diff with inline highlighting, variable changes
- Styling: `bg-green-200 text-green-900` for additions, `bg-red-200 text-red-900 line-through` for removals

#### Step 4.5: Create VersionListItem Component
- File: `src/components/version-history/VersionListItem.tsx`
- Display: Version number, formatted timestamp, truncated preview
- Highlight selected state

#### Step 4.6: Create VersionList Component
- File: `src/components/version-history/VersionList.tsx`
- Use Accordion for expandable time-based groups
- Badge showing version count per group
- "Load more" button for pagination
- ScrollArea for overflow

#### Step 4.7: Create VersionHistoryModal Component
- File: `src/components/version-history/VersionHistoryModal.tsx`
- Two-column layout: version list (1/3) | diff view (2/3)
- Toggle between "Compare with previous" and "Compare with current"
- Revert button with AlertDialog confirmation
- Empty state for prompts without edits

#### Step 4.8: Create usePromptVersions Hook
- File: `src/hooks/usePromptVersions.ts`
- React Query based with `['promptVersions', userId, promptId]` key
- Handles pagination state and refetch

---

### Phase 5: Integration

**Objective:** Wire version history into existing prompt UI

#### Step 5.1: Update PromptView Component
- File: `src/components/PromptView.tsx`
- Add History button next to Edit button in header actions
- Add `showVersionHistory` state
- Add `VersionHistoryModal` with `onRevert` handler
- Revert handler calls `updatePrompt` (which auto-saves current state first)

#### Step 5.2: Update PromptEditor Component
- File: `src/components/PromptEditor.tsx`
- Add History button in footer (visible in edit mode)
- Share modal state management pattern from PromptView

---

### Phase 6: Consolidation Scheduling

**Objective:** Set up automated version cleanup

#### Step 6.1: Enable pg_cron Extension
- Enable in Supabase Dashboard → Database → Extensions

#### Step 6.2: Create Scheduled Job
- Migration: `supabase/migrations/YYYYMMDDHHMMSS_schedule_version_consolidation.sql`
- Schedule: Daily at 3 AM UTC
- Calls: `consolidate_prompt_versions()` function

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/*_create_prompt_versions_table.sql` | Table schema, indexes, RLS |
| `supabase/migrations/*_create_version_functions.sql` | RPC functions for CRUD |
| `supabase/migrations/*_create_consolidation_function.sql` | Consolidation logic |
| `supabase/migrations/*_schedule_consolidation.sql` | pg_cron job setup |
| `src/types/promptVersion.ts` | TypeScript interfaces |
| `src/components/version-history/VersionHistoryModal.tsx` | Main modal component |
| `src/components/version-history/VersionList.tsx` | Scrollable version list |
| `src/components/version-history/VersionListItem.tsx` | Individual version row |
| `src/components/version-history/VersionDiff.tsx` | Diff display |
| `src/components/version-history/VariableChanges.tsx` | Variable chips |
| `src/components/version-history/diffUtils.ts` | Diff computation |
| `src/hooks/usePromptVersions.ts` | Data fetching hook |

---

## 📝 Files to Modify

| File | Changes |
|------|---------|
| `src/lib/storage/types.ts` | Add `VersionsStorageAdapter` interface |
| `src/lib/storage/supabaseAdapter.ts` | Add versions adapter, modify `addPrompt`/`updatePrompt` |
| `src/components/PromptView.tsx` | Add History button and modal |
| `src/components/PromptEditor.tsx` | Add History button and modal |

---

## ✅ Testing Checklist

### Database Layer
- [ ] `prompt_versions` table created with correct schema
- [ ] RLS prevents cross-user version access
- [ ] `create_prompt_version` RPC increments version numbers correctly
- [ ] `get_prompt_versions` returns paginated results with total count
- [ ] Consolidation function merges versions correctly

### Version Creation
- [ ] Creating new prompt creates v1 entry
- [ ] Editing title creates new version
- [ ] Editing body creates new version
- [ ] Adding/removing variable creates new version
- [ ] Changing pin state does NOT create version
- [ ] Incrementing usage count does NOT create version

### UI Functionality
- [ ] History button visible in view mode
- [ ] History button visible in edit mode
- [ ] Modal opens with version list grouped by time period
- [ ] Selecting version shows diff in right panel
- [ ] Toggle switches between "previous" and "current" comparison
- [ ] Diff highlights additions in green, removals in red
- [ ] Variable changes show correct +/- badges
- [ ] "Load more" pagination works

### Revert Flow
- [ ] Revert confirmation dialog appears
- [ ] Current state saved as version before revert
- [ ] Prompt updates to selected version content
- [ ] Previous state visible in history after revert
- [ ] Toast notification confirms successful revert

### Edge Cases
- [ ] Empty state shown for prompts with no edit history
- [ ] Very long prompts diff correctly without performance issues
- [ ] Modal handles prompts with 100+ versions gracefully
- [ ] Consolidation preserves expandable groups correctly

---

## 📊 Success Criteria

### Functional
- Users can view complete version history for any prompt
- Users can see exactly what changed between any two versions
- Users can revert to any previous version without data loss
- Initial prompt creation appears as v1 in history

### Quality
- No console errors during version history operations
- Modal loads versions within 500ms for typical history sizes
- Diff rendering handles large prompts without UI freezing

### UX
- Version grouping makes history scannable at a glance
- Diff highlighting clearly shows additions vs removals
- Revert flow provides confidence that no data will be lost

---

## 📌 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| When to create versions | On content change only | Avoids noise from pin/usage metadata changes |
| What to save | OLD state before update | Ensures current state is always the "live" version |
| Diff library | `diff` npm package | Lightweight, well-maintained, word-level diffing |
| Consolidation timing | Daily background job | Balances storage efficiency with implementation simplicity |
| Consolidation strategy | Keep first + last per period | Preserves meaningful snapshots while reducing count |
| Version storage | Immutable snapshots | Simpler than delta-based, easier to query and display |
| UI pattern | Modal dialog | Matches existing app patterns, doesn't require new routing |
| Revert behavior | Auto-save current first | Ensures users never lose work, builds trust |
| Named versions | Not included | Keeps MVP simple, can add later if needed |

---

## 🚨 Risk Mitigation

### Storage Growth
- **Risk:** High-frequency editors could generate many versions
- **Mitigation:** Consolidation reduces long-term storage; can add per-prompt version limits later if needed

### Performance
- **Risk:** Prompts with extensive history could slow modal load
- **Mitigation:** Paginated fetching with React Query caching; lazy-load older versions

### Migration Complexity
- **Risk:** Existing prompts have no version history
- **Mitigation:** v1 only created on first edit after feature launch; empty state handles gracefully

### Diff Accuracy
- **Risk:** Word-level diff may produce confusing results for restructured text
- **Mitigation:** Can switch to line-level or character-level if user feedback indicates issues

### Rollback Strategy
- **Phase 1-2:** Drop `prompt_versions` table if issues found
- **Phase 3:** Revert adapter changes; versions table becomes orphaned but harmless
- **Phase 4-5:** Remove UI components; existing functionality unaffected

---

## 🔗 Related Files Reference

- `src/lib/storage/supabaseAdapter.ts` — Core storage logic to modify
- `src/components/PromptView.tsx` — View mode integration point
- `src/components/PromptEditor.tsx` — Edit mode integration point
- `src/types/prompt.ts` — Existing prompt interface for reference
- `supabase/migrations/20241028000001_create_prompts_table.sql` — Base schema reference
- `supabase/migrations/20241028000002_create_copy_events_table.sql` — Similar immutable history pattern

---

## ✨ Future Enhancements (Not in Scope)

- Named/starred versions for important milestones
- Version comparison between any two arbitrary versions
- Bulk operations (delete old versions, export history)
- Real-time updates when versions are created
- Version history search/filtering
- Collaborative editing with user attribution per version

---

**Status:** Ready for implementation
