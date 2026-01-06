-- Function to search copy events by title and variable values
-- Searches entire user history, not just loaded pages
CREATE OR REPLACE FUNCTION search_copy_events(
  search_query text,
  result_limit integer DEFAULT 500
)
RETURNS SETOF copy_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return events for the authenticated user (RLS aware)
  RETURN QUERY
  SELECT *
  FROM copy_events
  WHERE user_id = auth.uid()
    AND (
      -- Search in prompt title (case-insensitive)
      prompt_title ILIKE '%' || search_query || '%'
      OR
      -- Search in variable values (JSONB iteration)
      EXISTS (
        SELECT 1
        FROM jsonb_each_text(variable_values) AS kv
        WHERE kv.value ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY created_at DESC
  LIMIT result_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_copy_events(text, integer) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION search_copy_events IS
  'Searches copy events by prompt title or variable values. Returns up to result_limit results ordered by most recent first.';
