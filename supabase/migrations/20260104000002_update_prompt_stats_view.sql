-- Update prompt_stats view to include time_saved_multiplier from user_settings
-- This migration is non-breaking: adds new columns while keeping existing ones

-- Drop the existing view
DROP VIEW IF EXISTS prompt_stats;

-- Recreate view with multiplier and total_prompt_uses
CREATE OR REPLACE VIEW prompt_stats AS
SELECT
    p.user_id,
    COUNT(DISTINCT p.id) as total_prompts,
    COUNT(ce.id) as total_copies,
    SUM(p.times_used) as total_prompt_uses,
    COALESCE(us.time_saved_multiplier, 5) as time_saved_multiplier
FROM prompts p
LEFT JOIN copy_events ce ON p.id = ce.prompt_id AND p.user_id = ce.user_id
LEFT JOIN user_settings us ON p.user_id = us.user_id
GROUP BY p.user_id, us.time_saved_multiplier;

-- Grant access to authenticated users
GRANT SELECT ON prompt_stats TO authenticated;

-- Enable RLS on the view (security_invoker ensures RLS policies are applied)
ALTER VIEW prompt_stats SET (security_invoker = true);
