-- Fix initialize_user_settings function to use schema-qualified table name
-- The original function referenced "user_settings" without the "public." prefix,
-- which fails when the trigger runs from auth.users context because the search_path
-- doesn't include the public schema.

-- Drop and recreate the function with the explicit schema prefix
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, time_saved_multiplier)
    VALUES (NEW.id, 5)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
