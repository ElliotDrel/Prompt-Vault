-- Add filter preference columns to user_settings table
-- These columns persist user filter/sort preferences across sessions

ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS filter_visibility TEXT NOT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS filter_author TEXT NOT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS sort_by TEXT NOT NULL DEFAULT 'lastUpdated',
ADD COLUMN IF NOT EXISTS sort_direction TEXT NOT NULL DEFAULT 'desc';

-- Add CHECK constraints for valid values
ALTER TABLE public.user_settings
ADD CONSTRAINT filter_visibility_check CHECK (filter_visibility IN ('all', 'public', 'private')),
ADD CONSTRAINT filter_author_check CHECK (filter_author IN ('all', 'mine', 'others')),
ADD CONSTRAINT sort_by_check CHECK (sort_by IN ('name', 'lastUpdated', 'createdAt', 'usage')),
ADD CONSTRAINT sort_direction_check CHECK (sort_direction IN ('asc', 'desc'));
