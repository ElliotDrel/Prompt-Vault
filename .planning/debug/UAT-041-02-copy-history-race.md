---
status: diagnosed
trigger: "UAT-041-02-copy-history-race: CopyHistory page may show incorrect 'Public' badges during initial load due to race condition with prompts loading"
created: 2026-02-03T12:00:00Z
updated: 2026-02-03T12:00:00Z
---

## Current Focus

hypothesis: During initial page load, CopyHistory.tsx renders copy events before prompts finish loading, causing ownedPromptIds to be an empty Set, making all events appear as "public"
test: Trace the data flow from usePrompts() loading state to ownedPromptIds derivation to isPublicPrompt calculation
expecting: If loading state from prompts is not checked, events will render with wrong isPublicPrompt value during load
next_action: Confirm root cause by analyzing code flow

## Symptoms

expected: Owned prompts in copy history should NOT show green "Public" badges
actual: Alleged that during load, ownedPromptIds is empty Set, so all events render as public until prompts finish loading
errors: None - visual glitch during load
reproduction: Clear browser cache, load /history on slow network (throttle to slow 3G)
started: Code review finding from PR #41

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-02-03T12:01:00Z
  checked: CopyHistory.tsx - how ownedPromptIds is derived
  found: |
    Line 50: `const { prompts, incrementCopyCount, incrementPromptUsage } = usePrompts();`
    Line 53: `const ownedPromptIds = useMemo(() => new Set(prompts.map(p => p.id)), [prompts]);`

    The `loading` state from usePrompts() is NOT destructured or used.
    ownedPromptIds is derived directly from `prompts` which starts as empty array.
  implication: When prompts is still loading (prompts = []), ownedPromptIds will be empty Set

- timestamp: 2026-02-03T12:02:00Z
  checked: CopyHistory.tsx - how isPublicPrompt is calculated for rendering
  found: |
    Line 235: `isPublicPrompt={!ownedPromptIds.has(event.promptId)}`
    Line 255: `isPublicPrompt={!ownedPromptIds.has(event.promptId)}`

    Both search results and paginated history use the same logic:
    If ownedPromptIds is empty, `!ownedPromptIds.has(event.promptId)` will always be TRUE
  implication: All events will incorrectly show as "public" when prompts haven't loaded yet

- timestamp: 2026-02-03T12:03:00Z
  checked: PromptsContext.tsx - initial state and loading behavior
  found: |
    Line 41: `const [prompts, setPrompts] = useState<Prompt[]>([]);`
    Line 42: `const [loading, setLoading] = useState(true);`

    Initial state is empty array, loading starts as true.
    loadPrompts() is called in useEffect (line 142-148) after adapter is ready.
  implication: There is a window where prompts=[] while copy events may already be loaded

- timestamp: 2026-02-03T12:04:00Z
  checked: CopyEventCard.tsx - how isPublicPrompt affects rendering
  found: |
    Lines 62-67: Renders green "Public" badge when isPublicPrompt is truthy
    Lines 86-91: Same badge in dialog view

    ```tsx
    {isPublicPrompt && (
      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
        <Globe className="h-3 w-3 mr-1" />
        Public
      </Badge>
    )}
    ```
  implication: Every CopyEventCard will show "Public" badge when ownedPromptIds is empty

- timestamp: 2026-02-03T12:05:00Z
  checked: Race condition timing analysis
  found: |
    CopyHistory uses useCopyHistory() which has its own loading state.
    PromptsContext loads prompts asynchronously via adapter.

    Timeline on slow network:
    1. Page mounts
    2. useCopyHistory() starts loading copy events
    3. usePrompts() starts loading prompts (prompts = [], loading = true)
    4. Copy events finish loading first (they may be faster or cached differently)
    5. UI renders: ownedPromptIds = empty Set -> all events show "Public"
    6. Prompts finish loading -> ownedPromptIds updates -> badges disappear

    The user sees a flash of incorrect "Public" badges.
  implication: Root cause CONFIRMED - race condition between prompts loading and copy events rendering

## Resolution

root_cause: |
  CopyHistory.tsx does not wait for prompts to finish loading before rendering copy event cards.

  The `loading` state from usePrompts() is available but not used. The page derives
  `ownedPromptIds` from `prompts` which starts as an empty array. When copy events
  load before prompts (especially on slow networks or cold cache), all events
  incorrectly evaluate as "public" because `!emptySet.has(promptId)` is always true.

  This causes a visual flash where owned prompts show green "Public" badges until
  prompts finish loading and the useMemo recalculates ownedPromptIds.

fix: (not applied - goal is find_root_cause_only)
verification: (not applicable)
files_changed: []
