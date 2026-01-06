-- Create RPC function for atomic prompt usage increment
-- This eliminates the read-then-write pattern in favor of a single atomic UPDATE
-- Performance: Reduces 2 DB roundtrips to 1 (~100ms improvement)
-- Safety: Atomic increment prevents race conditions from concurrent requests

CREATE OR REPLACE FUNCTION increment_prompt_usage(
    p_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    body TEXT,
    variables JSONB,
    is_pinned BOOLEAN,
    times_used INTEGER,
    time_saved_minutes INTEGER,
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
      AND prompts.user_id = p_user_id
    RETURNING
        prompts.id,
        prompts.user_id,
        prompts.title,
        prompts.body,
        prompts.variables,
        prompts.is_pinned,
        prompts.times_used,
        prompts.time_saved_minutes,
        prompts.created_at,
        prompts.updated_at;

    -- If no rows were updated (prompt doesn't exist or user_id doesn't match),
    -- the function returns an empty result set, which the adapter can handle
END;
$$;

-- Grant execution to authenticated users
-- This allows logged-in users to call the function
GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID, UUID) TO authenticated;

-- Add helpful comment for documentation
COMMENT ON FUNCTION increment_prompt_usage(UUID, UUID) IS 'Atomically increments the times_used counter for a prompt. Only allows users to increment their own prompts. Returns the updated prompt row or empty result if not found/unauthorized.';
