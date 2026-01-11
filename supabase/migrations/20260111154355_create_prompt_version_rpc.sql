-- Create RPC function for inserting prompt version snapshots
-- This enables application code to save prompt versions without complex SQL
-- Performance: Single atomic operation with ownership validation
-- Safety: SECURITY DEFINER with explicit auth.uid() check prevents unauthorized access

CREATE OR REPLACE FUNCTION create_prompt_version(
    p_prompt_id UUID,
    p_version_number INTEGER,
    p_title TEXT,
    p_body TEXT,
    p_variables JSONB
)
RETURNS TABLE (
    id UUID,
    prompt_id UUID,
    user_id UUID,
    version_number INTEGER,
    title TEXT,
    body TEXT,
    variables JSONB,
    is_consolidated BOOLEAN,
    consolidation_group_id UUID,
    created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validate prompt ownership before creating version
    -- This ensures users can only create versions for their own prompts
    SELECT prompts.user_id INTO v_user_id
    FROM prompts
    WHERE prompts.id = p_prompt_id
      AND prompts.user_id = auth.uid();

    -- If prompt doesn't exist or user doesn't own it, return empty result
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    -- Insert new version snapshot and return the created row
    RETURN QUERY
    INSERT INTO prompt_versions (
        prompt_id,
        user_id,
        version_number,
        title,
        body,
        variables,
        is_consolidated,
        consolidation_group_id
    )
    VALUES (
        p_prompt_id,
        v_user_id,
        p_version_number,
        p_title,
        p_body,
        p_variables,
        false,  -- New versions are never consolidated
        NULL    -- No consolidation group initially
    )
    RETURNING
        prompt_versions.id,
        prompt_versions.prompt_id,
        prompt_versions.user_id,
        prompt_versions.version_number,
        prompt_versions.title,
        prompt_versions.body,
        prompt_versions.variables,
        prompt_versions.is_consolidated,
        prompt_versions.consolidation_group_id,
        prompt_versions.created_at;
END;
$$;

-- Grant execution to authenticated users
-- This allows logged-in users to call the function
GRANT EXECUTE ON FUNCTION create_prompt_version(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;

-- Add helpful comment for documentation
COMMENT ON FUNCTION create_prompt_version(UUID, INTEGER, TEXT, TEXT, JSONB) IS 'Creates a new version snapshot for a prompt. Validates prompt ownership via auth.uid(). Returns the created version row or empty result if prompt not found or unauthorized.';
