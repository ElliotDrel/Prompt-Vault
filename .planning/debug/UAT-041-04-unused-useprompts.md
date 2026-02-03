---
status: diagnosed
trigger: "UAT-041-04-unused-useprompts: PublicPromptDetail.tsx may have unused destructured values from usePrompts()"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: togglePinPrompt, incrementCopyCount, incrementPromptUsage are destructured on line 18 but never used because PromptView has its own usePrompts() call
test: grep for all usages in file and check PromptView implementation
expecting: if only found on destructure line (18), hypothesis confirmed
next_action: return diagnosis

## Symptoms

expected: Only import/destructure what is used
actual: togglePinPrompt, incrementCopyCount, incrementPromptUsage destructured but never used in PublicPromptDetail.tsx
errors: None - dead code
reproduction: Static code analysis
started: Code review finding from PR #41

## Eliminated

(none)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: PublicPromptDetail.tsx line 18
  found: "const { togglePinPrompt, incrementCopyCount, incrementPromptUsage } = usePrompts();"
  implication: These three values are destructured from context

- timestamp: 2026-02-03T00:00:00Z
  checked: grep for togglePinPrompt|incrementCopyCount|incrementPromptUsage in PublicPromptDetail.tsx
  found: Only one match on line 18 (the destructure line itself)
  implication: These values are NEVER used elsewhere in the file - confirmed dead code

- timestamp: 2026-02-03T00:00:00Z
  checked: PromptView.tsx line 87
  found: "const { stats, togglePinPrompt, toggleVisibility, incrementCopyCount, incrementPromptUsage } = usePrompts();"
  implication: PromptView has its OWN usePrompts() call and uses these functions for handlePin (line 144), handleCopy (lines 182-183), handleCopyHistoryEvent (lines 233-234)

- timestamp: 2026-02-03T00:00:00Z
  checked: PublicPromptDetail.tsx usage pattern
  found: Component passes prompt to PromptView but never calls any of the destructured functions directly
  implication: The destructured values in PublicPromptDetail are completely redundant

## Resolution

root_cause: PublicPromptDetail.tsx line 18 destructures togglePinPrompt, incrementCopyCount, incrementPromptUsage from usePrompts(), but these are never used. The PromptView child component has its own usePrompts() call at line 87 and handles all copy/pin operations internally. The parent component only needs to pass the prompt object and callbacks - it does not orchestrate the context operations.
fix: (not applied - diagnose only mode)
verification: (not applied - diagnose only mode)
files_changed: []
