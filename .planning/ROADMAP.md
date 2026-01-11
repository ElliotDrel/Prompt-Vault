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
- [ ] **Phase 6: Diff Display & Modal** - Create inline diff highlighting and two-column modal with comparison toggles
- [ ] **Phase 7: Revert & Integration** - Implement revert flow, auto-save, history buttons in view/edit modes
- [ ] **Phase 8: Consolidation Scheduling (DEFERRED)** - Set up pg_cron background job for tiered version consolidation

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
**Plans**: TBD

Plans:
- [ ] 06-01: Create VersionDiff component with inline highlighting
- [ ] 06-02: Build VersionHistoryModal with two-column layout
- [ ] 06-03: Add comparison mode toggle (previous vs current)
- [ ] 06-04: Implement empty state for prompts without history

### Phase 7: Revert & Integration
**Goal**: Enable one-click revert with auto-save and integrate history buttons throughout UI
**Depends on**: Phase 6
**Research**: Unlikely (standard React Query patterns and context integration)
**Plans**: TBD

Plans:
- [ ] 07-01: Implement revert flow with AlertDialog confirmation
- [ ] 07-02: Add auto-save current state before revert
- [ ] 07-03: Add history button to PromptView component
- [ ] 07-04: Add history button to PromptEditor component
- [ ] 07-05: Add loading states and error handling

### Phase 8: Consolidation Scheduling (DEFERRED)
**Goal**: Set up automated version consolidation to manage storage growth
**Depends on**: Phase 7
**Research**: Likely (new infrastructure setup)
**Research topics**: pg_cron extension setup in Supabase, cron syntax, scheduled function monitoring patterns
**Plans**: TBD

**Note**: Per PROJECT.md decision, this phase is deferred until storage needs prove it's necessary. Ship core feature first (Phases 1-7), optimize later based on real usage patterns.

Plans:
- [ ] 08-01: Enable pg_cron extension in Supabase
- [ ] 08-02: Create migration to schedule daily consolidation job

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (deferred)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Schema & RLS | 1/1 | Complete | 2026-01-11 |
| 2. Database Functions & Type Definitions | 4/4 | Complete | 2026-01-11 |
| 3. Storage Adapter Integration | 2/2 | Complete | 2026-01-11 |
| 4. Diff Engine & Utilities | 1/1 | Complete | 2026-01-11 |
| 5. Version List Components | 2/2 | Complete | 2026-01-11 |
| 6. Diff Display & Modal | 0/4 | Not started | - |
| 7. Revert & Integration | 0/5 | Not started | - |
| 8. Consolidation Scheduling (DEFERRED) | 0/2 | Deferred | - |
