---
status: diagnosed
trigger: "isOwnPrompt prop in PromptCard.tsx has confusing naming - green highlight appears when FALSE"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: The prop naming is confusing because green styling is applied when isOwnPrompt === false, which creates a double-negative mental model
test: Trace the logic from definition to usage to parent callers
expecting: Confirm whether the naming is truly counterintuitive or has valid reasoning
next_action: Return diagnosis

## Symptoms

expected: Prop name should match its visual effect intuitively
actual: isOwnPrompt=false triggers green highlight, which is counterintuitive
errors: Confusing for maintainers
reproduction: Read code logic in PromptCard.tsx line 223
started: Code review finding from PR #41

## Eliminated

(none)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: PromptCard.tsx prop definition (line 80-81)
  found: `isOwnPrompt?: boolean;` with JSDoc "Whether this prompt is owned by the current user (for visual distinction in Library)"
  implication: The prop correctly describes ownership status

- timestamp: 2026-02-03T00:00:00Z
  checked: PromptCard.tsx styling logic (line 222-224)
  found: `isOwnPrompt === false ? 'ring-2 ring-green-500/50 bg-green-50/30' : ''`
  implication: Green highlight is applied when NOT owner's prompt (others' prompts get green)

- timestamp: 2026-02-03T00:00:00Z
  checked: PublicLibrary.tsx usage (line 98)
  found: `isOwnPrompt={prompt.authorId === user?.id}`
  implication: Prop is passed correctly - true when user owns it, false when someone else authored it

- timestamp: 2026-02-03T00:00:00Z
  checked: Full semantic understanding
  found: In Library view, users want visual distinction for prompts they DON'T own. The green highlight marks "this is someone else's prompt" - community-shared content. This is intentional UX.
  implication: The issue is NOT the prop naming but the conditional logic interpretation

## Resolution

root_cause: The naming is NOT confusing - the confusion stems from misunderstanding the UX intent. The prop `isOwnPrompt` correctly represents "is this the current user's prompt?" (true = mine, false = not mine). The green styling intentionally highlights OTHER users' prompts in the Library view to create visual distinction - "look, here's community content you discovered!" The styling condition `isOwnPrompt === false` correctly applies green to non-owned prompts. The prop name accurately describes its value; the styling logic accurately applies visual treatment to the intended case.

fix: N/A (diagnosis only mode)
verification: N/A
files_changed: []
