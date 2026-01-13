-- Backfill existing prompts as version 1
-- Uses prompt's original created_at to reflect when content was first saved
-- Idempotent: safe to run multiple times (NOT EXISTS check)

INSERT INTO prompt_versions (
    prompt_id,
    user_id,
    version_number,
    title,
    body,
    variables,
    is_consolidated,
    consolidation_group_id,
    reverted_from_version_id,
    created_at
)
SELECT
    p.id,
    p.user_id,
    1,
    p.title,
    p.body,
    COALESCE(p.variables, '[]'::jsonb),
    false,
    NULL,
    NULL,
    p.created_at
FROM prompts p
WHERE NOT EXISTS (
    SELECT 1 FROM prompt_versions pv
    WHERE pv.prompt_id = p.id
);
