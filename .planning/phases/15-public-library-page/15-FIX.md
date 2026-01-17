---
phase: 15-public-library-page
plan: 15-FIX
type: fix
---

<objective>
Fix 5 UAT issues from Phase 15 Public Library Page.

Source: 15-UAT-ISSUES.md
Priority: 4 major, 1 minor

Purpose: Address layout consistency, navigation, search, and visibility UX issues identified during user acceptance testing.
Output: All issues resolved, ready for re-verification.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

**Issues being fixed:**
@.planning/phases/15-public-library-page/15-UAT-ISSUES.md

**Key files to modify:**
@src/components/Navigation.tsx
@src/pages/PublicLibrary.tsx
@src/pages/Index.tsx
@src/components/Dashboard.tsx
@src/hooks/usePromptFilters.ts
@src/components/PromptCard.tsx
@src/components/VisibilityToggle.tsx
@src/components/PromptView.tsx
@src/contexts/PromptsContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix UAT-002 & UAT-003 - Create shared AppLayout with persistent nav/stats</name>
  <files>
    - src/components/AppLayout.tsx (new)
    - src/components/Navigation.tsx
    - src/pages/Index.tsx
    - src/pages/PublicLibrary.tsx
    - src/pages/CopyHistory.tsx
  </files>
  <action>
1. Create new AppLayout component that wraps pages with:
   - Navigation bar (persistent)
   - StatsCounter (persistent)
   - Children (page content)

2. Update Navigation.tsx:
   - Add Library link between Dashboard and History
   - Restructure layout: center the 3 nav buttons, keep Sign Out right-aligned
   - Use flex with justify-center for nav buttons group, absolute positioning or separate flex for Sign Out

3. Update Index.tsx, PublicLibrary.tsx, CopyHistory.tsx to use AppLayout:
   - Remove individual Navigation imports where they exist
   - Wrap page content in AppLayout

4. Remove the "Browse Library" button from Dashboard header (now in persistent nav)

5. Remove the duplicate header/title from PublicLibrary.tsx (Library icon + "Public Library" title) - keep just the search/filter UI
  </action>
  <verify>
    - npm run build passes
    - Navigate between /dashboard, /library, /history - nav bar and stats persist on all pages
    - Library button appears between Dashboard and History, all three centered
    - Sign Out stays right-aligned
  </verify>
  <done>
    - Layout persists across all pages
    - Navigation buttons centered with Library in middle
    - Sign Out right-aligned
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix UAT-004 - Search across title, body, and author name</name>
  <files>
    - src/hooks/usePromptFilters.ts
    - src/pages/PublicLibrary.tsx
    - src/components/PromptCard.tsx
  </files>
  <action>
1. Update usePromptFilters.ts:
   - Extend search to match against: title, body, AND author.displayName (if present)
   - Search should be case-insensitive across all fields
   - Update the filter function:
     ```typescript
     const searchLower = searchTerm.toLowerCase();
     const filtered = prompts.filter((prompt) => {
       const titleMatch = prompt.title.toLowerCase().includes(searchLower);
       const bodyMatch = prompt.body.toLowerCase().includes(searchLower);
       const authorMatch = (prompt as any).author?.displayName?.toLowerCase().includes(searchLower) ?? false;
       return titleMatch || bodyMatch || authorMatch;
     });
     ```

2. Update PublicLibrary.tsx:
   - Remove the authorFilter URL param handling (remove useURLFilterSync authorFilter usage)
   - Remove the author filter badge UI
   - Remove the pre-filter by author logic
   - Change onAuthorClick in PromptCard to insert author name (or userId fallback) into search bar:
     ```typescript
     onAuthorClick={() => {
       const authorName = prompt.author?.displayName || prompt.authorId;
       setSearchTerm(authorName);
     }}
     ```

3. Update PromptCard.tsx onAuthorClick behavior:
   - Ensure clicking author name triggers the callback which now sets search term
   - No changes needed to PromptCard itself, just how PublicLibrary uses it
  </action>
  <verify>
    - Type an author name in search bar - prompts by that author appear
    - Type part of a prompt body - matching prompts appear
    - Click author name on card - their name appears in search bar and filters results
    - No more ?author= URL param or filter badge
  </verify>
  <done>
    - Search works across title, body, and author name
    - Author click inserts name into search
    - URL param filter approach removed
  </done>
</task>

<task type="auto">
  <name>Task 3: Fix UAT-005 - Visibility toggle redesign with toggle switch and icons</name>
  <files>
    - src/components/VisibilityToggle.tsx
    - src/components/PromptView.tsx
    - src/components/PromptCard.tsx
  </files>
  <action>
1. Redesign VisibilityToggle.tsx as a toggle switch:
   - Replace button with a sliding toggle switch UI
   - Use shadcn Switch component (or create custom toggle)
   - Layout: [Lock icon] [Switch] [Globe icon] with labels
   - Show "Private" or "Public" label based on state
   - Keep loading state indicator

2. Update PromptView.tsx:
   - Move VisibilityToggle to top right of the page (like Google Docs share button)
   - Position it absolutely or in the header area
   - Ensure it's prominent and easily accessible

3. Update PromptCard.tsx visibility indicator:
   - Change the current visibility indicator to just show icon (no text)
   - Add proper Tooltip with TooltipProvider:
     - Private: "Private - only visible to you"
     - Public: "Public - visible in the Prompt Library"
   - Remove visibility icon from Library page cards (source === 'public')
   - Keep the lock/globe icons as they are (already implemented)

4. Ensure visibility icons only show on Dashboard cards (source === 'owned'), not Library cards
  </action>
  <verify>
    - Open a prompt in detail view - toggle switch visible in top right
    - Toggle works: private ↔ public
    - Dashboard cards show lock/globe icons with proper tooltips on hover
    - Library cards do NOT show visibility icons
    - Tooltip text matches: "Private - only visible to you" / "Public - visible in the Prompt Library"
  </verify>
  <done>
    - Toggle switch style in PromptView top right
    - Icons with tooltips on Dashboard cards
    - No icons on Library cards
    - Correct tooltip messages
  </done>
</task>

<task type="auto">
  <name>Task 4: Fix UAT-001 - Invalidate public prompts query on visibility toggle</name>
  <files>
    - src/contexts/PromptsContext.tsx
    - src/hooks/usePublicPrompts.ts
  </files>
  <action>
1. Update PromptsContext.tsx toggleVisibility function:
   - After successful visibility toggle, invalidate the 'publicPrompts' query
   - Import useQueryClient from @tanstack/react-query
   - Add queryClient.invalidateQueries({ queryKey: ['publicPrompts'] }) after the toggle succeeds

2. Ensure usePublicPrompts.ts uses consistent query key:
   - Verify query key is ['publicPrompts'] (should already be correct)
   - Confirm the invalidation will trigger a refetch

Note: Since PromptsContext uses React context (not React Query), we need to handle this carefully:
   - Option A: Import queryClient directly in the context
   - Option B: Export a function from usePublicPrompts to invalidate
   - Option C: Use a shared queryClient instance

Prefer Option A: Import the queryClient from a shared location and invalidate in toggleVisibility.
  </action>
  <verify>
    - Toggle a prompt's visibility on Dashboard
    - Navigate to /library
    - The prompt appears/disappears immediately without manual refresh
  </verify>
  <done>
    - Visibility changes reflect immediately in Library without refresh
    - Query invalidation working correctly
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>All 5 UAT issues fixed: layout persistence, navigation reorganization, search across all fields, visibility toggle redesign, and query invalidation</what-built>
  <how-to-verify>
    1. Run: `npm run dev`
    2. Visit: http://localhost:2902/dashboard
    3. **Layout test**: Verify nav bar and stats visible, navigate to /library and /history - both persist
    4. **Nav layout test**: Verify [Dashboard] [Library] [History] centered, [Sign Out] right-aligned
    5. **Search test on /library**: Type author name in search - filters work
    6. **Author click test**: Click author name on card - inserts name in search, filters results
    7. **Visibility toggle test**: Open a prompt, verify toggle switch in top right, toggle works
    8. **Card icons test**: Dashboard cards show lock/globe with proper tooltips, Library cards have no visibility icon
    9. **Refresh test**: Toggle visibility, go to /library - change reflects without manual refresh
  </how-to-verify>
  <resume-signal>Type "approved" or describe any remaining issues</resume-signal>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] All 4 major issues fixed (UAT-001, 002, 004, 005)
- [ ] Minor issue fixed (UAT-003)
- [ ] npm run build passes
- [ ] npm run lint passes (or only pre-existing warnings)
- [ ] All verification steps pass
</verification>

<success_criteria>
- All UAT issues from 15-UAT-ISSUES.md addressed
- Layout persists on all pages
- Navigation properly organized
- Search works across title, body, author
- Visibility toggle redesigned with proper UX
- Query invalidation ensures immediate updates
- Ready for re-verification
</success_criteria>

<output>
After completion, create `.planning/phases/15-public-library-page/15-FIX-SUMMARY.md`
</output>
