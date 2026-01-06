-- Fix "column reference 'times_used' is ambiguous" error in increment_prompt_usage
-- The SET clause needs to explicitly qualify the column reference with the table name

DROP FUNCTION IF EXISTS increment_prompt_usage(UUID, UUID);

CREATE FUNCTION increment_prompt_usage(
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atomically increment times_used and return the updated row
    -- IMPORTANT: Qualify column names with table name to avoid ambiguity
    RETURN QUERY
    UPDATE prompts
    SET times_used = COALESCE(prompts.times_used, 0) + 1
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
        prompts.created_at,
        prompts.updated_at;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION increment_prompt_usage(UUID, UUID) IS 'Atomically increments the times_used counter for a prompt. Only allows users to increment their own prompts. Returns the updated prompt row or empty result if not found/unauthorized.';
