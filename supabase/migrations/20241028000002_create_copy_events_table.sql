-- Create copy_events table for storing copy history
-- Based on the CopyEvent interface from src/types/prompt.ts

-- Create copy_events table
CREATE TABLE copy_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    prompt_title TEXT NOT NULL,
    variable_values JSONB DEFAULT '{}'::jsonb,
    copied_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_copy_events_user_id ON copy_events(user_id);
CREATE INDEX idx_copy_events_prompt_id ON copy_events(prompt_id);
CREATE INDEX idx_copy_events_created_at ON copy_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE copy_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own copy events" ON copy_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copy events" ON copy_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own copy events" ON copy_events
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON copy_events TO authenticated;

-- Create a view for prompt statistics (aggregated data)
CREATE OR REPLACE VIEW prompt_stats AS
SELECT
    p.user_id,
    COUNT(DISTINCT p.id) as total_prompts,
    COUNT(ce.id) as total_copies,
    SUM(p.time_saved_minutes) as time_saved_minutes,
    SUM(p.times_used) as total_prompt_uses
FROM prompts p
LEFT JOIN copy_events ce ON p.id = ce.prompt_id AND p.user_id = ce.user_id
GROUP BY p.user_id;

-- Grant access to the view
GRANT SELECT ON prompt_stats TO authenticated;

-- Create RLS policy for the view
ALTER VIEW prompt_stats SET (security_invoker = true);