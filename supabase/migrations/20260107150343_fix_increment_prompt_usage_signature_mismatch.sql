-- Fix increment_prompt_usage function signature mismatch
--
-- ISSUE: The remote database has increment_prompt_usage(UUID, UUID) but the application
-- code expects increment_prompt_usage(UUID) with auth.uid() used internally.
--
-- ROOT CAUSE: Historical migrations were edited after being applied to remote, causing
-- a mismatch between local migration files and remote database state.
--
-- SOLUTION: This migration explicitly drops the old two-parameter function and creates
-- the new one-parameter function to match application expectations.

-- Drop the old two-parameter function that currently exists on remote
DROP FUNCTION IF EXISTS increment_prompt_usage(UUID, UUID);

-- Create the new one-parameter function that matches application code expectations
-- Using CREATE OR REPLACE to ensure idempotency if one-parameter function already exists
CREATE OR REPLACE FUNCTION increment_prompt_usage(
    p_id UUID
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    body TEXT,
    variables JSONB,
    is_pinned BOOLEAN,
    times_used INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atomically increment times_used and return the updated row
    -- IMPORTANT: Uses auth.uid() internally instead of requiring p_user_id parameter
    -- This provides better security and cleaner API
    RETURN QUERY
    UPDATE prompts
    SET times_used = COALESCE(prompts.times_used, 0) + 1
    WHERE prompts.id = p_id
      AND prompts.user_id = auth.uid()
    RETURNING
        prompts.id,
        prompts.user_id,
        prompts.title,
        prompts.body,
        prompts.variables,
        prompts.is_pinned,
        prompts.times_used,
        prompts.created_at,
        prompts.updated_at;

    -- If no rows were updated (prompt doesn't exist or user_id doesn't match),
    -- the function returns an empty result set, which the adapter handles gracefully
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_prompt_usage(UUID) TO authenticated;

-- Add documentation comment
COMMENT ON FUNCTION increment_prompt_usage(UUID) IS 'Atomically increments the times_used counter for a prompt. Uses auth.uid() internally for security. Only allows users to increment their own prompts. Returns the updated prompt row or empty result if not found/unauthorized.';
