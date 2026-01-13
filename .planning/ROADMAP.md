# Roadmap: Prompt Vault - Version History

## Overview

This roadmap implements Google Docs-style version history tracking for prompt editing. The journey takes us from database infrastructure through diff visualization to a complete revert system, ensuring users never lose work while gaining full visibility into how their prompts evolve over time. Each phase builds toward automatic, transparent version tracking with inline diff highlighting and one-click revert functionality.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Database Schema & RLS** - Create prompt_versions table with consolidation fields, indexes, and RLS policies
- [x] **Phase 2: Database Functions & Type Definitions** - Create RPC functions for version CRUD, consolidation logic, TypeScript interfaces
- [x] **Phase 3: Storage Adapter Integration** - Extend adapter to capture snapshots on add/update, skip metadata-only changes
- [x] **Phase 4: Diff Engine & Utilities** - Install diff library, create computation utilities, build variable change badges
- [x] **Phase 5: Version List Components** - Build time-grouped version list with Accordion UI and pagination
- [x] **Phase 6: Diff Display & Modal** - Create inline diff highlighting and two-column modal with comparison toggles
- [x] **Phase 7: Revert & Integration** - Implement revert flow, auto-save, history buttons in view/edit modes
- [ ] **Phase 7.1: Version History UI Enhancements (INSERTED)** - Layout flip, diff toggle, revert tracking, component reuse
- [ ] **Phase 8: Day-Level Diff View** - Add combined diff when clicking day headers in version history
- [ ] **Phase 9: Backfill Existing Prompts as Version One** - Create migration to save all current prompts as version one

## Phase Details

### Phase 1: Database Schema & RLS
**Goal**: Create the foundational version tracking infrastructure with proper security and indexing
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established Supabase patterns, RLS follows existing prompt policies)
**Plans**: TBD

Plans:
- [x] 01-01: Create prompt_versions table, RLS policies, and realtime publication (completed 2026-01-11)

### Phase 2: Database Functions & Type Definitions
**Goal**: Implement server-side CRUD logic and define TypeScript interfaces for version data
**Depends on**: Phase 1
**Research**: Unlikely (following existing RPC patterns and TypeScript conventions)
**Plans**: TBD

Plans:
- [x] 02-01: Create create_prompt_version RPC function (completed 2026-01-11)
- [x] 02-02: Create get_prompt_versions RPC function with pagination (completed 2026-01-11)
- [x] 02-03: Create consolidate_prompt_versions function (completed 2026-01-11)
- [x] 02-04: Define TypeScript interfaces for version data structures (completed 2026-01-11)

### Phase 3: Storage Adapter Integration
**Goal**: Wire version tracking into existing prompt CRUD operations transparently
**Depends on**: Phase 2
**Research**: Unlikely (extending existing adapter patterns already in codebase)
**Plans**: TBD

Plans:
- [x] 03-01: Create SupabaseVersionsAdapter class (completed 2026-01-11)
- [x] 03-02: Integrate version tracking into CRUD operations (completed 2026-01-11)

### Phase 4: Diff Engine & Utilities
**Goal**: Implement word-level diffing and variable change visualization
**Depends on**: Phase 3
**Research**: Likely (new library integration, performance considerations)
**Research topics**: diff npm package API, word-level vs character-level performance with large text, optimization strategies
**Plans**: TBD

Plans:
- [x] 04-01: Diff engine and utility functions (completed 2026-01-11)

### Phase 5: Version List Components
**Goal**: Build scannable version history UI with time-based grouping
**Depends on**: Phase 4
**Research**: Unlikely (using existing shadcn/ui Accordion patterns)
**Plans**: TBD

Plans:
- [x] 05-01: Create usePromptVersions hook and VersionListItem component (completed 2026-01-11)
- [x] 05-02: Create VersionList with Accordion time-grouping and pagination (completed 2026-01-11)

### Phase 6: Diff Display & Modal
**Goal**: Create inline diff highlighting and main modal interface
**Depends on**: Phase 5
**Research**: Unlikely (following existing modal patterns from variable input dialog)
**Plans**: 2

Plans:
- [x] 06-01: Create VersionDiff component with inline highlighting (completed 2026-01-11)
- [x] 06-02: Build VersionHistoryModal with two-column layout and comparison toggle (completed 2026-01-11)

Note: Comparison toggle merged into 06-02 (tightly coupled). Empty state already handled by VersionList (Phase 5).

### Phase 7: Revert & Integration
**Goal**: Enable one-click revert with auto-save and integrate history buttons throughout UI
**Depends on**: Phase 6
**Research**: Unlikely (standard React Query patterns and context integration)
**Plans**: 2

Plans:
- [x] 07-01: Create useRevertToVersion hook and RevertConfirmDialog component (completed 2026-01-11)
- [x] 07-02: Integrate history modal into PromptView and PromptEditor (completed 2026-01-11)

### Phase 7.1: Version History UI Enhancements (INSERTED)
**Goal**: Improve version history UX with layout changes, diff toggle, revert tracking, and component reuse
**Depends on**: Phase 7
**Research**: Unlikely (refactoring existing components)
**Plans**: 3

**Requirements:**
1. **Current version shows diff from previous** - In "Compare to Previous" mode, the Current version card should show changes from the previous version (consistent with other cards)
2. **Revert tracking** - When a version is reverted, display in version history that "this version was reverted to from version X"
3. **Diff toggle** - Add a toggle button to show/hide diff highlighting, allowing users to see the exact original version without markup
4. **Layout flip** - Move history panel to right side, prompt detail to left side
5. **Component reuse** - Prompt detail area should use the same base components as the detail page (single implementation)

Plans:
- [x] 7.1-01: Add revert tracking database column and update types/adapter (completed 2026-01-12)
- [x] 7.1-02: Layout flip and diff toggle implementation (completed 2026-01-12)
- [x] 7.1-03: Current version diff display and revert tracking UI (completed 2026-01-12)
- [x] 7.1-03-FIX: Fix 10 UAT issues from initial testing (completed 2026-01-11)
- [x] 7.1-03-FIX2: Fix 4 UAT issues from re-testing - versioning model correction (completed 2026-01-12)

### Phase 8: Day-Level Diff View
**Goal**: Add Google Docs-style day grouping where clicking a day header shows combined diff of all changes that day
**Depends on**: Phase 7.1
**Research**: Unlikely (UI-only change using existing diff utilities)
**Plans**: TBD

Plans:
- [ ] TBD (run /gsd:plan-phase 8 to break down)

### Phase 9: Backfill Existing Prompts as Version One
**Goal**: Create a migration that captures the current state of all existing prompts as version 1, ensuring users have complete history from feature launch
**Depends on**: Phase 7.1
**Research**: Unlikely (standard SQL migration pattern)
**Plans**: TBD

Plans:
- [ ] TBD (run /gsd:plan-phase 9 to break down)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 7.1 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema & RLS | 1/1 | Complete | 2026-01-11 |
| 2. Database Functions & Type Definitions | 4/4 | Complete | 2026-01-11 |
| 3. Storage Adapter Integration | 2/2 | Complete | 2026-01-11 |
| 4. Diff Engine & Utilities | 1/1 | Complete | 2026-01-11 |
| 5. Version List Components | 2/2 | Complete | 2026-01-11 |
| 6. Diff Display & Modal | 2/2 | Complete | 2026-01-11 |
| 7. Revert & Integration | 2/2 | Complete | 2026-01-11 |
| 7.1. Version History UI Enhancements (INSERTED) | 5/5 | Complete | 2026-01-12 |
| 8. Day-Level Diff View | 0/TBD | Not Started | - |
| 9. Backfill Existing Prompts as Version One | 0/TBD | Not Started | - |
