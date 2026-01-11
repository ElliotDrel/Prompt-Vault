-- Fix get_prompt_versions to return JSON object with versions array and total_count
-- The frontend adapter expects { versions: [...], total_count: number }

DROP FUNCTION IF EXISTS get_prompt_versions(UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_prompt_versions(
    prompt_id UUID,
    offset_count INTEGER DEFAULT 0,
    limit_count INTEGER DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) IS
    'Retrieves paginated version history for a prompt as JSON object with versions array and total_count. Enforces RLS by filtering on auth.uid().';
