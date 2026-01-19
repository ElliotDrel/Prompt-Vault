# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-13)

**Core value:** Never lose work. Every prompt edit is automatically preserved with complete history, clear diffs showing exactly what changed, and confident one-click revert to any previous state.
**Current focus:** v2.0 Public Prompt Library

## Current Position

Phase: 15.1 of 21 (Visibility Filter Persistence)
Plan: 1 of 3 complete
Status: In progress
Last activity: 2026-01-19 - Completed 15.1-01-PLAN.md (filter preferences data layer)

Progress: █████░░░░░ 52%

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

### Key Learnings from v2.0 (Phase 15)

6. **🚨 Supabase channel reuse gotcha** - `supabase.channel(name)` REUSES existing instances by name. If you have a persistent subscription and call `channel()` with same name to send, then `removeChannel()`, you CLOSE the persistent subscription! Fix: Check `channel.state === 'joined'` before removing. See CLAUDE.md "Supabase Broadcast Channel Gotcha" for full details and code examples.

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

### Deferred Issues

**Public Prompt Usage Tracking (Partial - Phase 16+)**

⚠️ **REMINDER**: Ask the user about this when resuming work on public prompts features.

**What was done (15-FIX2):**
- Migration `20260118104008_allow_public_increment_prompt_usage.sql` allows any authenticated user to increment `times_used` on public prompts (not just the owner)
- RPC `increment_prompt_usage` now checks `user_id = auth.uid() OR visibility = 'public'`
- PromptsContext updated to skip optimistic updates for prompts not in local state (prevents incorrect state when incrementing usage on public prompts you don't own)
- Broadcast implemented to notify Library viewers when public prompt usage changes

**What still needs to be done:**
- Track total public usage separately (aggregate across all users, not just owner's count)
- Distinguish between owner usage vs community usage
- Display community usage metrics on public prompts
- Potentially separate stats: "Used X times by you, Y times by community"
- Consider privacy implications of usage tracking

**Context:** Originally deferred to Phase 16, but basic increment functionality was needed for Phase 15 Library page to work (copying public prompts needs to increment usage). Full usage analytics is still pending.

**Public Library Author Click Filter (Issue 10 - Phase 15.1)**

**Current behavior:**
- Clicking an author name in the Public Library inserts the author name into the search input.
- This overwrites any existing search term and does not use a dedicated author filter.

**Why this matters:**
- The upcoming filter chips (Phase 15.1) are intended to carry author filtering state.
- If author click remains tied to search, the author filter chips risk being ignored or inconsistent.

**Follow-up for Phase 15.1:**
- Decide whether author filtering should support a specific author ID or only Mine/Others.
- Update author click to use the chosen author filter state without clobbering the current search term.

**Missing /library/prompt/:promptId Route (UAT-011 - Critical)**

**Current behavior:**
- PublicLibrary.tsx links prompt cards to `/library/prompt/${prompt.id}` (line 70)
- This route does not exist in App.tsx - only `/library` is defined
- Clicking any prompt card in the Public Library results in a 404 page

**Why this matters:**
- Core functionality is broken - users cannot view details of public prompts
- This blocks the public library from being usable for prompt discovery

**Options to discuss:**
1. **Option A:** Create new `/library/prompt/:promptId` route with dedicated `PublicPromptDetail.tsx` component (read-only view, different from owned prompt detail)
2. **Option B:** Reuse `/dashboard/prompt/:promptId` with read-only mode when viewing others' public prompts (more code reuse but adds complexity)
3. **Option C:** Make library cards non-navigable temporarily (add copy/save actions directly on card, defer detail view)

**Recommendation:** Option A for clean separation. Option C acceptable as interim if time-constrained.

**See:** `.planning/phases/15-public-library-page/15-UAT-ISSUES.md` for full details.

### Blockers/Concerns

**UAT-011 (Critical):** Missing `/library/prompt/:promptId` route causes 404 when clicking any prompt in Public Library. Must be resolved before Phase 15 can be considered fully functional. See Deferred Issues above for options.

### Roadmap Evolution

- Milestone v2.0 created: Public Prompt Library, 10 phases (Phase 11-20)
- Phase 15.1 inserted after Phase 15: Visibility Filter Persistence (URGENT) - Rework filtering system with public/private toggle on Dashboard/Library, persist filter state to user_settings table
- Phase 21 added: Public Library on Landing Page with Smart Auth Gates - Enable unauthenticated users to browse public prompts with smart authentication gates

## Session Continuity

Last session: 2026-01-19
Stopped at: Completed 15.1-01-PLAN.md (filter preferences data layer)
Resume file: None

**Next Steps:**
- Execute 15.1-02-PLAN.md (useFilterPreferences hook)
- Then 15.1-03-PLAN.md (filter chips UI)
