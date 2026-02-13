-- Fix search_copy_events function to include explicit search_path
-- The migration file had SET search_path = public but it wasn't applied to the database

CREATE OR REPLACE FUNCTION public.search_copy_events(
  search_query text,
  result_limit integer DEFAULT 500
)
RETURNS SETOF copy_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  escaped_query text := replace(replace(search_query, '%', '\%'), '_', '\_');
BEGIN
  -- Only return events for the authenticated user (RLS aware)
  RETURN QUERY
  SELECT *
  FROM public.copy_events
  WHERE user_id = auth.uid()
    AND (
      -- Search in prompt title (case-insensitive)
      prompt_title ILIKE '%' || escaped_query || '%' ESCAPE '\'
      OR
      -- Search in variable values (JSONB iteration)
      EXISTS (
        SELECT 1
        FROM jsonb_each_text(variable_values) AS kv
        WHERE kv.value ILIKE '%' || escaped_query || '%' ESCAPE '\'
      )
    )
  ORDER BY created_at DESC
  LIMIT result_limit;
END;
$$;
