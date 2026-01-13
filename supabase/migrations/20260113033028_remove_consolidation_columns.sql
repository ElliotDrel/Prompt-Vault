-- Remove unused consolidation columns and function
-- These were added for forward-compatibility with a consolidation feature
-- that was later removed from the roadmap (too complex, not needed)

-- 1. Drop the unused consolidation function
DROP FUNCTION IF EXISTS public.consolidate_prompt_versions(uuid, uuid[]);

-- 2. Drop unused columns from prompt_versions
ALTER TABLE prompt_versions DROP COLUMN IF EXISTS is_consolidated;
ALTER TABLE prompt_versions DROP COLUMN IF EXISTS consolidation_group_id;

-- 3. Update create_prompt_version to not reference removed columns
DROP FUNCTION IF EXISTS public.create_prompt_version(uuid, integer, text, text, jsonb, uuid);

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
        reverted_from_version_id
    )
    VALUES (
        create_prompt_version.prompt_id,
        v_user_id,
        create_prompt_version.version_number,
        create_prompt_version.title,
        create_prompt_version.body,
        create_prompt_version.variables,
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
        prompt_versions.reverted_from_version_id,
        prompt_versions.created_at;
END;
$function$;

-- 4. Update get_prompt_versions to not return removed columns
DROP FUNCTION IF EXISTS public.get_prompt_versions(uuid, integer, integer);

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
