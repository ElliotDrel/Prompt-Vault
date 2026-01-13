-- Fix timestamps for backfilled versions
-- Problem: Phase 8 backfill used p.created_at (first creation) instead of p.updated_at (last edit)
-- Result: "Current" versions show as oldest by date, which is wrong
-- Fix: Update created_at for highest version of each prompt to use prompt's updated_at

UPDATE prompt_versions pv
SET created_at = p.updated_at
FROM prompts p
WHERE pv.prompt_id = p.id
  AND pv.version_number = (
    SELECT MAX(version_number)
    FROM prompt_versions pv2
    WHERE pv2.prompt_id = pv.prompt_id
  )
  AND p.updated_at > p.created_at;  -- Only fix if prompt was actually edited after creation
