---
status: diagnosed
trigger: "the other people's prompts are NOT correlated correctly - border/color distinction between owned vs non-owned prompts is broken or inverted in Library view"
created: 2026-02-11T00:00:00Z
updated: 2026-02-11T00:00:00Z
---

## Current Focus

hypothesis: The visual distinction logic is inverted - green highlight marks OTHER people's prompts but user expects it on their OWN prompts (or vice versa), and the styling only distinguishes non-owned prompts, leaving owned prompts with no special styling at all
test: Trace isOwnPrompt from data source through to rendered CSS classes
expecting: Find the exact inversion or missing distinction
next_action: Return diagnosis with recommended fix

## Symptoms

expected: Visual distinction correctly correlates owned vs non-owned prompts in Library
actual: "Other people's prompts are NOT correlated correctly" - distinction is broken/inverted
errors: None (visual/UX issue)
reproduction: Visit Public Library page, observe border/color on own prompts vs others' prompts
started: Current implementation

## Eliminated

(none)

## Evidence

- timestamp: 2026-02-11T00:00:00Z
  checked: PublicLibrary.tsx line 98
  found: `isOwnPrompt={prompt.authorId === user?.id}` - correctly passes true when user owns the prompt, false when they don't
  implication: Data-level ownership detection is correct

- timestamp: 2026-02-11T00:00:00Z
  checked: supabaseAdapter.ts line 73
  found: `authorId: row.user_id` in mapPublicPromptRow - maps DB user_id to authorId
  implication: authorId is correctly populated from the database

- timestamp: 2026-02-11T00:00:00Z
  checked: PromptCard.tsx lines 220-224 (the core styling logic)
  found: |
    className={`prompt-card p-6 cursor-pointer flex flex-col gap-4 relative block ${
      prompt.isPinned ? 'ring-2 ring-yellow-400 bg-yellow-50/30' : ''
    } ${
      isOwnPrompt === false ? 'ring-2 ring-green-500/50 bg-green-50/30' : ''
    }`}
  implication: Green ring+background applied when isOwnPrompt === false (OTHER people's prompts get green). When isOwnPrompt === true (user's OWN prompts), NO special styling is applied.

- timestamp: 2026-02-11T00:00:00Z
  checked: Prior debug session UAT-041-10-isownprompt-naming.md
  found: Previous diagnosis concluded "the green highlight marks 'this is someone else's prompt' - community-shared content. This is intentional UX."
  implication: Previous analysis may have been wrong about the UX intent. The user is now reporting the correlation is incorrect.

- timestamp: 2026-02-11T00:00:00Z
  checked: Visual distinction summary
  found: |
    Current behavior:
    - isOwnPrompt === true (MY prompts): No special styling (plain card)
    - isOwnPrompt === false (OTHERS' prompts): ring-2 ring-green-500/50 bg-green-50/30 (green border + green tint)
    - isOwnPrompt === undefined (not in Library): No special styling

    The ONLY visual distinction is green on OTHER people's prompts. The user's OWN prompts have zero distinction.
  implication: This is likely the root issue - the green styling on others' prompts may be confusing users into thinking green = "mine"

## Resolution

root_cause: |
  The visual distinction logic in PromptCard.tsx line 223 is INVERTED from the user's expectation.

  The condition `isOwnPrompt === false ? 'ring-2 ring-green-500/50 bg-green-50/30' : ''` applies
  the green highlight to OTHER PEOPLE'S prompts, while leaving the current user's OWN prompts
  with no visual distinction at all.

  This creates a confusing UX where:
  1. Green (a positive/affirmative color) is applied to prompts the user does NOT own
  2. The user's own prompts have NO visual indicator at all
  3. Users likely interpret green as "mine" but it actually means "not mine"

fix: (not applied - diagnose only mode)
verification: (not applied - diagnose only mode)
files_changed: []
