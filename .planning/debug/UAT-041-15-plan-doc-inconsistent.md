---
status: diagnosed
trigger: "UAT-041-15-plan-doc-inconsistent - Plan document mentions both refetch() and invalidateQueries() but implementation only uses invalidateQueries()"
created: 2026-02-03T12:00:00Z
updated: 2026-02-03T12:00:00Z
---

## Current Focus

hypothesis: Plan document contains contradictory guidance - line 65 suggests refetch() while line 70 suggests invalidateQueries()
test: Read plan document and compare with implementation
expecting: Documentation inconsistency confirmed
next_action: Document root cause

## Symptoms

expected: Plan document should give consistent guidance
actual: Plan mentions refetch() at line 65 but also invalidateQueries at line 70
errors: Confusing documentation
reproduction: Read plan document
started: Code review finding from PR #41

## Eliminated

(none - issue confirmed on first investigation)

## Evidence

- timestamp: 2026-02-03T12:00:00Z
  checked: .planning/phases/15.4-public-prompt-ux-improvements/15.4-01-PLAN.md lines 64-70
  found: |
    Line 65: "When 'copyEvents' is received, call `refetch()` to refresh the copy history list"
    Line 70: "Important: Use React Query's `invalidateQueries` method with the appropriate query key to trigger refetch"
  implication: The plan gives two different approaches in the same task - refetch() first, then invalidateQueries() with more emphasis ("Important:")

- timestamp: 2026-02-03T12:01:00Z
  checked: src/hooks/useInfiniteCopyEvents.ts lines 206-232
  found: |
    Implementation uses invalidateQueries (lines 220-225):
    ```typescript
    queryClient.invalidateQueries({
      queryKey: ['copyEvents'],
      refetchType: 'active',
    })
    ```
  implication: Implementation correctly followed the "Important" note (invalidateQueries) and did not use refetch()

- timestamp: 2026-02-03T12:02:00Z
  checked: src/contexts/CopyHistoryContext.tsx
  found: |
    - CopyHistoryContext uses useInfiniteCopyEvents hook (line 52-73)
    - The realtime subscription and invalidation is handled by useInfiniteCopyEvents, not directly in the context
    - Context exposes refetch() from the hook but it's for manual refresh, not realtime updates
  implication: Implementation is correct - realtime updates use invalidateQueries via the shared hook

## Resolution

root_cause: |
  The plan document 15.4-01-PLAN.md contains contradictory guidance in Task 1 (lines 64-70):

  1. Line 65 initially suggests: "call `refetch()` to refresh the copy history list"
  2. Line 70 then states: "Important: Use React Query's `invalidateQueries` method"

  Both approaches can work, but the document presents them as if both should be done, when really
  the "Important" note on line 70 is a correction/clarification of the earlier suggestion.

  The implementation correctly chose `invalidateQueries()` which is the better approach because:
  - It uses `refetchType: 'active'` to only refetch queries that are currently being observed
  - It invalidates all copy event queries at once (global history + prompt-specific history)
  - It avoids redundant refetches on inactive queries

  The documentation inconsistency is a stylistic issue - the plan was written with an initial idea
  (refetch) that was then refined (invalidateQueries) but the initial suggestion wasn't removed.

fix: (not fixing - diagnosis only mode)
verification: (not applicable)
files_changed: []
