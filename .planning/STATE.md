# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-13)

**Core value:** Never lose work. Every prompt edit is automatically preserved with complete history, clear diffs showing exactly what changed, and confident one-click revert to any previous state.
**Current focus:** v2.0 Public Prompt Library

## Current Position

Phase: 15.4 of 22 (Public Prompt UX Improvements) - UAT ISSUES OPEN
Plan: 5 of 5 complete, but PR #41 review identified 15 issues requiring gap closure
Status: Phase 15.4 has open UAT issues from automated PR review (see 15.4-UAT-ISSUES.md)
Last activity: 2026-02-03 - Documented PR #41 review comments, created UAT issues file

Progress: ██████░░░░ 60%

### Open UAT Issues (PR #41)

**Critical:** 15 issues marked IMPLEMENT NOW
- UAT-041-01: Missing `created_at` in getPublicPrompts (broken "Created" sort)
- UAT-041-02: CopyHistory loading race condition (incorrect public badges)
- UAT-041-03: Optional onDelete called without guard (crash risk)
- UAT-041-12: Trust gate missing for @claude workflow (security)

**See:** `.planning/phases/15.4-public-prompt-ux-improvements/15.4-UAT-ISSUES.md`

**Next:** Create gap closure plan 15.4-06 to address all IMPLEMENT NOW issues

## Shipped Milestones

### v1.0 Version History (2026-01-13)

**Delivered:** Complete version tracking system with automatic snapshots, inline diff highlighting, and one-click revert for all prompt edits.

**Stats:**
- 10 phases, 22 plans
- 96 files, 13,176 LOC TypeScript
- 128 commits over 4 days
- 122 versions in database (71 historical + 51 current)

See: `.planning/MILESTONES.md` for full details.

## Accumulated Context

### Key Learnings from v1.0

1. **RPC parameter names must match frontend exactly** - PostgREST resolves by parameter names, not positions
2. **Versioning model matters** - Define "Version N = content AFTER Nth save" upfront to avoid confusion
3. **UAT reveals conceptual errors** - Unit tests catch bugs, UAT catches wrong mental models
4. **Dual analysis for validation** - Running two independent analyses caught errors
5. **Never edit applied migrations** - Always create new migrations to fix issues

### Key Learnings from v2.0 (Phases 15-15.2)

6. **🚨 Supabase channel reuse gotcha** - `supabase.channel(name)` REUSES existing instances by name. If you have a persistent subscription and call `channel()` with same name to send, then `removeChannel()`, you CLOSE the persistent subscription! Fix: Check `channel.state === 'joined'` before removing. See CLAUDE.md "Supabase Broadcast Channel Gotcha" for full details and code examples.

7. **Radix/Floating UI scroll jitter** - Radix Popover uses Floating UI (JavaScript-based positioning) which cannot update synchronously with browser scroll rendering. For dropdowns that need to stay perfectly anchored during fast scroll, use pure CSS positioning (`position: absolute` + `top-full` relative to parent) instead.

8. **React Router setSearchParams scroll reset** - `setSearchParams` triggers scroll-to-top by default, treating URL param updates as navigation events. For filter/sort controls that update URL params without navigating, always include `preventScrollReset: true` in the options.

### Decisions Log

All v1.0 decisions documented in PROJECT.md Key Decisions table.

**Phase 12 decisions:**
- Controlled component pattern for filter state in PromptListView
- Render prop (renderPromptCard) for card customization flexibility
- Derive defaults from source prop (owned shows pin, others hide)
- Link2 icon for saved prompts to indicate live-linked status

**Phase 13 decisions:**
- Initialize URL state in useState initializers (not useEffect) to avoid flash
- Only show non-default values in URL for cleaner URLs
- Controlled mode support in usePromptFilters for external state management

**Phase 14 decisions:**
- Visibility indicator on card (passive) vs toggle button in PromptView (interactive)
- Optimistic updates with server sync and rollback on error
- New prompts default to 'private' (matching Phase 11 schema)

**Phase 15 decisions:**
- RLS handles visibility filtering - no explicit auth.uid() check needed in query
- Author info initialized with userId only, displayName undefined for future profile lookup
- Unified search over URL filters - simpler UX, more intuitive discovery
- AppLayout component for persistent nav/stats across all pages
- Switch component for visibility toggle with clear semantics
- Visibility icons only on owned cards (reduces clutter on Library)
- Favicon for nav logo (consistent branding, reuses existing asset)

**Phase 15.2 decisions:**
- Segmented control pattern for filter/sort UI - inline bar with filter|sort|direction sections
- Pure CSS dropdown positioning instead of Radix Popover - eliminates scroll jitter
- Direction toggle accessible directly on bar - no need to open dropdown for common action
- Two-column dropdown menu - filter on left, sort on right
- preventScrollReset option for setSearchParams - preserves scroll position on filter changes

**Phase 15.3 decisions:**
- Return null for both non-existent and private prompts (security - don't reveal existence)
- Query key isolation: Include promptId in ['publicPrompt', promptId] for proper cache per resource
- Realtime subscription invalidates on any publicPrompts event (slightly over-aggressive but simpler)
- Ownership detection: Compare prompt.authorId === user?.id (simple, works with PublicPrompt type)
- Security through same error: Show same "Prompt Not Found" message for non-existent and private (prevents revealing existence)
- Conditional feature hiding: Use optional props with defaults instead of separate components (reuses PromptView logic, avoids duplication)
- Symmetric navigation: Dashboard public prompts show "View Public Version", Library owned prompts show "View in Dashboard"

**Phase 15.4 decisions:**
- Auto-redirect owners from Library to Dashboard (reduces friction, no need to see public view banner)
- Use replace: true in navigate for auto-redirect (avoids polluting browser history)
- Use queryClient.invalidateQueries instead of refetch() for realtime updates (invalidates all copy event queries instead of just current instance)
- Use refetchType 'active' for invalidation (only refetches visible queries, optimal performance)
- Border styling priority: pinned yellow ring takes priority over own-prompt primary ring (pins only exist on Dashboard)
- Use primary color for owned prompt borders (matches existing theme system)
- Context note only shows when history is expanded (reduces noise when collapsed)
- Public indicator via Set membership check (O(1) lookup, efficient for large prompt lists)
- Deleted prompts treated as public for simplicity (won't be in owned set)
- **Remove View Public Version button** - obsolete with auto-redirect (navigates to page that immediately redirects back)
- **Remove Preview as Public feature** - user decision, adds too much complexity

### Deferred Features

**1. Public Prompt Usage Analytics (Phase 16+)**

Basic increment works (any user can increment `times_used` on public prompts). Full analytics deferred:
- Track owner usage vs community usage separately
- Display split stats: "Used X times by you, Y times by community"
- Consider privacy implications

**2. User Profiles & Display Names (Phase 19+)**

Currently shows truncated userId (e.g., "44f2ca5f..."). Future:
- Collect display name on signup / prompt existing users
- Add `display_name` column to user_settings or new `profiles` table
- Smart identifier for URLs (short code, handle, or username)

**3. Cross-Page Author Filtering (Blocked by #2)**

Click author → filter to their prompts. Requires user identifier system first.
Current workaround: Mine/Others dropdown filter.

### Blockers/Concerns

**PR #41 UAT Issues (2026-02-03):**
- Phase 15.4 has 15 open issues from automated PR review
- Must complete gap closure plan 15.4-06 before merge
- See: `.planning/phases/15.4-public-prompt-ux-improvements/15.4-UAT-ISSUES.md`

### Roadmap Evolution

- Milestone v2.0 created: Public Prompt Library, 10 phases (Phase 11-20)
- Phase 15.1 inserted after Phase 15: Visibility Filter Persistence (URGENT) - Rework filtering system with public/private toggle on Dashboard/Library, persist filter state to user_settings table
- Phase 21 added: Public Library on Landing Page with Smart Auth Gates - Enable unauthenticated users to browse public prompts with smart authentication gates
- Phase 15.2 inserted after Phase 15.1: Rework Filter UI - Visual redesign of filtering UI for improved aesthetics
- Phase 22 added: Mobile Optimization - Optimize UI across all pages for mobile devices (current UI is unusable on mobile)
- Phase 15.3 inserted after Phase 15.2: Public Prompt Detail Page (URGENT) - Resolves UAT-011 critical 404 bug
- Phase 15.4 inserted after Phase 15.3: Public Prompt UX Improvements - Realtime usage history, owner redirect flow, preview button, visual distinction for owned prompts, copy history context notes

## Session Continuity

Last session: 2026-02-03
Stopped at: PR #41 review identified 15 issues requiring gap closure plan
Resume file: `.planning/phases/15.4-public-prompt-ux-improvements/15.4-UAT-ISSUES.md`

**Next Steps:**
1. **IMMEDIATE:** Create gap closure plan 15.4-06 for PR #41 UAT issues
2. Execute plan 15.4-06 to fix all IMPLEMENT NOW issues
3. Re-verify Phase 15.4 after fixes
4. Then proceed to Phase 16: Add to Vault - Live-link functionality
