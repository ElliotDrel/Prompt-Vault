-- Create user_settings table for storing per-user configuration
-- This migration is non-breaking and can be applied before code deployment

-- Create the user_settings table
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    time_saved_multiplier INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at trigger (reuses existing function from prompts table)
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to authenticated users
GRANT ALL ON user_settings TO authenticated;

-- Backfill settings for all existing users
-- This ensures no user is left without settings
INSERT INTO user_settings (user_id, time_saved_multiplier)
SELECT id, 5 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger function to auto-initialize settings for new users
CREATE OR REPLACE FUNCTION initialize_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id, time_saved_multiplier)
    VALUES (NEW.id, 5)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_settings();
