---
phase: 01-database-schema-rls
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, migrations, version-tracking]

# Dependency graph
requires:
  - phase: none
    provides: Initial project setup with prompts and copy_events tables
provides:
  - prompt_versions table with immutable snapshot storage
  - RLS policies enforcing user isolation
  - Performance indexes for version queries
  - Realtime publication for future features
affects: [02-database-functions-type-definitions, 03-storage-adapter-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [immutable-snapshots, version-numbering, cascade-delete]

key-files:
  created:
    - supabase/migrations/20260111152134_create_prompt_versions_table.sql
    - supabase/migrations/20260111152611_enable_prompt_versions_realtime.sql
  modified: []

key-decisions:
  - "Separate migrations for schema vs realtime (cleaner history)"
  - "Version numbers controlled by application, not database auto-increment"
  - "No UPDATE RLS policy (versions are immutable)"
  - "CASCADE delete on prompt_id and user_id (history dies with prompt)"

patterns-established:
  - "Immutable snapshot pattern: store complete state, not deltas"
  - "Composite unique constraint on (prompt_id, version_number)"
  - "Performance indexes: user_id, timestamp DESC, composite for lookups"

issues-created: []

# Metrics
duration: 6 min
completed: 2026-01-11
---

# Phase 1 Plan 1: Database Schema & RLS Summary

**Created `prompt_versions` table with immutable snapshot storage, RLS policies enforcing user isolation, and realtime publication for future-proofing**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-11T15:21:16Z
- **Completed:** 2026-01-11T15:27:03Z
- **Tasks:** 3
- **Files modified:** 2 (migrations created)

## Accomplishments

- Created `prompt_versions` table with UUID primary key, foreign keys to prompts and auth.users with CASCADE delete
- Implemented immutable snapshot pattern storing complete prompt state (title, body, variables) per version
- Added composite unique constraint on (prompt_id, version_number) for version uniqueness
- Created performance indexes: prompt_id, user_id, created_at DESC, composite (prompt_id, version_number)
- Enabled Row Level Security with SELECT, INSERT, DELETE policies (no UPDATE - versions are immutable)
- Added table to supabase_realtime publication for future live updates
- Included consolidation fields (is_consolidated, consolidation_group_id) for deferred Phase 8

## Task Commits

Each task was committed atomically:

1. **Tasks 1-2: Create prompt_versions table with RLS policies** - `3f840cb` (feat)
2. **Task 3: Enable realtime publication for prompt_versions** - `200826d` (feat)

**Plan metadata:** (pending - will be created in final commit)

_Note: Tasks 1 and 2 were combined in a single migration file following the plan specification_

## Files Created/Modified

- `supabase/migrations/20260111152134_create_prompt_versions_table.sql` - Table schema, indexes, constraints, RLS policies
- `supabase/migrations/20260111152611_enable_prompt_versions_realtime.sql` - Realtime publication configuration

## Decisions Made

- **Separate migrations for schema vs realtime**: Follows existing pattern from `enable_realtime.sql`, provides cleaner migration history
- **Application-controlled version numbers**: Version_number is INTEGER without auto-increment, allowing application logic to manage numbering
- **No UPDATE RLS policy**: Versions are immutable snapshots - once created, never modified. Only SELECT, INSERT, DELETE policies needed
- **CASCADE delete strategy**: History automatically deleted when parent prompt or user is deleted, maintaining referential integrity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 2 (Database Functions & Type Definitions) can proceed immediately
- Table structure supports all planned version CRUD operations
- RLS policies ready for RPC function execution context (functions inherit user auth context)
- Indexes optimized for expected query patterns (by prompt_id, by user_id, by time)
- No blockers identified

---
*Phase: 01-database-schema-rls*
*Completed: 2026-01-11*
