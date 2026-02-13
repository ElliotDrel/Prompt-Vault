---
status: investigating
trigger: "UAT-041-06-visibility-validation: filterVisibility from database may be applied without validation in useURLFilterSync.ts"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: prefs.filterVisibility is applied directly at line 145-146 without validation, while sortBy IS validated with isValidSortBy() at line 148
test: Compare lines 145-148 in useURLFilterSync.ts to verify validation inconsistency
expecting: If inconsistent, confirms root cause; if both validated, issue is false positive
next_action: Document evidence from code analysis

## Symptoms

expected: DB values should be validated with isValidVisibilityFilter() before applying
actual: Alleged that prefs.filterVisibility is applied directly without validation (unlike sortBy which IS validated)
errors: Corrupted DB values could break UI
reproduction: If invalid value exists in user_settings.filter_visibility column
started: Code review finding from PR #41

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-02-03T00:01:00Z
  checked: useURLFilterSync.ts lines 138-157 (DB preference loading useEffect)
  found: |
    Line 145-146: `if (!searchParams.has(visibilityParam) && prefs.filterVisibility !== 'all') { setVisibilityFilterState(prefs.filterVisibility); }`
    Line 148: `if (!searchParams.has(sortByParam) && isValidSortBy(prefs.sortBy) && prefs.sortBy !== defaultSortBy) { setSortByState(prefs.sortBy); }`
    Line 151: `if (!searchParams.has(sortDirParam) && prefs.sortDirection !== defaultSortDirection) { setSortDirectionState(prefs.sortDirection); }`
  implication: |
    CONFIRMED INCONSISTENCY:
    - sortBy at line 148: Uses isValidSortBy() validation before applying
    - filterVisibility at line 145-146: NO validation, just checks !== 'all'
    - sortDirection at line 151: Also NO validation, just checks !== default

    If DB contains invalid value like 'garbage', it will be set to state without validation.

- timestamp: 2026-02-03T00:02:00Z
  checked: Validation functions defined at lines 51-65
  found: |
    isValidVisibilityFilter() exists at line 59-61
    isValidSortDirection() exists at line 55-57
    Both functions ARE defined but NOT used in DB preference loading
  implication: Validation functions exist but are only used for URL parsing (lines 193-197), not for DB preference loading

## Resolution

root_cause: |
  In useURLFilterSync.ts lines 143-156, DB preferences are loaded with INCONSISTENT validation:
  - sortBy (line 148): Validated with isValidSortBy() before applying to state
  - filterVisibility (line 145-146): NOT validated, directly applied if !== 'all'
  - sortDirection (line 151): NOT validated, directly applied if !== default

  If user_settings.filter_visibility or sort_direction contains an invalid/corrupted value,
  it will be set to React state without validation, potentially breaking UI rendering or
  causing unexpected behavior in filter logic.

  The validation functions isValidVisibilityFilter() and isValidSortDirection() exist (lines 55-61)
  but are only used when parsing URL params (lines 193-197), not when loading DB prefs.

fix: (diagnose only - not applying fix)
verification: (diagnose only)
files_changed: []
