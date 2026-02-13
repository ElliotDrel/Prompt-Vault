-- Phase 11: Database Schema for Public Prompt Library
-- Creates visibility enum, updates prompts table, creates saved_prompts table,
-- adds fork tracking, and updates user_settings

-- ============================================================================
-- Task 1: Create visibility enum type and add to prompts table
-- ============================================================================

-- Create enum type for prompt visibility
CREATE TYPE public.prompt_visibility AS ENUM ('private', 'public');

-- Add visibility column to prompts table with default 'private'
-- All existing prompts will be private by default
ALTER TABLE public.prompts
ADD COLUMN visibility public.prompt_visibility NOT NULL DEFAULT 'private';

-- Create index for efficient public prompt queries
CREATE INDEX idx_prompts_visibility ON public.prompts(visibility);

-- ============================================================================
-- Task 2: Update prompts RLS for public visibility
-- ============================================================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;

-- Create new SELECT policy: own prompts OR public prompts (authenticated users only)
CREATE POLICY "Users can view own or public prompts"
ON public.prompts FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR visibility = 'public'
);

-- Note: INSERT/UPDATE/DELETE policies remain unchanged (user_id = auth.uid())
-- This means users can only modify their own prompts, even if they can view public ones

-- ============================================================================
-- Task 3: Create saved_prompts table for live-linked references
-- ============================================================================

-- Create saved_prompts table (junction table for "Add to Vault" feature)
CREATE TABLE public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate saves (user can only save a prompt once)
  UNIQUE(user_id, source_prompt_id)
);

-- Enable RLS
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_prompts
CREATE POLICY "Users can view own saved prompts"
ON public.saved_prompts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can save prompts"
ON public.saved_prompts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave prompts"
ON public.saved_prompts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Indexes for saved_prompts
CREATE INDEX idx_saved_prompts_user_id ON public.saved_prompts(user_id);
CREATE INDEX idx_saved_prompts_source_prompt_id ON public.saved_prompts(source_prompt_id);

-- Grant permissions
GRANT ALL ON public.saved_prompts TO authenticated;

-- ============================================================================
-- Task 4: Add fork tracking to prompts table
-- ============================================================================

-- Add forked_from_prompt_id column (nullable - most prompts aren't forks)
-- ON DELETE SET NULL: if original prompt is deleted, fork becomes independent
ALTER TABLE public.prompts
ADD COLUMN forked_from_prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL;

-- Partial index for finding forks of a prompt (only indexes non-null values)
CREATE INDEX idx_prompts_forked_from ON public.prompts(forked_from_prompt_id)
WHERE forked_from_prompt_id IS NOT NULL;

-- Add documentation comment
COMMENT ON COLUMN public.prompts.forked_from_prompt_id IS
'UUID of the original prompt this was forked from. NULL for original prompts. SET NULL on source deletion (fork becomes independent).';

-- ============================================================================
-- Task 5: Add default visibility to user_settings
-- ============================================================================

-- Add default_visibility column to user_settings
-- Users can set their preferred visibility for new prompts
ALTER TABLE public.user_settings
ADD COLUMN default_visibility public.prompt_visibility NOT NULL DEFAULT 'private';
