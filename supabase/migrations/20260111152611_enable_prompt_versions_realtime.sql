-- Enable realtime for prompt_versions table
-- This allows future realtime subscriptions even though v1 won't actively subscribe
-- Forward compatibility for potential live updates in later versions

-- Add table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE prompt_versions;
