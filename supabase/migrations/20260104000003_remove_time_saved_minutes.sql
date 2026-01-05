-- Remove obsolete time_saved_minutes column from prompts table
-- WARNING: This is a BREAKING migration
-- ONLY run this AFTER the new code has been deployed and verified (Stage 3)

-- Drop the column (IF EXISTS prevents errors if already removed)
ALTER TABLE prompts DROP COLUMN IF EXISTS time_saved_minutes;
