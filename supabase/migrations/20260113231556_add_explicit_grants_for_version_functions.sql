-- Add explicit GRANT statements for version functions
-- These grants may already exist via PUBLIC, but adding them explicitly:
-- 1. Documents the intent for future maintainers
-- 2. Ensures authenticated access survives if PUBLIC execute is revoked
-- 3. Matches the pattern used in other function migrations

-- Grant execute on create_prompt_version (signature with reverted_from_version_id)
GRANT EXECUTE ON FUNCTION public.create_prompt_version(uuid, integer, text, text, jsonb, uuid) TO authenticated;

-- Grant execute on get_prompt_versions
GRANT EXECUTE ON FUNCTION public.get_prompt_versions(uuid, integer, integer) TO authenticated;
