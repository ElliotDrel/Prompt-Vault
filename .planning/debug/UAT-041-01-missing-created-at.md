---
status: investigating
trigger: "UAT-041-01-missing-created-at: getPublicPrompts() may be missing `created_at` in SELECT"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: getPublicPrompts() is missing `created_at` in its SELECT statement, causing createdAt to be undefined in mapped PublicPrompt objects
test: Compare SELECT columns in getPublicPrompts() vs getPublicPromptById()
expecting: If getPublicPrompts() omits created_at, then createdAt will be undefined/NaN when sorting
next_action: Document evidence from code examination

## Symptoms

expected: Sorting by "Created" in Library should order prompts by creation date
actual: Alleged that `created_at` is not selected, so createdAt becomes undefined, causing NaN comparisons
errors: None explicitly - behavior issue
reproduction: Go to Library page, select "Created" sort
started: Code review finding from PR #41

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-02-03T00:00:01Z
  checked: supabaseAdapter.ts getPublicPrompts() method (lines 199-214)
  found: |
    SELECT statement is:
    .select('id, user_id, title, body, variables, updated_at, is_pinned, times_used, visibility')

    MISSING: `created_at` is NOT in the select list
  implication: This is the root cause - created_at is not fetched from database

- timestamp: 2026-02-03T00:00:02Z
  checked: supabaseAdapter.ts getPublicPromptById() method (lines 216-237)
  found: |
    SELECT statement is:
    .select('id, user_id, title, body, variables, created_at, updated_at, is_pinned, times_used, visibility')

    PRESENT: `created_at` IS in the select list
  implication: getPublicPromptById() is correct; getPublicPrompts() is inconsistent

- timestamp: 2026-02-03T00:00:03Z
  checked: mapPublicPromptRow function (lines 63-78)
  found: |
    The mapper expects row.created_at:
    `createdAt: row.created_at,`

    If created_at is not in SELECT, row.created_at will be undefined
  implication: Mapper will set createdAt to undefined for public prompts list

- timestamp: 2026-02-03T00:00:04Z
  checked: usePromptFilters.ts sort logic (lines 143-144)
  found: |
    Sort by createdAt does:
    `comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();`

    If createdAt is undefined, new Date(undefined).getTime() returns NaN
    NaN - NaN = NaN, causing unpredictable sort order
  implication: Sorting by "Created" will produce inconsistent results

## Resolution

root_cause: |
  getPublicPrompts() in supabaseAdapter.ts line 205 is missing `created_at` in its SELECT statement.
  The SELECT is: 'id, user_id, title, body, variables, updated_at, is_pinned, times_used, visibility'
  Should be:     'id, user_id, title, body, variables, created_at, updated_at, is_pinned, times_used, visibility'

  This causes mapPublicPromptRow to set createdAt: undefined for all public prompts.
  When sorting by "Created" (sortBy === 'createdAt'), new Date(undefined).getTime() returns NaN,
  causing NaN - NaN comparisons which produce unpredictable sort order.

  Contrast with getPublicPromptById() (line 222) which correctly includes created_at.
fix: (not applied - find_root_cause_only mode)
verification: (not performed - find_root_cause_only mode)
files_changed: []
