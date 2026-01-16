# Roadmap: Prompt Vault

## Milestones

- [v1.0 Version History](milestones/v1.0-ROADMAP.md) (Phases 1-8.2) - SHIPPED 2026-01-13
- 🚧 **v2.0 Public Prompt Library** - Phases 11-20 (in progress)

## Completed Milestones

<details>
<summary>v1.0 Version History (Phases 1-8.2) - SHIPPED 2026-01-13</summary>

Google Docs-style version history tracking for prompt editing. Automatic snapshots, inline diff highlighting, and one-click revert.

- [x] Phase 1: Database Schema & RLS (1/1 plans) - completed 2026-01-11
- [x] Phase 2: Database Functions & Type Definitions (4/4 plans) - completed 2026-01-11
- [x] Phase 3: Storage Adapter Integration (2/2 plans) - completed 2026-01-11
- [x] Phase 4: Diff Engine & Utilities (1/1 plan) - completed 2026-01-11
- [x] Phase 5: Version List Components (2/2 plans) - completed 2026-01-11
- [x] Phase 6: Diff Display & Modal (2/2 plans) - completed 2026-01-11
- [x] Phase 7: Revert & Integration (2/2 plans) - completed 2026-01-11
- [x] Phase 7.1: Version History UI Enhancements (5/5 plans) - completed 2026-01-12
- [x] Phase 8: Backfill Existing Prompts as Version One (1/1 plan) - completed 2026-01-12
- [x] Phase 8.1: Discover Version History from Copy Events (1/1 plan) - completed 2026-01-13
- [x] Phase 8.2: Apply Verified Version History to Database (1/1 plan) - completed 2026-01-13

**Total:** 10 phases, 22 plans, 4 days

See [full archive](milestones/v1.0-ROADMAP.md) for details.

</details>

### 🚧 v2.0 Public Prompt Library (In Progress)

**Milestone Goal:** Enable users to share prompts publicly and discover prompts from others, with live-linking and forking capabilities.

#### Phase 11: Database Schema

**Goal**: Create visibility enum, saved_prompts table, forked_from tracking, and app settings for default visibility
**Depends on**: v1.0 complete
**Research**: Unlikely (Supabase patterns established)
**Plans**: TBD

Plans:
- [ ] 11-01: TBD (run /gsd:plan-phase 11 to break down)

#### Phase 12: Shared Component Architecture

**Goal**: Refactor prompt list and card components for reuse across dashboard, library, and history pages
**Depends on**: Phase 11
**Research**: Unlikely (internal refactoring)
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

#### Phase 13: URL-Based Search/Filter

**Goal**: Sync search queries and author filters to URL params on dashboard, library, and history pages
**Depends on**: Phase 12
**Research**: Unlikely (React Router already in codebase)
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

#### Phase 14: Visibility Toggle

**Goal**: UI to mark prompts public/private with RLS policies for cross-user access
**Depends on**: Phase 13
**Research**: Unlikely (UI + RLS patterns established)
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

#### Phase 15: Public Library Page

**Goal**: New /library route showing all public prompts with author attribution and clickable author filter
**Depends on**: Phase 14
**Research**: Unlikely (building on existing patterns)
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

#### Phase 16: Add to Vault

**Goal**: Live-link functionality to add public prompts as read-only synced references with version history access
**Depends on**: Phase 15
**Research**: Unlikely (extending existing patterns)
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

#### Phase 17: Fork

**Goal**: Create editable copies with source tracking, version history inheritance, and fork point marking
**Depends on**: Phase 16
**Research**: Unlikely (extending version history system)
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

#### Phase 18: Cross-Platform Metrics

**Goal**: Aggregate views for total uses, time saved, saves count, and remix count on public prompts
**Depends on**: Phase 17
**Research**: Unlikely (SQL aggregates, existing UI patterns)
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

#### Phase 19: Copy History Attribution

**Goal**: Indicate external prompts in copy history cards and enable author filter on history page
**Depends on**: Phase 18
**Research**: Unlikely (extending copy history)
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

#### Phase 20: Auto-Fork on Unavailable

**Goal**: Automatically convert linked prompts to forks when original becomes private or deleted
**Depends on**: Phase 19
**Research**: Likely (triggers/background jobs for detecting unavailability)
**Research topics**: Supabase database triggers, pg_cron for scheduled checks, realtime event handling
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 Version History | 10 | 22 | Complete | 2026-01-13 |
| v2.0 Public Prompt Library | 10 | 0/? | In Progress | - |

---

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 11. Database Schema | v2.0 | 0/? | Not started | - |
| 12. Shared Component Architecture | v2.0 | 0/? | Not started | - |
| 13. URL-Based Search/Filter | v2.0 | 0/? | Not started | - |
| 14. Visibility Toggle | v2.0 | 0/? | Not started | - |
| 15. Public Library Page | v2.0 | 0/? | Not started | - |
| 16. Add to Vault | v2.0 | 0/? | Not started | - |
| 17. Fork | v2.0 | 0/? | Not started | - |
| 18. Cross-Platform Metrics | v2.0 | 0/? | Not started | - |
| 19. Copy History Attribution | v2.0 | 0/? | Not started | - |
| 20. Auto-Fork on Unavailable | v2.0 | 0/? | Not started | - |
