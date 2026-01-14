-- Fix create_prompt_version return shape and restore GRANTs after function recreation
--
-- Issue: The function returns out_* prefixed columns but mapVersionRow expects unprefixed.
-- Solution: Use p_* prefix for INPUT params, unprefixed for RETURNS TABLE output.
-- This avoids PostgreSQL's restriction on duplicate names between params and return cols.

DROP FUNCTION IF EXISTS public.create_prompt_version(uuid, integer, text, text, jsonb, uuid);

CREATE OR REPLACE FUNCTION public.create_prompt_version(
    p_prompt_id uuid,
    p_version_number integer,
    p_title text,
    p_body text,
    p_variables jsonb,
    p_reverted_from_version_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    prompt_id uuid,
    user_id uuid,
    version_number integer,
    title text,
    body text,
    variables jsonb,
    reverted_from_version_id uuid,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    -- Validate prompt ownership before creating version
    SELECT prompts.user_id INTO v_user_id
    FROM prompts
    WHERE prompts.id = p_prompt_id
      AND prompts.user_id = auth.uid();

    -- If prompt doesn't exist or user doesn't own it, return empty result
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    INSERT INTO prompt_versions (
        prompt_id,
        user_id,
        version_number,
        title,
        body,
        variables,
        reverted_from_version_id
    )
    VALUES (
        p_prompt_id,
        v_user_id,
        p_version_number,
        p_title,
        p_body,
        p_variables,
        p_reverted_from_version_id
    )
    RETURNING
        prompt_versions.id,
        prompt_versions.prompt_id,
        prompt_versions.user_id,
        prompt_versions.version_number,
        prompt_versions.title,
        prompt_versions.body,
        prompt_versions.variables,
        prompt_versions.reverted_from_version_id,
        prompt_versions.created_at;
END;
$function$;

-- Drop the dead consolidate_prompt_versions function (references removed columns, no auth check)
DROP FUNCTION IF EXISTS public.consolidate_prompt_versions(uuid);

-- Restore EXECUTE grants after function recreation
GRANT EXECUTE ON FUNCTION public.create_prompt_version(uuid, integer, text, text, jsonb, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_prompt_versions(uuid, integer, integer) TO authenticated;

COMMENT ON FUNCTION public.create_prompt_version(uuid, integer, text, text, jsonb, uuid) IS
    'Creates a new version snapshot for a prompt. Validates prompt ownership via auth.uid(). Returns the created version row or empty result if prompt not found or unauthorized.';
