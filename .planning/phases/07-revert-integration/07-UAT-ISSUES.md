# UAT Issues: Phases 1-7 (Version History Feature)

**Tested:** 2026-01-11
**Source:** Full feature UAT for Phases 1-7
**Tester:** User via /gsd:verify-work

## Resolved Issues

### UAT-001: RPC functions not found in schema cache

**Discovered:** 2026-01-11
**Phase/Plan:** 02 (Database Functions)
**Severity:** Blocker
**Feature:** Version history API
**Description:** RPC functions existed but PostgREST couldn't find them due to parameter name mismatch
**Expected:** Functions callable from frontend
**Actual:** Error: "Could not find the function public.get_prompt_versions(limit_count, offset_count, prompt_id)"
**Root Cause:** Database functions used `p_` prefix parameters (p_prompt_id, p_offset, p_limit) but frontend code used unprefixed names (prompt_id, offset_count, limit_count)
**Resolution:** Created migration `20260111182939_fix_rpc_parameter_names.sql` to recreate functions with matching parameter names
**Resolved:** 2026-01-11

### UAT-002: get_prompt_versions returns wrong format

**Discovered:** 2026-01-11
**Phase/Plan:** 02 (Database Functions)
**Severity:** Blocker
**Feature:** Version list loading
**Description:** Function returned raw array instead of expected JSON object
**Expected:** `{ versions: [...], total_count: number }`
**Actual:** Just an array of version rows
**Root Cause:** Function was defined as `RETURNS SETOF prompt_versions` instead of returning JSON object
**Resolution:** Created migration `20260111183435_fix_get_versions_return_format.sql` to return proper JSON structure
**Resolved:** 2026-01-11

### UAT-003: Compare mode toggle not visually distinct

**Discovered:** 2026-01-11
**Phase/Plan:** 06-02 (VersionHistoryModal)
**Severity:** Minor
**Feature:** Comparison mode toggle
**Description:** Cannot tell which comparison mode (Previous vs Current) is active
**Expected:** Active button clearly highlighted
**Actual:** Both buttons looked the same (outline variant)
**Resolution:** Changed active button to use `variant="default"` (solid blue) instead of `variant="outline"` with bg-muted
**Resolved:** 2026-01-11

### UAT-004: Compare to Previous shows no diff highlighting

**Discovered:** 2026-01-11
**Phase/Plan:** 06-02 (VersionHistoryModal)
**Severity:** Major
**Feature:** Diff visualization
**Description:** In "Compare to Previous" mode, no green/red diff highlighting shown
**Expected:** Word-level diff with additions (green) and removals (red)
**Actual:** Plain text content without any diff styling
**Root Cause:** Modal's `getComparisonTarget()` returned null for 'previous' mode because it didn't have access to the previous version
**Resolution:** Added `usePromptVersions` hook to modal to fetch versions and find previous version for comparison; fixed diff direction logic
**Resolved:** 2026-01-11

### UAT-005: Title section not always visible

**Discovered:** 2026-01-11
**Phase/Plan:** 06-02 (VersionHistoryModal)
**Severity:** Minor
**Feature:** Version detail view
**Description:** Title content only shown when comparing and titles differ
**Expected:** Title always visible regardless of comparison mode
**Actual:** Title section hidden when not comparing or when titles are same
**Resolution:** Changed Title section to always render, showing diff when comparing or plain text otherwise
**Resolved:** 2026-01-11

### UAT-006: Current prompt not in version list

**Discovered:** 2026-01-11
**Phase/Plan:** 05-02 (VersionList)
**Severity:** Major
**Feature:** Version list
**Description:** Version list only shows historical versions, not the current live state
**Expected:** "Current" entry at top of list showing live prompt state
**Actual:** Only historical versions shown, confusing which is the latest
**Resolution:** Added "Current" button at top of VersionList with "Live" badge; added detail view for current prompt
**Resolved:** 2026-01-11

### UAT-007: Styling inconsistencies between version views

**Discovered:** 2026-01-11
**Phase/Plan:** 06-01 (VersionDiff)
**Severity:** Cosmetic
**Feature:** Version detail view
**Description:** Version 1 and Version 2 rendered with different styling (text-sm, whitespace-pre-wrap differences)
**Expected:** Consistent styling across all version views
**Actual:** Different CSS classes applied depending on comparison path
**Resolution:** Added `text-sm` class to VersionDiff component for both identical and diff cases; fixed Variables section wrapper consistency
**Resolved:** 2026-01-11

### UAT-008: History button placement incorrect

**Discovered:** 2026-01-11
**Phase/Plan:** 07-02 (Integration)
**Severity:** Minor
**Feature:** UI layout
**Description:** User requested History button next to Edit button, not in footer
**Expected:** History button in header next to Edit
**Actual:** History button was in footer with Pin button
**Resolution:** Moved History button to header section next to Edit button in PromptView
**Resolved:** 2026-01-11

### UAT-009: Pin/History buttons showing in edit mode

**Discovered:** 2026-01-11
**Phase/Plan:** 07-02 (Integration)
**Severity:** Minor
**Feature:** PromptEditor
**Description:** User requested Pin and History buttons not show when editing
**Expected:** No Pin/History buttons in edit mode
**Actual:** Both buttons visible in PromptEditor footer
**Resolution:** Removed Pin and History buttons from PromptEditor; cleaned up unused imports/code
**Resolved:** 2026-01-11

### UAT-010: Current selection immediately overridden

**Discovered:** 2026-01-11
**Phase/Plan:** 06-02 (VersionHistoryModal)
**Severity:** Major
**Feature:** Current version view
**Description:** Clicking "Current" in version list immediately switches back to a historical version
**Expected:** Current prompt detail view shows and stays selected
**Actual:** Selection reverts to first historical version
**Root Cause:** useEffect auto-selecting first version triggered when `selectedVersion` became null, overriding the `isCurrentSelected` state
**Resolution:** Added `&& !isCurrentSelected` condition to auto-select effect
**Resolved:** 2026-01-11

---

## Testing Progress

### Completed Tests (Pass)
- [x] Pre-flight check (app running, logged in)
- [x] Version Creation on New Prompt

### Tests In Progress
- [ ] Version Creation on Content Edit (issues fixed, needs re-verification)

### Pending Tests
- [ ] Metadata-Only Changes Skip Versioning
- [ ] Version List Time Grouping
- [ ] Version List Item Display
- [ ] Diff Comparison - Previous Version
- [ ] Diff Comparison - Current Version
- [ ] Variable Changes Display
- [ ] Revert Confirmation Dialog
- [ ] Successful Revert
- [ ] History Button in PromptView (moved to header)
- [ ] History Button Hidden in Create Mode

### Tests No Longer Applicable
- History Button in PromptEditor - Removed per user request

---

## Migrations Applied During UAT

1. `20260111182939_fix_rpc_parameter_names.sql` - Fix parameter names to match frontend
2. `20260111183435_fix_get_versions_return_format.sql` - Return JSON object with versions and total_count

---

*Phase: 07-revert-integration*
*UAT Date: 2026-01-11*
