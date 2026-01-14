# Example Prompt Drafts - FINAL SELECTIONS

These 4 prompts will be automatically created for every new user.

---

## SELECTED: Welcome/Orientation Prompt (pinned, NO variables, 2 versions)

**Title:** Welcome to Prompt Vault
**Variables:** None
**Pinned:** Yes
**Versions:** 2 (to demonstrate version history feature)

### Version 1 (initial - created 1 second before v2):
```
Welcome to Prompt Vault!

This is Version 1 - it exists just to show you how version history works!

Click the clock icon on this prompt's detail page to open the Version History panel. You'll see both versions listed, and you can compare them to see what changed.

Head to Version 2 (the current version) for the actual platform guide.
```

### Version 2 (current - what users see):
```
Welcome to Prompt Vault - your personal prompt library!

## What is Prompt Vault?
A tool to save, organize, and reuse your AI prompts. Stop rewriting the same prompts - save them once, use them forever.

## Key Features

**Variables**
Use {{variable_name}} syntax to create dynamic prompts. When you copy, you'll be prompted to fill in the values. Add "-optional" to variable names (like {{notes-optional}}) for fields that can be left empty.

**Pinning**
Pin your most-used prompts to keep them at the top of your list. Click the pin icon on any prompt card.

**Copy with One Click**
Click the copy button to copy any prompt to your clipboard. Your usage is tracked automatically.

**Version History**
Every edit is saved. Click the history icon to see past versions, compare changes, and revert if needed.

**Copy History**
See a history of all the prompts you've copied to your clipboard INCLUDING THE VARIABLE VALUES. Click the history icon to see the list.

## Getting Started
1. Create new prompts with the + button
2. Try using {{variables}} in your prompts
3. Pin your favorites for quick access

Feel free to delete this welcome prompt once you're familiar with the app!
```

---

## SELECTED: Developer Prompt (NO variables)

**Title:** Code Review for Uncommitted Changes
**Variables:** None
**Pinned:** No

```
## Goal
Review all uncommitted code in the current branch. Analyze the changes for correctness, adherence to code standards, long-term stability, and alignment with requirements. Identify any issues that should be addressed before committing.

---

## Review Process

Examine all uncommitted changes and evaluate against these criteria:

1. **Correctness:** Are there bugs, logic errors, or unhandled edge cases? Does the code do what it's supposed to do?

2. **Code Standards:** Does it follow the established rules, conventions, and patterns in this codebase? Are naming, structure, and style consistent?

3. **Stability:** Is this built for the long term? Are there fragile assumptions, tight coupling, or maintenance risks?

4. **Requirements Alignment:** Do the changes fully meet the intended requirements and plans? Is anything missing or only partially implemented?

---

## Output Format

Output a numbered list of ALL the issues found. For each issue:

**Issue [#]: [Brief descriptive title]**
- **Location:** Where in the code this occurs.
- **What I found:** Description of the problem or concern.
- **Why it matters:** Which criteria this violates and the potential impact.
- **Suggested fix:** How to address it.

If no issues are found, state that the changes look ready to commit.
```

---

## SELECTED: Productivity Prompt (WITH variables)

**Title:** AI Meeting Notes Generator
**Variables:** `{{Transcript (Required)}}`, `{{People Present (Optional)}}`, `{{My Notes (Optional)}}`
**Pinned:** No

```
Generate comprehensive meeting notes from the following information.

## Meeting Transcript
{{Transcript (Required)}}

## People Present (Optional)
{{People Present (Optional)}}

## My Notes (Optional)
{{My Notes (Optional)}}

---

## Generate the Following

### Meeting Summary
A 2-3 sentence overview of what was discussed and decided.

### Key Decisions
- List each decision made during the meeting

### Action Items
| Owner | Task | Due Date |
|-------|------|----------|
| [Name] | [Action] | [Date if mentioned] |

### Discussion Points
- Main topics covered with brief context

### Key Takeaways
- Important insights or conclusions

### Next Steps
- Follow-up meetings or milestones mentioned

---

If people or notes weren't provided, infer what you can from the transcript. Focus on extracting actionable information.
```

---

## SELECTED: Image Generation Prompt (NO variables)

**Title:** Product Photography Prompt
**Variables:** None
**Pinned:** No

```
Professional product photography, clean white background, soft studio lighting with subtle shadows. Subject centered in frame with slight elevation. Shot with 85mm lens, shallow depth of field. High-end commercial aesthetic, minimal styling, emphasizing product details and craftsmanship. 4K resolution, photorealistic rendering.
```

---

## Summary

| Prompt | Title | Variables | Pinned | Versions |
|--------|-------|-----------|--------|----------|
| Welcome | Welcome to Prompt Vault | None | Yes | 2 |
| Developer | Code Review for Uncommitted Changes | None | No | 1 |
| Productivity | AI Meeting Notes Generator | transcript, people_present-optional, meeting_notes-optional | No | 1 |
| Image Gen | Product Photography Prompt | None | No | 1 |

## Notes
- **Welcome prompt** is **pinned** and has **2 versions** to:
  - Keep it at top for easy discovery
  - Demonstrate version history (users can click history icon to see v1 → v2 evolution)
- **Productivity prompt** has **variables with "-optional" suffix** to demonstrate:
  - Variable substitution feature
  - Optional variable pattern (prompt works with or without them)
- All prompts are practical templates users can immediately use
- Total: **4 prompts, 5 version snapshots** (Welcome has 2, others have 1 each)

## Implementation Note: Timestamp Handling
The Welcome prompt needs 2 versions with different timestamps:
- **Version 1 created_at**: `NOW() - INTERVAL '1 minute'`
- **Version 2 created_at**: `NOW()`

This ensures version history displays correctly (v1 appears before v2 chronologically).
