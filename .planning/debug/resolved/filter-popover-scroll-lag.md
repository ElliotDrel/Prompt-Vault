---
status: resolved
trigger: "FilterSortControl dropdown bobbles/lags when user scrolls the page fast while the dropdown is open"
created: 2026-01-29T12:00:00Z
updated: 2026-01-29T12:30:00Z
---

## Current Focus

hypothesis: CONFIRMED - Radix Popover uses Floating UI (JavaScript-based positioning) which cannot update synchronously with browser scroll rendering
test: Replace Radix Popover with pure CSS dropdown using position: absolute
expecting: Dropdown should be perfectly anchored with zero jitter during scroll
next_action: N/A - RESOLVED

## Symptoms

expected: Dropdown should stay fixed/anchored to its trigger button during page scroll
actual: Dropdown bobbles and lags behind when scrolling fast, creating visual jitter
errors: No error messages - purely visual performance issue
reproduction: Open the FilterSortControl dropdown, then scroll the page quickly
started: New feature being developed (FilterSortControl.tsx is new file)

## Eliminated

- `updatePositionStrategy="always"` - reduced but did not eliminate jitter (JS still can't be perfectly sync with scroll)
- `usePortal={false}` on Radix Popover - no effect, Radix still uses Floating UI internally

## Evidence

- timestamp: 2026-01-29T12:01:00Z
  checked: FilterSortControl.tsx implementation
  found: Using standard Radix UI Popover with PopoverContent align="end", no custom positioning
  implication: Component relies entirely on Radix defaults for positioning

- timestamp: 2026-01-29T12:02:00Z
  checked: popover.tsx (shadcn wrapper)
  found: Standard shadcn/ui wrapper using Portal + Floating UI positioning
  implication: Portal renders at document.body level, JS must track trigger position during scroll

- timestamp: 2026-01-29T12:10:00Z
  checked: updatePositionStrategy="always" fix
  found: Reduced jitter significantly but tiny bobble remained
  implication: Even with every-frame updates, JS positioning can't be perfectly synchronous with browser scroll

- timestamp: 2026-01-29T12:15:00Z
  checked: usePortal={false} approach
  found: No improvement - Radix Content still uses Floating UI internally for positioning
  implication: Root cause is JS-based positioning, not the Portal specifically

## Resolution

root_cause: Radix Popover uses Floating UI (JavaScript-based positioning) to calculate and apply coordinates. JavaScript position updates inherently cannot be perfectly synchronous with the browser's native scroll rendering, causing visible jitter/bobble during fast scroll.
fix: Replaced Radix Popover with pure CSS dropdown using `position: absolute` + `top-full` + `right-0` relative to a `position: relative` parent. Browser handles CSS positioning synchronously with scroll - zero jitter.
verification: User confirmed dropdown is now perfectly anchored with no movement during fast scroll.
files_changed: [src/components/FilterSortControl.tsx, CLAUDE.md]
pattern_documented: Added "Dropdown Scroll Jitter (Radix/Floating UI)" section to CLAUDE.md
