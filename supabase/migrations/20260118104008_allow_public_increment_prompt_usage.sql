-- Allow public prompts to be incremented by any authenticated user
-- Keeps return shape aligned with prompt visibility for broadcast decisions

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
    UPDATE public.prompts
    SET times_used = COALESCE(public.prompts.times_used, 0) + 1
    WHERE public.prompts.id = p_id
      AND (
        public.prompts.user_id = auth.uid()
        OR public.prompts.visibility = 'public'
      )
    RETURNING
        public.prompts.id,
        public.prompts.user_id,
        public.prompts.title,
        public.prompts.body,
        public.prompts.variables,
        public.prompts.is_pinned,
        public.prompts.times_used,
        public.prompts.created_at,
        public.prompts.updated_at,
        public.prompts.visibility;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID) TO authenticated;

COMMENT ON FUNCTION increment_prompt_usage(UUID) IS 'Atomically increments the times_used counter for a prompt. Uses auth.uid() internally for security. Allows increments on public prompts. Returns the updated prompt row (including visibility for broadcast decisions) or empty result if not found/unauthorized.';
