-- Update prompt_stats view to include time_saved_multiplier from user_settings
-- This migration is non-breaking: adds new columns while keeping existing ones

-- Drop the existing view
DROP VIEW IF EXISTS prompt_stats;

-- Recreate view with multiplier and total_prompt_uses
CREATE OR REPLACE VIEW prompt_stats AS
WITH prompt_totals AS (
    SELECT
        user_id,
        COUNT(*) AS total_prompts,
        COALESCE(SUM(COALESCE(times_used, 0)), 0) AS total_prompt_uses
    FROM prompts
    GROUP BY user_id
),
copy_totals AS (
    SELECT
        user_id,
        COUNT(*) AS total_copies
    FROM copy_events
    GROUP BY user_id
)
SELECT
    pt.user_id,
    pt.total_prompts,
    COALESCE(ct.total_copies, 0) AS total_copies,
    pt.total_prompt_uses,
    COALESCE(us.time_saved_multiplier, 5) AS time_saved_multiplier
FROM prompt_totals pt
LEFT JOIN copy_totals ct ON pt.user_id = ct.user_id
LEFT JOIN user_settings us ON pt.user_id = us.user_id;

-- Grant access to authenticated users
GRANT SELECT ON prompt_stats TO authenticated;

-- Enable RLS on the view (security_invoker ensures RLS policies are applied)
ALTER VIEW prompt_stats SET (security_invoker = true);
