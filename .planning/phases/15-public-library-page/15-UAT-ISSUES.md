# UAT Issues: Phase 15

**Tested:** 2026-01-16
**Source:** .planning/phases/15-public-library-page/15-01-SUMMARY.md, 15-02-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Public Library doesn't refresh after visibility toggle

**Discovered:** 2026-01-16
**Phase/Plan:** 15-02
**Severity:** Major
**Feature:** Public Library page / Visibility toggle sync
**Description:** When toggling a prompt's visibility (private ↔ public) and navigating to the Public Library, the change isn't reflected until manual page refresh.
**Expected:** Library should show updated visibility state immediately when navigating to /library after toggling a prompt's visibility.
**Actual:** Library shows cached/stale data. User must manually refresh to see the change.
**Repro:**
1. Go to Dashboard, open a prompt
2. Toggle visibility from private to public (or vice versa)
3. Navigate to /library
4. Observe: The prompt's presence/absence doesn't reflect the change
5. Manually refresh the page
6. Now the change is reflected

**Technical Context:**
- usePublicPrompts hook uses TanStack Query with 30s stale time
- No query invalidation when visibility is toggled
- No realtime subscription for public prompts

**Potential Fixes:**
- Invalidate public prompts query when visibility is toggled
- Add realtime subscription to public prompts
- Reduce stale time for more frequent refetches

### UAT-002: Library page missing persistent layout (nav bar and stats)

**Discovered:** 2026-01-16
**Phase/Plan:** 15-02
**Severity:** Major
**Feature:** Layout consistency across pages
**Description:** The Library page (/library) is missing the top navigation bar and stats bar that appear on Dashboard and History pages.
**Expected:** Top nav bar (Dashboard, Library, History, Sign Out) and stats bar (total prompts, times copied, time saved) should persist on ALL pages.
**Actual:** Library page has its own separate layout without these shared elements.
**Repro:**
1. Go to /dashboard - observe nav bar and stats bar
2. Navigate to /library
3. Observe: Nav bar and stats bar are missing

### UAT-003: Navigation bar layout needs reorganization

**Discovered:** 2026-01-16
**Phase/Plan:** 15-02
**Severity:** Minor
**Feature:** Navigation bar
**Description:** The "Browse Library" button should be positioned between Dashboard and History, and all three nav buttons should be centered horizontally (Sign Out stays right-aligned).
**Expected:** Layout: `[centered: Dashboard | Library | History]` ... `[right: Sign Out]`
**Actual:** Browse Library button is not in the nav bar; Dashboard and History are left-aligned.
**Repro:**
1. View the top navigation bar on /dashboard
2. Observe current layout

### UAT-004: Search should search across title, body, and author name

**Discovered:** 2026-01-16
**Phase/Plan:** 15-02
**Severity:** Major
**Feature:** Search functionality
**Description:** The search bar should search across prompt title, body, and author name. Currently uses a separate author filter via URL params.
**Expected:**
- Single search bar searches all fields (title, body, author name)
- Clicking author name on a card inserts their display name (or user ID fallback) into search bar
- Remove ?author= URL param / filter badge approach
**Actual:** Search only searches title/body. Author filtering is done via separate URL param with filter badge.
**Repro:**
1. Go to /library
2. Try to search for an author name
3. Observe: Doesn't filter by author through search

### UAT-005: Visibility toggle needs redesign

**Discovered:** 2026-01-16
**Phase/Plan:** 15-02 (and 14-01)
**Severity:** Major
**Feature:** Visibility toggle and indicators
**Description:** Visibility toggle should be redesigned with toggle switch in prompt detail view, and icon indicators on Dashboard cards.
**Expected:**
- **Prompt detail view:** Toggle switch in top right corner (like Google Docs)
- **Dashboard cards:** Lock icon (private) or globe icon (public) in current position
- **Hover tooltips:** "Private - only visible to you" / "Public - visible in the Prompt Library"
- **Library cards:** No visibility icon (all are public, redundant)
**Actual:** Current implementation doesn't match this design.
**Repro:**
1. Open a prompt in detail view
2. Observe visibility toggle placement and style
3. View Dashboard cards
4. Observe visibility indicator style

## Resolved Issues

[None yet]

---

*Phase: 15-public-library-page*
*Tested: 2026-01-16*
