-- Update create_prompt_version to support reverted_from_version_id parameter
-- Update get_prompt_versions to return reverted_from_version_id field

-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_prompt_version(uuid, integer, text, text, jsonb);
DROP FUNCTION IF EXISTS public.get_prompt_versions(uuid, integer, integer);

-- Recreate create_prompt_version with reverted_from_version_id parameter
CREATE OR REPLACE FUNCTION public.create_prompt_version(
    prompt_id uuid,
    version_number integer,
    title text,
    body text,
    variables jsonb,
    reverted_from_version_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    out_prompt_id uuid,
    user_id uuid,
    out_version_number integer,
    out_title text,
    out_body text,
    out_variables jsonb,
    is_consolidated boolean,
    consolidation_group_id uuid,
    out_reverted_from_version_id uuid,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validate prompt ownership before creating version
    SELECT prompts.user_id INTO v_user_id
    FROM prompts
    WHERE prompts.id = create_prompt_version.prompt_id
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
        consolidation_group_id,
        reverted_from_version_id
    )
    VALUES (
        create_prompt_version.prompt_id,
        v_user_id,
        create_prompt_version.version_number,
        create_prompt_version.title,
        create_prompt_version.body,
        create_prompt_version.variables,
        false,
        NULL,
        create_prompt_version.reverted_from_version_id
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
        prompt_versions.reverted_from_version_id,
        prompt_versions.created_at;
END;
$function$;

-- Recreate get_prompt_versions to include reverted_from_version_id
CREATE OR REPLACE FUNCTION public.get_prompt_versions(
    prompt_id uuid,
    offset_count integer DEFAULT 0,
    limit_count integer DEFAULT 50
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_total_count INTEGER;
    v_versions JSON;
BEGIN
    -- Get total count first
    SELECT COUNT(*)::INTEGER INTO v_total_count
    FROM prompt_versions pv
    WHERE pv.prompt_id = get_prompt_versions.prompt_id
      AND pv.user_id = auth.uid();

    -- Get paginated versions as JSON array
    SELECT COALESCE(json_agg(row_to_json(v)), '[]'::json) INTO v_versions
    FROM (
        SELECT
            pv.id,
            pv.prompt_id,
            pv.user_id,
            pv.version_number,
            pv.title,
            pv.body,
            pv.variables,
            pv.is_consolidated,
            pv.consolidation_group_id,
            pv.reverted_from_version_id,
            pv.created_at
        FROM prompt_versions pv
        WHERE pv.prompt_id = get_prompt_versions.prompt_id
          AND pv.user_id = auth.uid()
        ORDER BY pv.created_at DESC
        OFFSET offset_count
        LIMIT limit_count
    ) v;

    -- Return as JSON object with versions array and total_count
    RETURN json_build_object(
        'versions', v_versions,
        'total_count', v_total_count
    );
END;
$function$;
