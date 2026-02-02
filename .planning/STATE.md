# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-13)

**Core value:** Never lose work. Every prompt edit is automatically preserved with complete history, clear diffs showing exactly what changed, and confident one-click revert to any previous state.
**Current focus:** v2.0 Public Prompt Library

## Current Position

Phase: 15.4 of 22 (Public Prompt UX Improvements) - IN PROGRESS
Plan: 2 of 4 complete (15.4-02: Navigation Flow Improvements)
Status: Phase 15.4 in progress - Relocated View Public Version button, added owner auto-redirect
Last activity: 2026-02-02 - Completed 15.4-02-PLAN.md

Progress: ██████░░░░ 63%

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
- Relocate View Public Version button to top-right near visibility toggle (groups visibility-related controls)
- Auto-redirect owners from Library to Dashboard (reduces friction, no need to see public view banner)
- Use replace: true in navigate for auto-redirect (avoids polluting browser history)

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

**Public Library Author Click Filter (Issue 10 - RESOLVED in Phase 15.1)**

**Resolution:**
- Removed onAuthorClick handler from Library - author names are now display-only text
- Added author filter in View Options popover: All / Mine / Others
- "Mine" filters to show only the current user's public prompts
- "Others" filters to show only other users' prompts
- This provides cleaner UX without overwriting search terms

**Missing /library/prompt/:promptId Route (UAT-011 - RESOLVED in Phase 15.3)**

**Resolution:**
- Created `PublicPromptDetail.tsx` component as thin wrapper around PromptView
- Registered `/library/prompt/:promptId` route in App.tsx
- Enhanced PromptView with conditional props for public context
- Owners see banner "You're viewing this as others see it" with "View in Dashboard" button
- Non-owners see read-only view (no Edit, Delete, Version History, or Visibility Toggle)
- 404 page for missing/private prompts (same message for security)
- Symmetric navigation: Dashboard ↔ Library for public prompts

**See:** `.planning/phases/15.3-public-prompt-detail-page/15.3-02-SUMMARY.md` for implementation details.

**Cross-Page Author Filtering (Deferred)**

**Desired behavior:**
- Clicking on an author name in Public Library should filter to show all prompts by that user
- Should work across both `/dashboard` (your prompts by that author if you have any) and `/library` (their public prompts)
- Navigation flow: Click author → navigate to `/library?author=<identifier>` or show prompts inline

**Current state:**
- Author names are display-only text (Phase 15.1 removed click handler)
- Author filter exists but only as All/Mine/Others dropdown, not specific user targeting

**Implementation considerations:**
- Requires user identifier system (see below)
- May need cross-page URL param support for author=<user_identifier>

**User Profiles with Display Names & Smart Identifiers (Deferred)**

**Requirements:**
1. Collect full name on signup (new users)
2. Prompt existing users to add their name on next login
3. Display name shown on prompts, fallback to "Anonymous" if not provided
4. Smart searchable identifier that is:
   - Precise (uniquely identifies a user)
   - Human-friendly (not a raw UUID like `a1b2c3d4-e5f6-...`)
   - Searchable via URL params

**Identifier options to consider:**
- **Short code**: 6-8 alphanumeric (e.g., `abc123xy`) - generated from UUID hash
- **Handle**: Auto-generated from name + discriminator (e.g., `john-doe-42`)
- **Username**: User-chosen unique handle (requires uniqueness check)

**Database changes needed:**
- Add `display_name` column to user profile/settings
- Add `user_handle` or `short_id` column for search identifier
- Consider `profiles` table vs extending `user_settings`

**UI changes needed:**
- Signup flow: Add name field
- Return user prompt: "Add your name" modal/banner
- Author display: Show name or "Anonymous"
- Author click: Filter by user handle/identifier

### Blockers/Concerns

None - UAT-011 resolved in Phase 15.3.

### Roadmap Evolution

- Milestone v2.0 created: Public Prompt Library, 10 phases (Phase 11-20)
- Phase 15.1 inserted after Phase 15: Visibility Filter Persistence (URGENT) - Rework filtering system with public/private toggle on Dashboard/Library, persist filter state to user_settings table
- Phase 21 added: Public Library on Landing Page with Smart Auth Gates - Enable unauthenticated users to browse public prompts with smart authentication gates
- Phase 15.2 inserted after Phase 15.1: Rework Filter UI - Visual redesign of filtering UI for improved aesthetics
- Phase 22 added: Mobile Optimization - Optimize UI across all pages for mobile devices (current UI is unusable on mobile)
- Phase 15.3 inserted after Phase 15.2: Public Prompt Detail Page (URGENT) - Resolves UAT-011 critical 404 bug
- Phase 15.4 inserted after Phase 15.3: Public Prompt UX Improvements - Realtime usage history, owner redirect flow, preview button, visual distinction for owned prompts, copy history context notes

## Session Continuity

Last session: 2026-02-02
Stopped at: Completed 15.4-02-PLAN.md (Navigation Flow Improvements)
Resume file: .planning/phases/15.4-public-prompt-ux-improvements/15.4-02-SUMMARY.md

**Next Steps:**
- Complete Phase 15.4: Plans 03-04 (Owner visual distinction, Preview button, Copy history context)
- Phase 16: Add to Vault - Live-link functionality
- Phase 17: Public Prompt Search & Discovery
- Phase 18: Analytics & Insights
