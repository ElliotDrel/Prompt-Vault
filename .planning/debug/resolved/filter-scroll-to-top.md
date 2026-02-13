---
status: resolved
trigger: "filter-scroll-to-top"
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:15:00Z
---

## Current Focus

hypothesis: CONFIRMED - React Router's `setSearchParams` triggers scroll-to-top by default on navigation events
test: Applied fix - added `preventScrollReset: true` to setSearchParams options
expecting: Page should no longer scroll to top on filter/sort option click
next_action: Complete - archive session

## Symptoms

expected: Option selected, page stays at current scroll position
actual: Page scrolls all the way to the top when any option is clicked
errors: None reported
reproduction: Every option click in FilterSortControl dropdown
started: Recent change - FilterSortControl is a new component

## Eliminated

- Button type="submit" theory: Native buttons had type="button" added, but issue persisted
- Radix Popover focus restoration: Component was refactored to custom dropdown, issue persisted
- shadcn Button missing type: Added type="button" to all Buttons, issue persisted

## Evidence

- timestamp: 2026-01-29T00:01:00Z
  checked: FilterSortControl.tsx source code
  found: |
    Initial investigation focused on button type attributes
    Added type="button" to native buttons - issue persisted
  implication: Button types were not the root cause

- timestamp: 2026-01-29T00:05:00Z
  checked: Component refactored from Radix Popover to custom dropdown
  found: |
    Removed Radix Popover dependency entirely
    Used simple useState + click outside detection
    Issue STILL persisted
  implication: Radix Popover was not the root cause

- timestamp: 2026-01-29T00:10:00Z
  checked: Data flow tracing from click to URL update
  found: |
    1. User clicks option in FilterSortControl
    2. onSortByChange(value) called
    3. setSortBy() in useURLFilterSync called
    4. updateURLParams() called
    5. setSearchParams(..., { replace: true }) called
    6. React Router treats this as navigation event
    7. Browser scrolls to top (default navigation behavior)
  implication: React Router's setSearchParams was causing the scroll

- timestamp: 2026-01-29T00:12:00Z
  checked: React Router version and documentation
  found: |
    react-router-dom: ^6.26.2
    setSearchParams supports `preventScrollReset: true` option (v6.4+)
    This prevents scroll position reset on URL param updates
  implication: Fix is to add preventScrollReset option

- timestamp: 2026-01-29T00:14:00Z
  checked: Applied fix to useURLFilterSync.ts line 171
  found: |
    Changed: { replace: true }
    To: { replace: true, preventScrollReset: true }
    Build passes, lint passes
  implication: Fix applied successfully

## Resolution

root_cause: React Router's `setSearchParams` function triggers scroll-to-top behavior by default, treating URL parameter updates as navigation events. Even with `replace: true`, the browser's scroll restoration kicks in and scrolls to the top of the page.

fix: Added `preventScrollReset: true` to the setSearchParams options in useURLFilterSync.ts:
```typescript
}, { replace: true, preventScrollReset: true });
```

verification: Build passes, lint passes, manual testing confirms scroll position preserved
files_changed:
  - src/hooks/useURLFilterSync.ts (line 171)

## Lesson Learned

When using React Router's `setSearchParams` for filter/sort controls that shouldn't disrupt scroll position, always include `preventScrollReset: true` in the options. This is especially important for:
- Filter dropdowns
- Sort controls
- Pagination
- Any UI that updates URL params without full page navigation
