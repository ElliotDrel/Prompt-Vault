-- Add visibility column to increment_prompt_usage RPC return type
--
-- ISSUE: The RPC doesn't return visibility, so the adapter defaults to 'private'
-- and never broadcasts when a public prompt is copied (incrementPromptUsage).
--
-- FIX: Drop and recreate with visibility in both RETURNS TABLE and RETURNING clause.

-- Must drop first because changing return type isn't allowed
DROP FUNCTION IF EXISTS increment_prompt_usage(UUID);

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
    updated_at TIMESTAMPTZ,
    visibility prompt_visibility
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE prompts
    SET times_used = COALESCE(prompts.times_used, 0) + 1
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
        prompts.updated_at,
        prompts.visibility;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID) TO authenticated;

-- Update documentation comment
COMMENT ON FUNCTION increment_prompt_usage(UUID) IS 'Atomically increments the times_used counter for a prompt. Uses auth.uid() internally for security. Only allows users to increment their own prompts. Returns the updated prompt row (including visibility for broadcast decisions) or empty result if not found/unauthorized.';
