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

#### Phase 11: Database Schema - COMPLETE

**Goal**: Create visibility enum, saved_prompts table, forked_from tracking, and app settings for default visibility
**Depends on**: v1.0 complete
**Research**: Unlikely (Supabase patterns established)
**Plans**: 1/1 complete

Plans:
- [x] 11-01: Database schema for public prompt library (2026-01-16)

#### Phase 12: Shared Component Architecture - COMPLETE

**Goal**: Refactor prompt list and card components for reuse across dashboard, library, and history pages
**Depends on**: Phase 11
**Research**: Unlikely (internal refactoring)
**Plans**: 3/3 complete

Plans:
- [x] 12-01: Shared type definitions (PromptSource, PromptVariant, AuthorInfo) (2026-01-16)
- [x] 12-02: Extract usePromptFilters hook and PromptListView component (2026-01-16)
- [x] 12-03: PromptCard variant props (2026-01-16)

#### Phase 13: URL-Based Search/Filter - COMPLETE

**Goal**: Sync search queries and author filters to URL params on dashboard, library, and history pages
**Depends on**: Phase 12
**Research**: Unlikely (React Router already in codebase)
**Plans**: 1/1 complete

Plans:
- [x] 13-01: URL filter sync hook and integration (2026-01-16)

#### Phase 14: Visibility Toggle - COMPLETE

**Goal**: UI to mark prompts public/private with RLS policies for cross-user access
**Depends on**: Phase 13
**Research**: Unlikely (UI + RLS patterns established)
**Plans**: 1/1 complete

Plans:
- [x] 14-01: Visibility toggle functionality (2026-01-16)

#### Phase 15: Public Library Page - COMPLETE (pending UAT)

**Goal**: New /library route showing all public prompts with author attribution and clickable author filter
**Depends on**: Phase 14
**Research**: Unlikely (building on existing patterns)
**Plans**: 2/2 complete

Plans:
- [x] 15-01: Public prompts data layer (2026-01-16)
- [x] 15-02: Public Library page UI (2026-01-16)

#### 🧪 UAT Checkpoint A: Public Visibility Flow

**Purpose**: Validate end-to-end "make public → appears in library" flow before adding cross-user relationships
**Test scope**:
- Visibility toggle works (private ↔ public)
- RLS allows public read access across users
- Public library shows all public prompts with correct attribution
- Author filter works correctly
**Risk if skipped**: Broken RLS policies would cascade into Phase 16-20 work

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

#### 🧪 UAT Checkpoint B: Cross-User Relationships

**Purpose**: Validate live-linking and forking mechanics before building metrics on top
**Test scope**:
- Add to Vault creates live-linked saved prompts
- Saved prompts show Link2 indicator and stay synced with source
- Fork creates editable copy with correct source tracking
- Version history accessible on both saved and forked prompts
- Forked prompt versions start fresh (not inherited from source)
**Risk if skipped**: Broken relationships would produce incorrect metrics in Phase 18

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

#### 🧪 UAT Checkpoint C: Milestone Integration

**Purpose**: Final integration test before shipping v2.0
**Test scope**:
- Full user journey: create prompt → make public → another user saves → fork → edit fork
- Metrics aggregate correctly across saves and forks
- Copy history shows correct attribution for external prompts
- Auto-fork triggers when source prompt becomes unavailable
- No regressions in v1.0 functionality (version history, revert, diff)
**Risk if skipped**: Shipping broken milestone to production

## Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v1.0 Version History | 10 | 22 | Complete | 2026-01-13 |
| v2.0 Public Prompt Library | 10 | 8/? | In Progress | - |

---

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 11. Database Schema | v2.0 | 1/1 | Complete | 2026-01-16 |
| 12. Shared Component Architecture | v2.0 | 3/3 | Complete | 2026-01-16 |
| 13. URL-Based Search/Filter | v2.0 | 1/1 | Complete | 2026-01-16 |
| 14. Visibility Toggle | v2.0 | 1/1 | Complete | 2026-01-16 |
| 15. Public Library Page | v2.0 | 2/2 | Complete | 2026-01-16 |
| 🧪 **UAT Checkpoint A** | v2.0 | — | Pending | - |
| 16. Add to Vault | v2.0 | 0/? | Not started | - |
| 17. Fork | v2.0 | 0/? | Not started | - |
| 🧪 **UAT Checkpoint B** | v2.0 | — | Pending | - |
| 18. Cross-Platform Metrics | v2.0 | 0/? | Not started | - |
| 19. Copy History Attribution | v2.0 | 0/? | Not started | - |
| 20. Auto-Fork on Unavailable | v2.0 | 0/? | Not started | - |
| 🧪 **UAT Checkpoint C** | v2.0 | — | Pending | - |
