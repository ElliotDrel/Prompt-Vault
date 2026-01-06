# Copy History Infinite Scroll Pagination

**Created:** 2026-01-05
**Status:** Ready for Implementation
**Complexity:** Medium
**Estimated Changes:** ~150-200 lines across 5 files

---

## 🎯 Goal

Eliminate the 500ms+ navigation delay when accessing the Copy History page by implementing infinite scroll pagination. Current implementation loads and renders ALL copy events at once, creating 7,500-50,000 DOM nodes depending on dataset size. Target performance: <200ms initial load (60%+ improvement).

---

## 📋 Requirements

### Functional Requirements
- Load copy events in pages of 25 items
- Implement infinite scroll with "Load More" button
- Preserve realtime updates (prepend new events to first page)
- Search filters loaded items by prompt title only
- Maintain existing delete/clear functionality
- Show total count and loaded count to users

### Non-Functional Requirements
- No database schema changes
- Use existing TanStack Query library (@tanstack/react-query v5.56.2)
- Follow established context patterns (async operations, error handling)
- Preserve backward compatibility for CopyEventCard component
- Support both manual "Load More" and auto-scroll observer pattern

### User Experience Requirements
- Smooth scrolling when loading additional pages
- Clear loading indicators during fetch
- No spinner on realtime background updates
- Search works instantly on loaded items
- Delete/clear operations reflect immediately

---

## 🏗️ Architecture

### Current Data Flow (Problem)

```
Database (all events)
  → Supabase query (no limit)
  → CopyHistoryContext (full array in state)
  → CopyHistory page (maps all to components)
  → 100+ CopyEventCards (75-100 DOM nodes each)
```

**Performance Impact:**
- 100 events = ~7,500-10,000 DOM nodes
- 500 events = ~37,500-50,000 DOM nodes
- Main thread blocked during render
- Synchronous layout calculations cause jank

### New Data Flow (Solution)

```
Database (paginated query with offset/limit)
  → Supabase .range(offset, offset+24)
  → TanStack Query useInfiniteQuery
  → CopyHistoryContext (pages array, flattened for consumers)
  → CopyHistory page (maps visible items only)
  → 25 CopyEventCards initially (progressive loading)
```

**Performance Improvement:**
- Initial load: 25 events = ~1,875 DOM nodes (95% reduction)
- Subsequent pages: On-demand loading
- Non-blocking UI during navigation

### Pagination Strategy Comparison

| Approach | Selected | Rationale |
|----------|----------|-----------|
| **Infinite Scroll** | ✅ Yes | User preference; better for chronological browsing |
| Numbered Pages | ❌ No | Requires unused pagination UI component setup |
| Cursor-Based | ❌ No | Over-engineered for chronological copy history |

### Search Strategy

| Approach | Selected | Rationale |
|----------|----------|-----------|
| **Client-Side (Current Page)** | ✅ Yes | Fast, simple, no backend changes needed |
| Client-Side (All Pages) | ❌ No | Defeats pagination performance benefits |
| Server-Side Full-Text | ❌ No | Requires migration + generated column (future enhancement) |

**Search Scope Change:**
- **Before:** Title + variable values (jsonb field)
- **After:** Title only (user confirmed this is sufficient)

### Realtime Updates with Pagination

| Scenario | Behavior |
|----------|----------|
| New copy event (user on page 1) | Prepend to first page via queryClient.setQueryData |
| New copy event (user on page 2+) | No action (acceptable; user can refresh to see) |
| Delete event | Remove from all loaded pages |
| Clear history | Invalidate all queries, reload page 1 |

---

## 📝 Implementation Steps

### Phase 1: Update Storage Adapter Interface

**Objective:** Add pagination support to the storage layer without breaking existing consumers.

#### Step 1.1: Modify `StorageAdapter` Interface

**File:** `src/lib/storage/storageAdapter.ts`

**Changes:**
- Update `CopyEventsAdapter.getCopyEvents()` signature
- Return object with `{ events, hasMore, totalCount }` instead of plain array
- Add optional `offset` and `limit` parameters (defaults: 0, 25)

**Interface Changes:**
```typescript
// Before
getCopyEvents(): Promise<CopyEvent[]>

// After
getCopyEvents(offset?: number, limit?: number): Promise<{
  events: CopyEvent[];
  hasMore: boolean;
  totalCount: number;
}>
```

#### Step 1.2: Implement Pagination in Supabase Adapter

**File:** `src/lib/storage/supabaseAdapter.ts` (lines 194-208)

**Current Implementation:**
- Single query with `.order('created_at', { ascending: false })`
- No `.range()` or `.limit()` - fetches all user's copy events
- Returns mapped array directly

**New Implementation:**
- First query: Get total count with `{ count: 'exact', head: true }`
- Second query: Get paginated data with `.range(offset, offset + limit - 1)`
- Calculate `hasMore` as `offset + limit < totalCount`
- Return object with events array, hasMore flag, and totalCount

**Why Two Queries:**
- PostgREST doesn't return count with data in a single efficient query
- Count query is lightweight (head-only, no data transfer)
- Total count needed for "Showing X of Y" UI display

---

### Phase 2: Add TanStack Query Provider

**Objective:** Set up QueryClient for infinite query support across the app.

#### Step 2.1: Wrap App with QueryClientProvider

**File:** `src/App.tsx`

**Changes:**
- Import `QueryClient` and `QueryClientProvider` from `@tanstack/react-query`
- Create queryClient instance with default options
- Wrap existing `<AuthProvider>` tree with `<QueryClientProvider>`

**Configuration:**
- `refetchOnWindowFocus: false` - Don't refetch when user tabs back
- `retry: 1` - Single retry on network failures
- `staleTime: 30000` - Cache data for 30 seconds

**Provider Hierarchy:**
```
QueryClientProvider
  └─ AuthProvider
      └─ RouterProvider
```

---

### Phase 3: Refactor CopyHistoryContext to Use Infinite Query

**Objective:** Replace manual state management with TanStack Query's useInfiniteQuery.

#### Step 3.1: Replace useState with useInfiniteQuery

**File:** `src/contexts/CopyHistoryContext.tsx` (lines 38-55, 87-99)

**Remove:**
- `const [copyHistory, setCopyHistory] = useState<CopyEvent[]>([])`
- `const [loading, setLoading] = useState(true)`
- `loadCopyHistory()` function
- `useEffect` that calls `loadCopyHistory()` on mount

**Add:**
- `useInfiniteQuery` hook with queryKey `['copyHistory']`
- `queryFn` that calls `storageAdapter.copyEvents.getCopyEvents(pageParam, 25)`
- `getNextPageParam` that calculates next offset from loaded pages
- `enabled: !!storageAdapter` to prevent queries before auth

**Query Function:**
- Receives `{ pageParam = 0 }` as first page offset
- Calls storage adapter with `pageParam` offset and limit of 25
- Returns `{ events, hasMore, totalCount }` from adapter

**Next Page Parameter:**
- Sum all loaded events: `allPages.reduce((sum, page) => sum + page.events.length, 0)`
- Return summed count as next offset if `hasMore`, else `undefined`

#### Step 3.2: Flatten Pages into Single Array

**Implementation:**
- Access pages with `data?.pages.flatMap(page => page.events) ?? []`
- Expose as `copyHistory` in context for backward compatibility
- Extract `totalCount` from first page: `data?.pages[0]?.totalCount ?? 0`

**Context Exports:**
- `copyHistory: CopyEvent[]` - Flattened array from all pages
- `loading: boolean` - From `isLoading` query state
- `fetchNextPage: () => void` - Load more function
- `hasNextPage: boolean` - More items available?
- `isFetchingNextPage: boolean` - Loading next page?
- `totalCount: number` - Total events in database
- `refetch: () => void` - Manual refresh function

#### Step 3.3: Replace Mutations with useMutation

**Files to Update:**
- `addCopyEvent` → `useMutation` with `onSuccess: invalidateQueries`
- `deleteCopyEvent` → `useMutation` with optimistic update
- `clearHistory` → `useMutation` with full query reset

**Pattern:**
```typescript
const addMutation = useMutation({
  mutationFn: async (event) => adapter.copyEvents.addCopyEvent(event),
  onSuccess: () => queryClient.invalidateQueries(['copyHistory'])
});
```

#### Step 3.4: Handle Realtime with Query Updates

**File:** `src/contexts/CopyHistoryContext.tsx` (new useEffect)

**Realtime Subscription:**
- Subscribe to `adapter.realtime.subscribeToCopyEvents()` if available
- Handle INSERT events: Use `queryClient.setQueryData` to prepend to first page
- Handle DELETE events: Filter event from all pages
- Handle UPDATE events: Update specific event across pages (if needed)

**INSERT Implementation:**
- Check if `data.pages` exists
- Clone first page, prepend new event to events array
- Set updated pages array back to query cache
- No network request needed (optimistic update)

**DELETE Implementation:**
- Map over all pages, filter out deleted event by ID
- Decrement totalCount by 1
- Preserves pagination state during delete

**Cleanup:**
- Return unsubscribe function from useEffect
- Prevent memory leaks on unmount

---

### Phase 4: Update CopyHistory Page Component

**Objective:** Add "Load More" UI and update search to work with paginated data.

#### Step 4.1: Update Hook Destructuring

**File:** `src/pages/CopyHistory.tsx` (lines 15-16)

**Add New Properties:**
- `fetchNextPage` - Function to load next 25 items
- `hasNextPage` - Boolean flag for more items
- `isFetchingNextPage` - Loading state for "Load More"
- `totalCount` - Total events in database

#### Step 4.2: Simplify Search Filter

**File:** `src/pages/CopyHistory.tsx` (lines 20-25)

**Current Search:**
```typescript
event.promptTitle.toLowerCase().includes(searchTerm) ||
Object.values(event.variableValues).some(value =>
  value.toLowerCase().includes(searchTerm)
)
```

**New Search (Title Only):**
```typescript
event.promptTitle.toLowerCase().includes(searchTerm)
```

**Rationale:**
- User confirmed title-only search is sufficient
- Eliminates expensive JSONB iteration on every keystroke
- Reduces filter complexity

#### Step 4.3: Add "Load More" Button

**File:** `src/pages/CopyHistory.tsx` (after line 143)

**Location:** After `{filteredHistory.map(...)}` loop, before closing `</div>`

**UI Elements:**
1. Button component with `onClick={() => fetchNextPage()}`
2. Disabled state when `isFetchingNextPage` is true
3. Text: "Loading..." during fetch, "Load More" otherwise
4. Only render if `hasNextPage && !searchTerm` (hide during search)

**Conditional Rendering:**
- Don't show button when searching (search only filters loaded items)
- Don't show button on last page (`hasNextPage === false`)
- Show centered with padding for visual separation

#### Step 4.4: Add Item Count Display

**File:** `src/pages/CopyHistory.tsx` (after "Load More" button)

**Display Format:**
- "Showing {copyHistory.length} of {totalCount} events"
- Only show when not searching
- Styled as muted text, centered below list

**Purpose:**
- Gives users context on dataset size
- Shows progress through infinite scroll
- Encourages loading more if needed

#### Step 4.5: Optional - Add Scroll Observer (Future Enhancement)

**Implementation:**
- Create `observerTarget` ref
- Use IntersectionObserver to detect when ref scrolls into view
- Trigger `fetchNextPage()` automatically when visible
- Replace "Load More" button with invisible trigger div

**Benefits:**
- True infinite scroll experience
- No manual button clicks
- Better for mobile users

**Note:** Can be added later without breaking changes.

---

### Phase 5: Testing & Validation

**Objective:** Verify all functionality works with pagination and identify edge cases.

---

## ✅ Testing Checklist

### Initial Load & Navigation
- [ ] Dashboard → History navigation completes in <200ms
- [ ] First page loads exactly 25 items (or fewer if total < 25)
- [ ] No console warnings about forced reflow
- [ ] No click handler violations during navigation
- [ ] Loading spinner shows briefly during initial load
- [ ] Empty state displays correctly when no copy events exist

### Pagination Behavior
- [ ] "Load More" button appears when `totalCount > 25`
- [ ] Clicking "Load More" fetches next 25 items
- [ ] Button shows "Loading..." text during fetch
- [ ] Button disables during fetch to prevent double-clicks
- [ ] New items append to bottom of list (maintain scroll position)
- [ ] "Showing X of Y" count updates correctly after loading
- [ ] Button disappears when all items loaded (`hasNextPage === false`)

### Search Functionality
- [ ] Search input filters loaded items by prompt title
- [ ] Search is case-insensitive
- [ ] Search updates instantly (no debounce needed with small dataset)
- [ ] "Load More" button hides during active search
- [ ] Clearing search restores full loaded list
- [ ] Search with no matches shows empty state
- [ ] Search does NOT search variable values (expected behavior)

### Realtime Updates
- [ ] New copy event in Tab A appears at top of Tab B (if on page 1)
- [ ] New event in Tab A does NOT appear in Tab B if on page 2+ (expected)
- [ ] Deleted event in Tab A disappears from Tab B instantly
- [ ] Realtime updates don't trigger loading spinner
- [ ] Realtime updates don't reset scroll position
- [ ] Total count updates after realtime insert/delete

### Delete Operations
- [ ] Deleting single event removes from UI immediately
- [ ] Delete confirmation dialog works as before
- [ ] Deleting event on page 2 doesn't affect page 1
- [ ] Total count decrements after delete
- [ ] Deleting last item on a page doesn't break pagination

### Clear History
- [ ] "Clear History" confirmation dialog appears
- [ ] Confirming clears all events from UI
- [ ] Page resets to empty state
- [ ] "Load More" button doesn't appear after clear
- [ ] Total count shows 0 after clear

### Edge Cases
- [ ] Exactly 25 items: No "Load More" button appears
- [ ] 26 items: "Load More" appears, loads 1 item on click
- [ ] User with 0 events: Shows empty state, no errors
- [ ] User with 1 event: Shows single item, no "Load More"
- [ ] Network failure during fetch: Shows error toast
- [ ] Network failure during "Load More": Retry option available
- [ ] Rapid "Load More" clicks: Prevented by disabled state
- [ ] Searching while loading next page: Search waits for completion

### Performance Validation
- [ ] Initial DOM node count < 2,000 (vs 10,000+ before)
- [ ] Navigation delay < 200ms measured with DevTools
- [ ] No janky scrolling when loading pages
- [ ] Memory usage stable after loading 10+ pages
- [ ] Query cache size reasonable (not storing duplicate data)

---

## 📊 Success Criteria

### Performance Metrics
- ✅ Initial navigation time reduced from 500ms+ to <200ms (60%+ improvement)
- ✅ Initial DOM node count reduced by 95% (25 cards vs 100+ cards)
- ✅ No "Forced reflow" console violations during navigation
- ✅ Smooth 60fps scrolling when loading additional pages

### Functional Criteria
- ✅ All existing copy history features work (delete, clear, search, copy)
- ✅ Infinite scroll loads pages progressively on demand
- ✅ Realtime updates prepend to page 1 without full reload
- ✅ Search filters loaded items by title instantly
- ✅ Users can browse entire history by loading more pages

### Code Quality
- ✅ No TypeScript errors or warnings
- ✅ Passes `npm run lint` without new violations
- ✅ Follows established patterns (context API, async operations, error handling)
- ✅ Backward compatible - CopyEventCard component unchanged
- ✅ No database migrations required

### User Experience
- ✅ Loading states clear and non-intrusive
- ✅ Error states handled gracefully with retry options
- ✅ Total count displayed so users know dataset size
- ✅ Scroll position preserved when loading more items
- ✅ Empty states informative and actionable

---

## 📌 Key Decisions & Rationale

### Decision 1: Infinite Scroll vs Numbered Pages

**Chosen:** Infinite Scroll with "Load More" button

**Rationale:**
- User explicitly requested infinite scroll
- Better for chronological browsing (copy history is time-ordered)
- Existing `src/components/ui/pagination.tsx` component is unused and would require wiring
- "Load More" button gives users control vs auto-loading on scroll
- Can upgrade to observer-based auto-scroll later without breaking changes

**Trade-offs:**
- ❌ Can't jump to specific page numbers
- ✅ Simpler mental model (scroll to see older items)
- ✅ Better mobile experience

### Decision 2: Page Size of 25 Items

**Chosen:** 25 events per page

**Rationale:**
- User preference for faster loading over fewer clicks
- Reduces initial DOM nodes from 7,500+ to ~1,875 (95% reduction)
- Most users access recent history (first 1-2 pages)
- Balances performance with UX (not too many "Load More" clicks)

**Alternatives Considered:**
- 50 items: Still 3,750 nodes (acceptable but less optimal)
- 100 items: Defeats purpose of pagination (7,500 nodes)
- 10 items: Too many pagination clicks for active users

### Decision 3: Search Current Page Only

**Chosen:** Client-side filtering of loaded items

**Rationale:**
- Simple to implement (no backend changes)
- Fast performance (filtering <100 items is instant)
- Most users search for recent events (already loaded)
- Avoids complexity of server-side full-text search
- Can upgrade to server-side search in Phase 2 if needed

**Trade-offs:**
- ❌ Can't find events beyond loaded pages
- ✅ No database query on every keystroke
- ✅ No migration for generated search column
- ✅ Acceptable for MVP (most searches are recent)

### Decision 4: Title-Only Search

**Chosen:** Remove variable values from search scope

**Rationale:**
- User confirmed title-only search is sufficient
- Eliminates expensive JSONB iteration (`Object.values(variableValues).some(...)`)
- Simpler filter logic (single string comparison)
- Variable names are less semantically meaningful for search

**Impact:**
- Faster search filtering
- Cleaner code (remove nested `.some()` loop)
- May revisit if users request variable search later

### Decision 5: Keep Realtime Updates

**Chosen:** Preserve realtime with pagination (prepend to page 1 only)

**Rationale:**
- User requested realtime preservation
- Copy events are time-sensitive (users want instant feedback)
- Acceptable UX: Page 2+ users can manually refresh if needed
- TanStack Query makes optimistic updates straightforward

**Implementation:**
- Use `queryClient.setQueryData` to prepend to first page
- No network request needed (optimistic update)
- Filters DELETE events from all pages to maintain consistency

### Decision 6: TanStack Query Over Manual State

**Chosen:** Use `useInfiniteQuery` instead of custom pagination logic

**Rationale:**
- Library already installed (`@tanstack/react-query` v5.56.2)
- Handles complex state management (pages, loading, errors, cache)
- Built-in infinite scroll support via `getNextPageParam`
- Automatic cache invalidation and refetching
- Reduces custom code and potential bugs

**Alternatives Considered:**
- Custom useState pagination: More code, more bugs, reinventing wheel
- react-window virtualization: Overkill for 25-item pages, adds dependency
- Cursor-based pagination: Over-engineered for chronological data

---

## 🚨 Risk Mitigation & Rollback

### Risk 1: Breaking Change to Storage Adapter

**Issue:** `getCopyEvents()` signature change could break unknown consumers

**Mitigation:**
- Audit all imports of `getCopyEvents` in codebase before changing
- Only `CopyHistoryContext.tsx` consumes this method (verified)
- Interface change is localized to copy events adapter

**Rollback:**
- Revert storage adapter signature to return `CopyEvent[]`
- Revert context to use `useState` instead of `useInfiniteQuery`
- Remove QueryClientProvider from App.tsx

### Risk 2: Realtime Updates Cause Duplicate Events

**Issue:** Prepending to page 1 while user loads page 2 could create inconsistencies

**Mitigation:**
- TanStack Query deduplicates by event ID (unique key)
- Realtime only updates page 1 (users on page 2+ see updates on refresh)
- Test with two tabs: create event in Tab A, verify no duplication in Tab B

**Rollback:**
- Disable realtime updates by removing subscription `useEffect`
- Users manually refresh to see new events (acceptable for copy history)

### Risk 3: Search UX Confusion (Can't Find Old Events)

**Issue:** Users may expect search to find events beyond loaded pages

**Mitigation:**
- Add helper text: "Searching loaded items. Load more to search older events."
- Document limitation in user guide
- Plan Phase 2 server-side search as enhancement

**Rollback:**
- Keep current behavior (search loaded items only)
- Add "Load All for Search" button that fetches entire dataset temporarily

### Risk 4: Performance Regression on Large Loaded Datasets

**Issue:** Users who load 20+ pages may experience slowdown

**Mitigation:**
- TanStack Query caches pages separately (no data duplication)
- React memoization on CopyEventCard prevents re-renders
- Monitor performance after 10+ pages loaded

**Rollback:**
- Add "virtualization" as Phase 3 enhancement with react-window
- Limit total loaded pages to 10 (requires UI notification)

### Risk 5: QueryClient Not Properly Initialized

**Issue:** App.tsx provider hierarchy may conflict with existing providers

**Mitigation:**
- Place QueryClientProvider OUTSIDE AuthProvider (top level)
- Test authentication flow still works after wrapping
- Verify other contexts can access queryClient

**Rollback:**
- Remove QueryClientProvider wrapper
- Revert to manual state management in context

---

## 🔮 Future Enhancements (Out of Scope)

### Phase 2: Server-Side Search
- Add generated `searchable_text` column to `copy_events` table
- Implement PostgreSQL full-text search with `to_tsvector`
- Support advanced queries ("exact phrase", word1 OR word2)
- Add search debouncing (500ms delay before query)

### Phase 3: Auto-Scroll with IntersectionObserver
- Replace "Load More" button with invisible trigger div
- Automatically load next page when user scrolls to bottom
- Better mobile experience (no button tap needed)

### Phase 4: Virtualization for Power Users
- Add react-window library for virtualized list rendering
- Only render visible items in viewport (constant DOM nodes)
- Supports loading 100+ pages without performance degradation

### Phase 5: Export Copy History
- "Export to CSV" button for analytics
- Filters apply before export
- Downloads all events (not just loaded pages)

### Phase 6: Copy Event Analytics
- Most-used prompts chart
- Time saved trends over weeks/months
- Variable usage patterns

---

## 📁 Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `src/lib/storage/storageAdapter.ts` | ~20 | Update `CopyEventsAdapter` interface signature |
| `src/lib/storage/supabaseAdapter.ts` | 194-208 | Add offset/limit parameters, return pagination metadata |
| `src/App.tsx` | ~10 | Wrap with `QueryClientProvider` |
| `src/contexts/CopyHistoryContext.tsx` | ~175 | Replace `useState` with `useInfiniteQuery`, add realtime handling |
| `src/pages/CopyHistory.tsx` | 20-25, 135-150 | Update search filter, add "Load More" UI, display count |

**Total Estimated Changes:** 150-200 lines modified/added across 5 files

---

## 📅 Implementation Timeline

**Estimated Effort:** 3-4 hours

| Phase | Time | Deliverable |
|-------|------|-------------|
| Phase 1 (Storage) | 30 min | Pagination in adapter + interface |
| Phase 2 (Query Setup) | 15 min | QueryClientProvider in App.tsx |
| Phase 3 (Context Refactor) | 90 min | useInfiniteQuery + realtime handling |
| Phase 4 (UI Updates) | 45 min | "Load More" button + search update |
| Phase 5 (Testing) | 60 min | Full test checklist validation |

---

## ✅ Definition of Done

- [ ] All items in Testing Checklist pass
- [ ] Initial navigation time < 200ms (verified with DevTools Performance tab)
- [ ] No TypeScript errors or ESLint warnings
- [ ] `npm run build` succeeds
- [ ] Code reviewed against CLAUDE.md patterns
- [ ] Realtime updates work across browser tabs
- [ ] Search filters by title only (no variable values)
- [ ] "Load More" progressively loads 25 items per click
- [ ] Total count displayed: "Showing X of Y events"
- [ ] Empty state, loading state, and error states handled
- [ ] Git commit message follows repository standards
- [ ] Branch merged to `main` after approval

---

**Status:** Ready for Implementation
**Next Step:** Begin Phase 1 - Update Storage Adapter Interface
