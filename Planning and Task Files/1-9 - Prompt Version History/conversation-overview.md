# Prompt Version History - Conversation Overview

**Date:** 2026-01-09
**Feature:** Version History Tracking for Prompts

---

## Initial Idea (User Braindump)

The user wanted to create version history tracking for prompt editing, similar to Google Docs. Key points from the initial idea:

- History button on prompt details page opens a popup
- Shows revision history dates in a list
- Clicking an item shows the prompt as it looked at that date
- Split editor or diff view to show changes
- Consolidate versions to avoid storing every tiny edit
- Rule-based consolidation (e.g., changes within 30min-1hr merged)
- Easy revert functionality with confirmation
- Track variable additions/removals in history
- Copy history remains unaffected (separate concern)

---

## Questions & Decisions

### Q1: What changes should trigger a new version?
**Answer:** All changes (title, body, or variables)

### Q2: Consolidation window timing?
**Answer:** User wanted a tiered approach like Google Docs:
- Save everything initially
- Consolidate daily into hourly snapshots
- Consolidate weekly into daily snapshots
- Implementation: Decay-based system with background job

### Q3: Diff view style?
**Answer:** Highlighted inline (additions in green, deletions in red, like GitHub)

### Q4: UI layout preference?
**Answer:** Modal dialog (matches existing app patterns)

### Q5: Revert behavior?
**Answer:** Auto-save current version first, then revert. The previous state remains visible in history, so nothing is ever lost.

### Q6: Named/starred versions?
**Answer:** No - keep it simple with just automatic timestamps

### Q7: Retention limit?
**Answer:** Keep forever (no cleanup based on age)

### Q8: Variable change display?
**Answer:** Chips with +/- badges (green + for added, red - for removed)

### Q9: When should consolidation run?
**Answer:** Background job (Supabase scheduled function, daily)

### Q10: Consolidated version display?
**Answer:** Expandable groups (collapsed by default, can expand to see individual versions)

### Q11: Default diff view?
**Answer:** Diff from previous version, with toggle to compare against current

### Q12: History button placement?
**Answer:** Both locations (view mode header AND edit mode)

### Q13: Empty state for new prompts?
**Answer:** Treat initial prompt creation as v1 (first version entry)

---

## Research Conducted

### Google Docs Version History
- Uses Operational Transformation (OT) algorithm for real-time sync
- Groups edits made within short time windows into single versions
- Session-based grouping (new session = new version group)
- Supports manual "named versions" for milestones
- Exact consolidation algorithm not publicly documented

### Best Practices for Version Consolidation
- **Decay-based retention:** More granular recent, consolidated older
- **Activity windowing:** Batch rapid consecutive saves
- **Session boundaries:** Use inactivity periods to define session ends
- **Always keep first and last:** Preserve bookends of each time period

---

## Architecture Decisions

### Version Creation Strategy
- Create version on save, capturing the BEFORE state
- Store immutable snapshots (not deltas)
- Skip version creation for metadata-only changes (pin, usage count)

### Storage Approach
- New `prompt_versions` table with foreign key to `prompts`
- Immutable rows (no UPDATE, only INSERT/DELETE)
- Consolidation marks old versions and optionally removes middle entries

### Consolidation Tiers
- Last 24 hours: All versions preserved
- 24h to 7 days: ~1 version per hour of activity
- Older than 7 days: ~1 version per day of activity
- First and last version of each period always kept

### UI Architecture
- Modal dialog with two-column layout
- Left: Version list with time-based accordion groups
- Right: Diff view with toggle for comparison mode
- Revert via AlertDialog confirmation

---

## Key Technical Decisions

| Aspect | Decision | Why |
|--------|----------|-----|
| Diff library | `diff` npm package | Lightweight, word-level, well-maintained |
| Where to create versions | In storage adapter | Keeps logic centralized, works with existing async flow |
| Version numbering | Auto-increment per prompt | Simple, human-readable |
| RLS strategy | Match existing prompt policies | Consistent security model |
| Realtime | Enable on `prompt_versions` | Future-proofs for live updates |

---

## Scope Boundaries

### In Scope
- All version tracking for title, body, variables
- Modal UI with list and diff view
- Time-based grouping with expandable sections
- Inline diff highlighting
- Variable change badges
- Revert with auto-save
- Background consolidation job

### Explicitly Out of Scope
- Named/starred versions
- Comparison between arbitrary versions
- Export/import of version history
- Real-time version list updates
- User attribution per version
- Version search/filtering

---

## Files Identified for Implementation

### New Files (12+)
- 4 database migrations
- 1 types file
- 6 React components
- 1 React Query hook

### Modified Files (4)
- Storage types interface
- Supabase adapter (addPrompt, updatePrompt)
- PromptView component
- PromptEditor component

---

## Next Steps

1. Create database migrations and push to remote
2. Regenerate TypeScript types
3. Implement storage adapter changes
4. Build UI components
5. Integrate into prompt detail pages
6. Enable consolidation scheduling
7. Test end-to-end flow

---

**Outcome:** Complete requirements gathered, architecture designed, implementation plan created.
