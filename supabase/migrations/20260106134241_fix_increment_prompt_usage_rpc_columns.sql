-- Fix increment_prompt_usage RPC function to remove time_saved_minutes column
-- This column was removed in migration 20260104000003_remove_time_saved_minutes.sql
-- The RPC function needs to match the current table schema

-- Drop the existing function first (PostgreSQL doesn't allow changing return type with CREATE OR REPLACE)
DROP FUNCTION IF EXISTS increment_prompt_usage(UUID);

-- Recreate with correct columns
CREATE FUNCTION increment_prompt_usage(
    p_id UUID
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    body TEXT,
    variables JSONB,
    is_pinned BOOLEAN,
    times_used INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atomically increment times_used and return the updated row
    -- The WHERE clause enforces that users can only increment their own prompts
    -- The update_prompts_updated_at trigger will automatically update updated_at
    RETURN QUERY
    UPDATE prompts
    SET times_used = COALESCE(times_used, 0) + 1
    WHERE prompts.id = p_id
      AND prompts.user_id = auth.uid()
    RETURNING
        prompts.id,
        prompts.user_id,
        prompts.title,
        prompts.body,
        prompts.variables,
        prompts.is_pinned,
        prompts.times_used,
        prompts.created_at,
        prompts.updated_at;

    -- If no rows were updated (prompt doesn't exist or user_id doesn't match),
    -- the function returns an empty result set, which the adapter can handle
END;
$$;

-- Re-grant execution permissions (needed since we dropped the function)
GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID) TO authenticated;

-- Re-add comment
COMMENT ON FUNCTION increment_prompt_usage(UUID) IS 'Atomically increments the times_used counter for a prompt. Only allows users to increment their own prompts. Returns the updated prompt row or empty result if not found/unauthorized.';
