# Track Copy History Source

## Overview
Add a `source_copy_event_id` column to track when a copy event originated from re-copying a previous history entry vs. a fresh copy from Dashboard.

- `NULL` = Fresh copy from Dashboard/PromptCard
- `<uuid>` = Re-copied from Copy History (references the original copy_event)

---

## Implementation Steps

### 1. Database Migration
**File**: `supabase/migrations/[timestamp]_add_source_copy_event_id_column.sql`

```sql
-- Track when a copy originated from history
ALTER TABLE copy_events
  ADD COLUMN source_copy_event_id UUID
    REFERENCES copy_events(id) ON DELETE SET NULL;

-- Index for efficient lookups (partial index for non-null only)
CREATE INDEX idx_copy_events_source_copy_event_id
  ON copy_events(source_copy_event_id)
  WHERE source_copy_event_id IS NOT NULL;

COMMENT ON COLUMN copy_events.source_copy_event_id IS
  'References the original copy event when copied from history. NULL = fresh copy.';
```

Then apply: `npx supabase db push`

---

### 2. Regenerate TypeScript Types
```bash
npx supabase gen types typescript --linked --schema public | Out-File -Encoding utf8 src/types/supabase-generated.ts
```

---

### 3. Update CopyEvent Type
**File**: `src/types/prompt.ts` (line 19-26)

Add `sourceCopyEventId` field:
```typescript
export interface CopyEvent {
  id: string;
  promptId: string;
  promptTitle: string;
  variableValues: VariableValues;
  copiedText: string;
  timestamp: string;
  sourceCopyEventId?: string | null;  // NEW
}
```

---

### 4. Update Storage Adapter
**File**: `src/lib/storage/supabaseAdapter.ts`

**4a.** Update `CopyEventRow` type to include `source_copy_event_id: string | null`

**4b.** Update `mapCopyEventRow` function to map the new field:
```typescript
sourceCopyEventId: row.source_copy_event_id,
```

**4c.** Update `addCopyEvent` insert to include:
```typescript
source_copy_event_id: eventData.sourceCopyEventId ?? null,
```

---

### 5. Pass Source ID from Copy History
**File**: `src/pages/CopyHistory.tsx` (line 127-132)

Update `handleCopyHistoryEvent` to pass the source:
```typescript
await addCopyEvent({
  promptId: event.promptId,
  promptTitle: event.promptTitle,
  variableValues: { ...event.variableValues },
  copiedText: event.copiedText,
  sourceCopyEventId: event.id,  // NEW: Track source
});
```

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/[timestamp]_add_source_copy_event_id_column.sql` | New migration |
| `src/types/supabase-generated.ts` | Regenerated |
| `src/types/prompt.ts` | Add `sourceCopyEventId` to `CopyEvent` |
| `src/lib/storage/supabaseAdapter.ts` | Update row type, mapper, and insert |
| `src/pages/CopyHistory.tsx` | Pass `sourceCopyEventId: event.id` |

---

## No Changes Required

- `PromptCard.tsx` - Fresh copies don't pass `sourceCopyEventId` (defaults to null)
- `CopyHistoryContext.tsx` - Just passes through to adapter
- RLS policies - Existing policies sufficient
- `search_copy_events` function - `RETURNS SETOF copy_events` includes new column automatically

---

## Verification

1. Copy from Dashboard → Check DB: `source_copy_event_id` is `NULL`
2. Copy from History → Check DB: `source_copy_event_id` = original event's ID
3. Delete original event → Derived event's `source_copy_event_id` becomes `NULL` (ON DELETE SET NULL)
4. Search still works
5. Pagination still works
