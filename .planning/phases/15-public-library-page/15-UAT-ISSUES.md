# UAT Issues: Phase 15

**Tested:** 2026-01-16 (Round 1), 2026-01-16 (Round 2 post-fix)
**Source:** .planning/phases/15-public-library-page/15-01-SUMMARY.md, 15-02-SUMMARY.md, 15-FIX-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

(None - all issues resolved)

---

## Resolved Issues

### UAT-006: Public Library has no realtime subscription for cross-user updates
**Resolved:** 2026-01-30 - Fixed in Phase 15.4
**Commit:** Phase 15.4 implementation
**Fix:** Implemented Supabase Broadcast pattern instead of postgres_changes (which couldn't work due to RLS evaluating against OLD row state). Added `broadcastChannel` subscription listening for `public_prompt_changed` events. `broadcastPublicPromptChange()` function sends notifications when public prompts are created, updated, or deleted. See `supabaseAdapter.ts:941-984` for receiver and lines 155-174 for sender.

---

### UAT-011: Missing /library/prompt/:promptId route causes 404
**Resolved:** 2026-01-21 - Fixed in Phase 15.3
**Commit:** e78b4da
**Fix:** Created `PublicPromptDetail.tsx` component and registered `/library/prompt/:promptId` route in App.tsx (line 104-110). Owners see context banner with "View in Dashboard" button. Non-owners see read-only view. Same 404 message for missing/private prompts (security).

---

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
