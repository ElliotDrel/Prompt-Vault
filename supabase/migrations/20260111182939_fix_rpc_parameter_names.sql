-- Fix RPC parameter names to match frontend adapter code
-- PostgREST uses parameter names for matching, so names must be exact

-- Drop existing functions (CASCADE handles dependencies)
DROP FUNCTION IF EXISTS create_prompt_version(UUID, INTEGER, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_prompt_versions(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS consolidate_prompt_versions(UUID);

-- Recreate create_prompt_version with matching parameter names
CREATE OR REPLACE FUNCTION create_prompt_version(
    prompt_id UUID,
    version_number INTEGER,
    title TEXT,
    body TEXT,
    variables JSONB
)
RETURNS TABLE (
    id UUID,
    out_prompt_id UUID,
    user_id UUID,
    out_version_number INTEGER,
    out_title TEXT,
    out_body TEXT,
    out_variables JSONB,
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
    SELECT prompts.user_id INTO v_user_id
    FROM prompts
    WHERE prompts.id = prompt_id
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
        create_prompt_version.prompt_id,
        v_user_id,
        create_prompt_version.version_number,
        create_prompt_version.title,
        create_prompt_version.body,
        create_prompt_version.variables,
        false,
        NULL
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

GRANT EXECUTE ON FUNCTION create_prompt_version(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION create_prompt_version(UUID, INTEGER, TEXT, TEXT, JSONB) IS
    'Creates a new version snapshot for a prompt. Validates prompt ownership via auth.uid(). Returns the created version row or empty result if prompt not found or unauthorized.';

-- Recreate get_prompt_versions with matching parameter names
CREATE OR REPLACE FUNCTION get_prompt_versions(
    prompt_id UUID,
    offset_count INTEGER DEFAULT 0,
    limit_count INTEGER DEFAULT 50
)
RETURNS SETOF prompt_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM prompt_versions pv
    WHERE pv.prompt_id = get_prompt_versions.prompt_id
      AND pv.user_id = auth.uid()
    ORDER BY pv.created_at DESC
    OFFSET offset_count
    LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) IS
    'Retrieves paginated version history for a prompt, ordered by recency. Enforces RLS by filtering on auth.uid(). Default limit of 50 prevents unbounded queries.';

-- Recreate consolidate_prompt_versions with matching parameter name
CREATE OR REPLACE FUNCTION consolidate_prompt_versions(prompt_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_consolidated_count INTEGER;
    v_group_id UUID;
BEGIN
    v_group_id := gen_random_uuid();

    WITH
    all_versions AS (
        SELECT
            pv.id,
            pv.version_number,
            pv.created_at,
            CASE
                WHEN pv.created_at >= NOW() - INTERVAL '7 days' THEN 'keep_all'
                WHEN pv.created_at >= NOW() - INTERVAL '30 days' THEN 'hourly'
                WHEN pv.created_at >= NOW() - INTERVAL '90 days' THEN 'daily'
                ELSE 'weekly'
            END AS bucket,
            CASE
                WHEN pv.created_at >= NOW() - INTERVAL '7 days' THEN NULL
                WHEN pv.created_at >= NOW() - INTERVAL '30 days' THEN date_trunc('hour', pv.created_at)
                WHEN pv.created_at >= NOW() - INTERVAL '90 days' THEN date_trunc('day', pv.created_at)
                ELSE date_trunc('week', pv.created_at)
            END AS time_bucket,
            ROW_NUMBER() OVER (
                PARTITION BY
                    CASE
                        WHEN pv.created_at >= NOW() - INTERVAL '7 days' THEN NULL
                        WHEN pv.created_at >= NOW() - INTERVAL '30 days' THEN date_trunc('hour', pv.created_at)
                        WHEN pv.created_at >= NOW() - INTERVAL '90 days' THEN date_trunc('day', pv.created_at)
                        ELSE date_trunc('week', pv.created_at)
                    END
                ORDER BY pv.created_at ASC
            ) AS rank_in_bucket
        FROM prompt_versions pv
        WHERE pv.prompt_id = consolidate_prompt_versions.prompt_id
          AND pv.is_consolidated = false
    ),
    to_consolidate AS (
        SELECT av.id
        FROM all_versions av
        WHERE av.bucket != 'keep_all'
          AND av.rank_in_bucket > 1
    )
    UPDATE prompt_versions
    SET
        is_consolidated = true,
        consolidation_group_id = v_group_id
    WHERE id IN (SELECT id FROM to_consolidate);

    GET DIAGNOSTICS v_consolidated_count = ROW_COUNT;

    RETURN v_consolidated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION consolidate_prompt_versions(UUID) TO authenticated;

COMMENT ON FUNCTION consolidate_prompt_versions(UUID) IS
    'Consolidates old prompt versions using tiered strategy: keep all from last 7 days, 1/hour for 7-30 days, 1/day for 30-90 days, 1/week for 90+ days. Returns count of versions marked as consolidated.';
