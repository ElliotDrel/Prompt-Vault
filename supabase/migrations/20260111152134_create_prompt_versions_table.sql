-- Create prompt_versions table for version history tracking
-- Stores complete snapshots of prompts at each edit point (immutable history)

-- Create prompt_versions table
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_consolidated BOOLEAN DEFAULT false,
    consolidation_group_id UUID DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_user_id ON prompt_versions(user_id);
CREATE INDEX idx_prompt_versions_created_at ON prompt_versions(created_at DESC);
CREATE INDEX idx_prompt_versions_prompt_version ON prompt_versions(prompt_id, version_number);

-- Add constraints
ALTER TABLE prompt_versions ADD CONSTRAINT unique_prompt_version UNIQUE (prompt_id, version_number);
ALTER TABLE prompt_versions ADD CONSTRAINT positive_version_number CHECK (version_number > 0);

-- Enable Row Level Security
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- SELECT: Users can view versions of their own prompts
CREATE POLICY "Users can view their own prompt versions" ON prompt_versions
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can create versions for their own prompts
CREATE POLICY "Users can insert their own prompt versions" ON prompt_versions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete versions of their own prompts (cascade handles this)
CREATE POLICY "Users can delete their own prompt versions" ON prompt_versions
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions (no UPDATE - versions are immutable)
GRANT SELECT, INSERT, DELETE ON prompt_versions TO authenticated;
