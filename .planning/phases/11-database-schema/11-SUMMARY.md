---
phase: 11-database-schema
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, enum, migration]

# Dependency graph
requires:
  - phase: v1.0-complete
    provides: Existing prompts, user_settings, copy_events tables
provides:
  - prompt_visibility enum type
  - visibility column on prompts table
  - saved_prompts table for live-linking
  - forked_from_prompt_id column for fork tracking
  - default_visibility preference in user_settings
  - Updated RLS policies for public prompt access
affects: [phase-12-type-extensions, phase-14-visibility-toggle, phase-15-public-library, phase-16-add-to-vault, phase-17-fork]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PostgreSQL enum for extensible state (private/public, future unlisted)"
    - "Partial index for sparse columns (forked_from_prompt_id WHERE NOT NULL)"
    - "Junction table for many-to-many (saved_prompts)"
    - "ON DELETE CASCADE for dependent data (saved_prompts)"
    - "ON DELETE SET NULL for soft references (forked_from)"

key-files:
  created:
    - supabase/migrations/20260116000001_public_prompt_library_schema.sql
  modified:
    - src/types/supabase-generated.ts

key-decisions:
  - "Enum for visibility (vs boolean) allows future 'unlisted' state"
  - "saved_prompts as junction table (not column) for proper many-to-many relationship"
  - "forked_from uses SET NULL on delete - forks become independent originals"
  - "Partial index on forked_from saves space since most prompts aren't forks"
  - "All existing prompts default to 'private' - backward compatible"

patterns-established:
  - "Visibility enum pattern: CREATE TYPE prompt_visibility AS ENUM"
  - "RLS for public content: (user_id = auth.uid() OR visibility = 'public')"

issues-created: []

# Metrics
duration: 12min
completed: 2026-01-16
---

# Phase 11: Database Schema Summary

**PostgreSQL schema for Public Prompt Library with visibility enum, saved_prompts junction table, fork tracking, and updated RLS policies**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-16T00:00:00Z
- **Completed:** 2026-01-16T00:12:00Z
- **Tasks:** 6
- **Files modified:** 2

## Accomplishments

- Created `prompt_visibility` enum type with 'private' and 'public' values
- Added `visibility` column to prompts table (default 'private', indexed)
- Updated prompts RLS to allow reading public prompts from any authenticated user
- Created `saved_prompts` table for live-linked prompt references with full RLS
- Added `forked_from_prompt_id` column with self-referential FK and partial index
- Added `default_visibility` to user_settings for user preferences
- Regenerated TypeScript types with all new schema elements

## Task Commits

Each task was committed atomically:

1. **Tasks 1-6: Full database schema** - `58d9b7c` (feat)

**Note:** All schema changes were applied in a single migration for transactional consistency.

## Files Created/Modified

- `supabase/migrations/20260116000001_public_prompt_library_schema.sql` - Comprehensive migration with enum, tables, columns, RLS, and indexes
- `src/types/supabase-generated.ts` - Regenerated types with prompt_visibility enum, saved_prompts table, new columns

## Decisions Made

1. **Enum over boolean for visibility** - Allows future 'unlisted' state without schema migration
2. **saved_prompts as junction table** - Proper many-to-many relationship vs. column on prompts
3. **ON DELETE CASCADE for saved_prompts** - Saved entry meaningless without source prompt
4. **ON DELETE SET NULL for forked_from** - Forks become independent if original deleted
5. **Partial index for forked_from** - Most prompts aren't forks, saves index space
6. **Single migration file** - All related changes atomic, easier to reason about

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully. Minor setup notes:
- Required `npx supabase link` before first `db push` (expected for fresh session)
- Used bash-style redirect for type generation (subagent environment difference)

## Next Phase Readiness

- Schema complete and applied to remote database
- TypeScript types regenerated and verified
- Build passes, no lint errors
- Ready for Phase 12: Type Extensions (TypeScript interfaces for new tables)

---
*Phase: 11-database-schema*
*Completed: 2026-01-16*
