# 15-FIX Summary

## What Was Built

Fixed 5 UAT issues from Phase 15 Public Library Page verification:

### UAT-001: Library doesn't refresh after visibility toggle
- Added `queryClient.invalidateQueries({ queryKey: ['publicPrompts'] })` after visibility toggle
- Library page now reflects changes immediately without manual refresh

### UAT-002: Library page missing persistent layout
- Created `AppLayout` component wrapping Navigation + StatsCounter
- Applied AppLayout to Index, PublicLibrary, and CopyHistory pages
- Layout (nav bar, stats) now persists across all pages

### UAT-003: Navigation bar needs reorganization
- Added Prompt Vault logo (favicon) and name to left side
- Centered navigation buttons: Dashboard | Library | Copy History
- Right-aligned Sign Out button
- Changed Dashboard header from "Prompt Vault" to "My Prompts" to avoid repetition

### UAT-004: Search should include author name
- Extended `usePromptFilters` to search across title, body, AND author.displayName
- Clicking author name on card inserts name into search bar
- Removed URL-based author filter approach in favor of unified search

### UAT-005: Visibility toggle needs redesign
- Replaced button with Switch component: [Lock] [Switch] [Globe] + label
- Added proper tooltips with explicit messages:
  - "Private - only visible to you"
  - "Public - visible in the Prompt Library"
- Visibility icons only show on Dashboard cards (source='owned'), not Library cards

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use favicon for nav logo | Consistent branding, reuses existing asset |
| Unified search over URL filters | Simpler UX, more intuitive discovery |
| Visibility icons only on owned cards | Reduces clutter on Library where visibility is implicit |
| Switch component for toggle | Clearer toggle semantics than button |

## Files Modified

- `src/components/AppLayout.tsx` (new)
- `src/components/Navigation.tsx`
- `src/components/VisibilityToggle.tsx`
- `src/components/PromptCard.tsx`
- `src/contexts/PromptsContext.tsx`
- `src/hooks/usePromptFilters.ts`
- `src/pages/Index.tsx`
- `src/pages/PublicLibrary.tsx`
- `src/pages/CopyHistory.tsx`
- `src/components/Dashboard.tsx`

## Commits

1. `3dc64ea` - fix(15-FIX): create shared AppLayout with persistent nav/stats
2. `1cf412e` - fix(15-FIX): extend search to include title, body, and author name
3. `b5e5158` - fix(15-FIX): visibility toggle redesign with switch and icons
4. `caf9d55` - fix(15-FIX): convert visibility toggle to switch component
5. `62c09a5` - fix(15-FIX): invalidate public prompts query on visibility toggle
6. `7a6943c` - fix(15-FIX): add Prompt Vault logo and name to navigation
7. `95357fc` - fix(15-FIX): use favicon icon for navigation logo

## Verification

All fixes verified:
- [x] Build passes (`npm run build`)
- [x] Layout persists across /dashboard, /library, /history
- [x] Navigation properly organized with logo
- [x] Search works across title, body, author
- [x] Visibility toggle uses Switch with proper tooltips
- [x] Visibility icons only on owned cards
- [x] Query invalidation reflects changes immediately

## Next Steps

- Phase 15 UAT fixes complete
- Ready for Phase 16: Add to Vault
