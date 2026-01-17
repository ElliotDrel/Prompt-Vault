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

### UAT-007: Visibility toggle position and labeling UX improvements

**Discovered:** 2026-01-16 (Round 2)
**Phase/Plan:** 15
**Severity:** Minor (Enhancement)
**Feature:** Visibility toggle UX
**Description:** User requested UX improvements to visibility toggle placement and labeling.
**Expected:**
- Toggle should be in the same row as "Back to Dashboard" button, aligned right
- Current state label ("Private" or "Public") should be ABOVE the toggle, centered
**Actual:**
- Toggle is positioned in top right corner of content area
- Label is adjacent to toggle, not above

### UAT-008: Author name shows "Anonymous" for all users instead of actual name

**Discovered:** 2026-01-16 (Round 2)
**Phase/Plan:** 15
**Severity:** Major
**Feature:** Author attribution
**Description:** All public prompts show "by Anonymous" instead of the actual author's name.
**Expected:**
- Display user's `full_name` from auth.users metadata
- If no full_name, display truncated user ID (e.g., "44f2ca5f...")
**Actual:**
- `displayName` is hardcoded to `undefined` in `supabaseAdapter.ts:68`
- PromptCard falls back to "Anonymous" when displayName is falsy
**Root Cause:**
In `mapRowToPublicPrompt()`, the author object is created with `displayName: undefined` and a comment "Future: profile lookup". No actual lookup is performed.
**Repro:**
1. Go to /library
2. Look at any prompt card
3. Author shows "by Anonymous"

**Recommended Fix:**
1. Join prompts query with `auth.users` to get `raw_user_meta_data->>'full_name'`
2. Or create a `profiles` table that stores display names
3. Update fallback in PromptCard to show truncated userId instead of "Anonymous"

### UAT-009: Library cards should show public icon for consistency

**Discovered:** 2026-01-16 (Round 2)
**Phase/Plan:** 15
**Severity:** Minor
**Feature:** Library card consistency
**Description:** Library cards currently hide visibility icons (all are public). User wants icons shown for visual consistency across platform.
**Expected:**
- Library cards show globe icon with "Public - visible in the Prompt Library" tooltip
- Consistent with Dashboard card appearance
**Actual:**
- Visibility icons are hidden on Library cards (`effectiveSource === 'owned'` check in PromptCard)
**Repro:**
1. Go to /library
2. Look at any prompt card - no visibility icon

### UAT-010: Search scope unclear - needs documentation/UI hint

**Discovered:** 2026-01-16 (Round 2)
**Phase/Plan:** 15
**Severity:** Minor (Enhancement)
**Feature:** Search UX
**Description:** User asked "what is search searching?" - search scope not obvious from UI.
**Current Behavior:**
- **Dashboard**: Searches title, body (author fields ignored since owned prompts)
- **Library**: Searches title, body, author.displayName, authorId
- **Copy History**: Uses same hook, searches available fields
**Expected:**
- Placeholder text could hint at search scope (e.g., "Search title, content, author...")
- Or a small info icon explaining what's searchable
**Actual:**
- Generic "Search prompts..." placeholder doesn't clarify scope

---

## Resolved Issues

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
