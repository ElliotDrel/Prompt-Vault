-- Track when a copy originated from history
-- NULL = fresh copy from Dashboard, non-NULL = re-copied from history

ALTER TABLE copy_events
  ADD COLUMN source_copy_event_id UUID
    REFERENCES copy_events(id) ON DELETE SET NULL;

-- Index for efficient lookups (partial index for non-null only)
CREATE INDEX idx_copy_events_source_copy_event_id
  ON copy_events(source_copy_event_id)
  WHERE source_copy_event_id IS NOT NULL;

COMMENT ON COLUMN copy_events.source_copy_event_id IS
  'References the original copy event when copied from history. NULL = fresh copy.';
