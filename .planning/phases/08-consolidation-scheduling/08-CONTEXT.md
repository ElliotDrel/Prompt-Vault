# Phase 8: Day-Level Diff View - Context

**Gathered:** 2026-01-11
**Status:** Ready for planning

<vision>
## How This Should Work

When viewing version history, days are already grouped in an accordion. The enhancement is: clicking on a day header shows a **combined diff** of all changes made that day — merged into one view. Users can still expand the day to see individual versions if they want granular detail.

This mirrors Google Docs' revision history, where you can see "what changed today" at a glance without scrolling through every individual save. The combined diff gives a bird's-eye view of the day's work.

**Key interaction:**
- Click day header → Combined diff for all versions that day
- Click expand arrow → See individual versions within that day (current behavior)

</vision>

<essential>
## What Must Be Nailed

- **Clear combined diff** - The merged diff for a day must be easy to read and understand, showing the net change from start of day to end of day
- **Consistent styling** - Day-level diff uses the same visual treatment as individual version diffs

</essential>

<boundaries>
## What's Out of Scope

- **No automatic deletion/cleanup** - Versions are kept forever, no background consolidation jobs
- **No storage optimization** - Not worrying about database size in this phase
- **No lazy loading/pagination** - Keep current loading behavior
- **No day-level revert** - Revert stays at the individual version level only
- **No navigation optimization** - Simple behavior, no preloading or progressive loading

</boundaries>

<specifics>
## Specific Ideas

- Use the exact same diff styling as version diffs, just with combined/merged content
- This is essentially a UI-only change — compute the combined diff client-side from existing version data

</specifics>

<notes>
## Additional Context

This phase was originally named "Consolidation Scheduling" with plans for pg_cron jobs, but the user's vision is simpler and more user-focused: a Google Docs-style day grouping UX rather than backend cleanup automation.

The phase should be renamed to reflect its actual scope: **Day-Level Diff View** or similar.

</notes>

---

*Phase: 08-consolidation-scheduling (to be renamed)*
*Context gathered: 2026-01-11*
