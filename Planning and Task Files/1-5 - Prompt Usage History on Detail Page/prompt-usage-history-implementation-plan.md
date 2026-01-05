# Prompt Usage History on Detail Page

**Created:** 2026-01-05
**Status:** Ready for Implementation
**Complexity:** Low (single file modification)

---

## 🎯 Goal

Display a collapsible history of copy events for a specific prompt on its detail page, allowing users to see when and how they used that prompt.

---

## 📋 Current Architecture

### Existing Behavior
- `CopyHistoryContext` loads all copy events for the authenticated user on mount
- Each `CopyEvent` includes a `promptId` field linking it to its source prompt
- The `/history` page displays all copy events globally (no prompt filtering)
- `PromptView.tsx` already imports `useCopyHistory` but only uses `addCopyEvent`

### Data Available
- `copyHistory: CopyEvent[]` - Array of all copy events from context
- `CopyEvent.promptId` - Foreign key reference to the prompt
- `CopyEvent.timestamp` - When the copy occurred
- `CopyEvent.variableValues` - Object containing variable name/value pairs

### Why No New API Needed
The `copyHistory` array is already loaded in memory. Filtering by `promptId` is a trivial client-side operation (`Array.filter()`), requiring no database queries, adapter methods, or context changes.

---

## 🏗️ Approach

Filter the existing `copyHistory` by the current prompt's ID and render a collapsible section in the PromptView component.

### UI Design Decision
**Collapsible section** (user-selected) - collapsed by default with a toggle to expand/show entries. This keeps the primary prompt content visible while providing access to history on demand.

---

## 📝 Implementation Steps

### Step 1: Extend Hook Destructuring
In `PromptView.tsx` line 22, add `copyHistory` to the existing `useCopyHistory` destructure.

### Step 2: Add Component State
Add a `useState` hook for `historyExpanded` boolean, defaulting to `false`.

### Step 3: Filter History
Create a derived `promptHistory` array by filtering `copyHistory` where `event.promptId === prompt.id`. Sort by timestamp descending (most recent first).

### Step 4: Add Collapsible Section
Insert a new section after the metadata block (around line 178) and before the footer actions (line 182). Include:

- **Header row**: "Usage History" label with count badge, chevron icon that rotates on expand
- **Expanded content**: List of history entries showing timestamp and variable values as inline badges
- **Empty state**: "No usage history yet" message when `promptHistory.length === 0`

### Step 5: Import Additional Icons
Add `ChevronDown` and `ChevronRight` (or similar) from `lucide-react` for the toggle indicator.

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `src/components/PromptView.tsx` | Add `copyHistory` destructure, state hook, filter logic, collapsible UI section (~30-40 lines) |

### No Changes Required
- No database migrations
- No storage adapter modifications
- No context API changes
- No new components or files

---

## 🎨 UI Specification

### Collapsed State
```
┌───────────────────────────────────────┐
│ ▶ Usage History (3)                   │
└───────────────────────────────────────┘
```

### Expanded State
```
┌───────────────────────────────────────┐
│ ▼ Usage History (3)                   │
├───────────────────────────────────────┤
│ Jan 5, 2026 at 2:30 PM                │
│ name: John   company: Acme            │
├───────────────────────────────────────┤
│ Jan 4, 2026 at 10:15 AM               │
│ name: Jane   company: Corp            │
└───────────────────────────────────────┘
```

### Empty State
```
┌───────────────────────────────────────┐
│ Usage History                         │
│ No usage history yet                  │
└───────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### Functional
- [ ] Section displays on prompt detail page
- [ ] History count in header matches actual entries
- [ ] Toggle expands/collapses correctly
- [ ] Entries show timestamp and variable values
- [ ] Only history for current prompt appears (not other prompts)
- [ ] Empty state shown when no history exists

### Integration
- [ ] New copy event appears after copying prompt (may require page refresh)
- [ ] Works for authenticated users (Supabase-only)
- [ ] No console errors

### Quality
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] UI matches existing design patterns (borders, spacing, typography)

---

## 🎯 Success Criteria

- Single file modified (`PromptView.tsx`)
- Collapsible section appears below metadata, above footer actions
- History filtered accurately by `promptId`
- Collapsed by default, expands on click
- Variable values displayed as badges/chips
- Timestamps formatted consistently with existing date displays
- Empty state handled gracefully

---

## 📌 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Display style | Collapsible section | Keeps primary content visible; history is secondary info |
| Data source | Filter existing context array | No API changes; data already loaded |
| Default state | Collapsed | Avoids overwhelming the view with secondary data |
| Location | After metadata, before footer | Logical grouping with other prompt stats |

---

## 📚 Reference Context

### Existing Patterns to Reuse
- Timestamp formatting: Same pattern as "Last updated" in metadata section
- Badge styling: Same as variable chips in PromptView
- Collapsible pattern: Similar to other expandable sections in the app
- Border styling: Match existing `border-t` divider pattern

### Files for Reference
- `src/pages/CopyHistory.tsx` - Existing history display patterns
- `src/components/PromptView.tsx:163-178` - Metadata section styling to match

---

**Status:** Ready for implementation
