-- Enable realtime for prompts and copy_events tables
-- This allows Supabase Realtime to broadcast changes via WebSocket

-- Add prompts table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE prompts;

-- Add copy_events table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE copy_events;

-- Add prompt_stats view to realtime publication (optional)
-- Note: This may fail if prompt_stats is a view - realtime only works with tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE prompt_stats;

-- Verify RLS is enabled (required for secure realtime)
-- These should already exist from previous migrations, but included for completeness
-- ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE copy_events ENABLE ROW LEVEL SECURITY;
