# UAT Issues: Phase 15

**Tested:** 2026-01-16 (Round 1), 2026-01-16 (Round 2 post-fix)
**Source:** .planning/phases/15-public-library-page/15-01-SUMMARY.md, 15-02-SUMMARY.md, 15-FIX-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-006: Public Library has no realtime subscription for cross-user updates

**Discovered:** 2026-01-16 (Round 2)
**Phase/Plan:** 15
**Severity:** Major
**Feature:** Public Library realtime sync
**Description:** The Library page doesn't have a realtime subscription for public prompts. Changes from other users (or even your own visibility toggles) don't appear until page refresh.
**Expected:**
- When any user makes a prompt public, it should appear on all users' Library pages in real-time
- When a prompt is edited while public, changes should sync to Library viewers
- When a prompt is made private, it should disappear from Library in real-time
**Actual:**
- Must manually refresh page to see any changes
- Even navigating away and back doesn't always show updated data (30s stale cache)
**Repro:**
1. Open Library page in Tab A
2. In Tab B (or another user), make a prompt public
3. Tab A doesn't show the new prompt
4. Manually refresh Tab A - now it appears

**Root Cause Analysis:**
The current realtime subscription in `supabaseAdapter.ts:741-768` only listens for changes where `user_id=eq.${userId}` (the logged-in user's own prompts). Public prompts can be from ANY user, so they're never captured by this filter.

**Recommended Fix:**
Add a separate subscription channel filtered by `visibility=eq.public` instead of `user_id`. This will notify when any prompt becomes public, is edited while public, or becomes private.

**Implementation Attempted:** 2026-01-17 in 15-FIX2
- Added `publicChannel` subscription with `visibility=eq.public` filter
- Added `'publicPrompts'` event type to storage types
- Added subscription listener in `usePublicPrompts.ts`
- **Status: NOT WORKING** - Subscription not triggering. Needs senior dev review.
- See commit `91d9b44` for implementation details.

---

## Resolved Issues

### UAT-007: Visibility toggle position and labeling UX improvements
**Resolved:** 2026-01-17 - Fixed in 15-FIX2
**Commit:** 91d9b44
**Fix:** Moved toggle to header row (same row as Back button), right-aligned. Label now centered above the switch.

### UAT-008: Author name shows "Anonymous" for all users instead of actual name
**Resolved:** 2026-01-17 - Fixed in 15-FIX2
**Commit:** 91d9b44
**Fix:** Changed fallback from "Anonymous" to truncated userId with ellipsis (e.g., "44f2ca5f..."). No profile system exists yet, so using userId as identifier.

### UAT-009: Library cards should show public icon for consistency
**Resolved:** 2026-01-17 - Fixed in 15-FIX2
**Commit:** 91d9b44
**Fix:** Added globe icon with tooltip for `source='public'` cards in PromptCard.tsx.

### UAT-010: Search scope unclear - needs documentation/UI hint
**Resolved:** 2026-01-17 - Fixed in 15-FIX2
**Commit:** 91d9b44
**Fix:** Added `searchPlaceholder` prop to PromptListView. Library shows "Search title, content, author...", Dashboard shows "Search prompts...".

### UAT-001: Public Library doesn't refresh after visibility toggle
**Resolved:** 2026-01-16 - Fixed in 15-FIX
**Commit:** 62c09a5
**Fix:** Added `queryClient.invalidateQueries({ queryKey: ['publicPrompts'] })` after visibility toggle

### UAT-002: Library page missing persistent layout
**Resolved:** 2026-01-16 - Fixed in 15-FIX
**Commit:** 3dc64ea
**Fix:** Created AppLayout component, applied to all pages

### UAT-003: Navigation bar needs reorganization
**Resolved:** 2026-01-16 - Fixed in 15-FIX
**Commits:** 7a6943c, 95357fc, aed795b
**Fix:** Added logo, centered nav buttons, right-aligned Sign Out

### UAT-004: Search should include author name
**Resolved:** 2026-01-16 - Fixed in 15-FIX + follow-up
**Commits:** 1cf412e, aed795b
**Fix:** Extended search to title, body, author.displayName, AND authorId

### UAT-005: Visibility toggle needs redesign
**Resolved:** 2026-01-16 - Fixed in 15-FIX
**Commits:** b5e5158, caf9d55
**Fix:** Replaced button with Switch component, added proper tooltips

---

*Phase: 15-public-library-page*
*Round 1 Tested: 2026-01-16 - 5 issues found, all resolved*
*Round 2 Tested: 2026-01-16 - 5 new issues found (UAT-006 to UAT-010)*
*Round 2 Fixes: 2026-01-17 - 4 issues resolved (UAT-007 to UAT-010), 1 pending (UAT-006 realtime)*
