-- Function to consolidate old prompt versions into tiered snapshots
-- Implements 3-tier strategy:
-- - Keep all versions from last 7 days
-- - 7-30 days ago: keep 1 per hour
-- - 30-90 days ago: keep 1 per day
-- - 90+ days ago: keep 1 per week

CREATE OR REPLACE FUNCTION consolidate_prompt_versions(p_prompt_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consolidated_count INTEGER;
  v_group_id UUID;
BEGIN
  -- Generate a UUID for this consolidation batch
  v_group_id := gen_random_uuid();

  -- Mark versions for consolidation using tiered strategy
  WITH
  -- Get all versions for this prompt that aren't already consolidated
  all_versions AS (
    SELECT
      id,
      version_number,
      created_at,
      -- Calculate age bucket for each version
      CASE
        WHEN created_at >= NOW() - INTERVAL '7 days' THEN 'keep_all'
        WHEN created_at >= NOW() - INTERVAL '30 days' THEN 'hourly'
        WHEN created_at >= NOW() - INTERVAL '90 days' THEN 'daily'
        ELSE 'weekly'
      END AS bucket,
      -- Time bucket for grouping
      CASE
        WHEN created_at >= NOW() - INTERVAL '7 days' THEN NULL
        WHEN created_at >= NOW() - INTERVAL '30 days' THEN date_trunc('hour', created_at)
        WHEN created_at >= NOW() - INTERVAL '90 days' THEN date_trunc('day', created_at)
        ELSE date_trunc('week', created_at)
      END AS time_bucket,
      -- Rank within each time bucket (to keep first occurrence)
      ROW_NUMBER() OVER (
        PARTITION BY
          CASE
            WHEN created_at >= NOW() - INTERVAL '7 days' THEN NULL
            WHEN created_at >= NOW() - INTERVAL '30 days' THEN date_trunc('hour', created_at)
            WHEN created_at >= NOW() - INTERVAL '90 days' THEN date_trunc('day', created_at)
            ELSE date_trunc('week', created_at)
          END
        ORDER BY created_at ASC
      ) AS rank_in_bucket
    FROM prompt_versions
    WHERE prompt_id = p_prompt_id
      AND is_consolidated = false
  ),
  -- Identify versions to consolidate (not keep_all bucket, and not first in bucket)
  to_consolidate AS (
    SELECT id
    FROM all_versions
    WHERE bucket != 'keep_all'
      AND rank_in_bucket > 1
  )
  -- Mark versions as consolidated
  UPDATE prompt_versions
  SET
    is_consolidated = true,
    consolidation_group_id = v_group_id
  WHERE id IN (SELECT id FROM to_consolidate);

  -- Get count of rows updated
  GET DIAGNOSTICS v_consolidated_count = ROW_COUNT;

  -- Return count of consolidated versions
  RETURN v_consolidated_count;
END;
$$;

COMMENT ON FUNCTION consolidate_prompt_versions(UUID) IS
  'Consolidates old prompt versions using tiered strategy: keep all from last 7 days, 1/hour for 7-30 days, 1/day for 30-90 days, 1/week for 90+ days. Returns count of versions marked as consolidated. Called by pg_cron in Phase 8.';

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION consolidate_prompt_versions(UUID) TO authenticated;
