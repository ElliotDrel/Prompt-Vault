---
status: diagnosed
trigger: "UAT-041-11-search-normalization: Search in usePromptFilters.ts only uses toLowerCase(), not full normalization pattern from CLAUDE.md"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: Search filtering in usePromptFilters.ts uses only .toLowerCase() instead of the full normalization pattern
test: Read search logic at lines 114-127 and compare to CLAUDE.md guideline
expecting: Confirm .toLowerCase() is used without .replace(/[\s_]+/g, '') normalization
next_action: Complete diagnosis - root cause confirmed

## Symptoms

expected: Per CLAUDE.md - normalize with `.replace(/[\s_]+/g, '').toLowerCase()`
actual: Search only uses .toLowerCase() without space/underscore normalization
errors: Searching "my_variable" won't match "myvariable" or "my variable"
reproduction: Search with underscores or spaces vs content without them
started: Code review finding from PR #41

## Eliminated

(none - initial hypothesis confirmed on first check)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: src/hooks/usePromptFilters.ts lines 114-127
  found: |
    Line 116: `const searchLower = searchTerm.toLowerCase();`
    Line 118: `prompt.title.toLowerCase().includes(searchLower)`
    Line 119: `prompt.body.toLowerCase().includes(searchLower)`
    Line 123-124: author fields also use only `.toLowerCase()`
  implication: Search uses ONLY toLowerCase(), no space/underscore normalization applied

- timestamp: 2026-02-03T00:00:00Z
  checked: CLAUDE.md lines 464-467 (String Normalization section)
  found: |
    "Normalize consistently across ALL comparison points: `.replace(/[\s_]+/g, '').toLowerCase()`"
    "Grep for all locations where string type is compared and update together"
    "Centralize normalization in utilities, do not scatter it"
  implication: CLAUDE.md mandates full normalization pattern, not just toLowerCase()

- timestamp: 2026-02-03T00:00:00Z
  checked: src/config/variableRules.ts lines 69-73
  found: |
    Existing utility function `normalizeVariableName`:
    ```typescript
    export function normalizeVariableName(variableName: string): string {
      return variableName.replace(/[\s_]+/g, '').toLowerCase();
    }
    ```
    Already used in PromptEditor.tsx and variableUtils.ts
  implication: Normalization utility exists but is not used by search filtering

## Resolution

root_cause: |
  Search filtering in usePromptFilters.ts (lines 114-127) applies only `.toLowerCase()`
  for case-insensitive matching, but does NOT apply the full normalization pattern
  `.replace(/[\s_]+/g, '').toLowerCase()` as specified in CLAUDE.md.

  This means:
  - Search term "my_variable" will NOT match prompt containing "myvariable"
  - Search term "my variable" will NOT match prompt containing "myvariable"
  - The existing `normalizeVariableName` utility from variableRules.ts could be
    reused/adapted, but is not imported or used in usePromptFilters.ts

  The guideline in CLAUDE.md was written specifically to prevent this inconsistency.

fix: (not applied - diagnosis only mode)
verification: (not performed - diagnosis only mode)
files_changed: []
