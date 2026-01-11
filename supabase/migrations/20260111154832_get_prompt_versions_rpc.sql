-- Create RPC function to get paginated prompt versions
CREATE OR REPLACE FUNCTION get_prompt_versions(
  p_prompt_id UUID,
  p_offset INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF prompt_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM prompt_versions
  WHERE prompt_id = p_prompt_id
    AND user_id = auth.uid()
  ORDER BY created_at DESC
  OFFSET p_offset
  LIMIT p_limit;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) IS 'Retrieves paginated version history for a prompt, ordered by recency. Enforces RLS by filtering on auth.uid(). Default limit of 50 prevents unbounded queries.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_prompt_versions(UUID, INTEGER, INTEGER) TO authenticated;
