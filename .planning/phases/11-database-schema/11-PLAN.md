# Phase 11: Database Schema - PLAN

**Phase**: 11 - Database Schema
**Milestone**: v2.0 Public Prompt Library
**Created**: 2026-01-16
**Status**: Ready for execution

---

## Objective

Create the foundational database schema for the Public Prompt Library feature, including:
- Visibility enum and column on prompts table
- saved_prompts table for live-linked references to public prompts
- Fork tracking on prompts table
- Default visibility preference in user_settings

## Execution Context

**Files to reference:**
- `supabase/migrations/` - Existing migration patterns
- `src/types/supabase-generated.ts` - Current generated types
- `src/lib/storage/types.ts` - Storage adapter interfaces

**Project configuration:**
- Project ref: `hupdhjdasqgfcabaiiwa`
- Remote-only workflow: `npx supabase db push` to apply migrations

## Context

**Existing Schema (from v1.0):**
- `prompts` table: id, user_id, title, body, variables, is_pinned, times_used, created_at, updated_at
- `prompt_versions` table: version history with immutable snapshots
- `copy_events` table: usage tracking
- `user_settings` table: user_id, time_saved_multiplier, created_at, updated_at

**Data Model Decisions:**
1. **Visibility**: Enum type with 'public'/'private' values (extensible for future 'unlisted')
2. **saved_prompts**: Separate junction table (not column on prompts) to track live-linked references
3. **forked_from**: Column on prompts table - forks are independent copies, not live-linked
4. **RLS**: Public prompts visible to all authenticated users; saved_prompts only to owner

**Downstream Dependencies:**
- Phase 14 (Visibility Toggle) needs: visibility column, RLS policies
- Phase 15 (Public Library Page) needs: visibility column for queries
- Phase 16 (Add to Vault) needs: saved_prompts table
- Phase 17 (Fork) needs: forked_from_prompt_id column

---

## Tasks

### Task 1: Create visibility enum type

**Goal**: Create PostgreSQL enum for prompt visibility states

**Implementation:**
```sql
-- Create enum type
CREATE TYPE public.prompt_visibility AS ENUM ('private', 'public');

-- Add column to prompts table with default 'private'
ALTER TABLE public.prompts
ADD COLUMN visibility public.prompt_visibility NOT NULL DEFAULT 'private';

-- Create index for efficient public prompt queries
CREATE INDEX idx_prompts_visibility ON public.prompts(visibility);
```

**Verification:**
- [ ] Enum type exists in database
- [ ] All existing prompts have visibility = 'private'
- [ ] Index created on visibility column

---

### Task 2: Update prompts RLS for public visibility

**Goal**: Allow users to read public prompts from other users while maintaining full control of their own

**Implementation:**
```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own prompts" ON public.prompts;

-- Create new SELECT policy: own prompts OR public prompts
CREATE POLICY "Users can view own or public prompts"
ON public.prompts FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR visibility = 'public'
);

-- INSERT/UPDATE/DELETE policies remain unchanged (user_id = auth.uid())
```

**Verification:**
- [ ] User can see their own private prompts
- [ ] User can see other users' public prompts
- [ ] User cannot see other users' private prompts
- [ ] User can only modify their own prompts

---

### Task 3: Create saved_prompts table

**Goal**: Table for tracking live-linked references when users "Add to Vault"

**Implementation:**
```sql
-- Create saved_prompts table
CREATE TABLE public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate saves
  UNIQUE(user_id, source_prompt_id)
);

-- Enable RLS
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_saved_prompts_user_id ON public.saved_prompts(user_id);
CREATE INDEX idx_saved_prompts_source_prompt_id ON public.saved_prompts(source_prompt_id);
```

**Verification:**
- [ ] Table created with correct columns
- [ ] RLS enabled and policies active
- [ ] Cannot save same prompt twice (unique constraint)
- [ ] Cascade delete works (saved entry removed when source deleted)

---

### Task 4: Add fork tracking to prompts table

**Goal**: Track which prompt a forked prompt was created from

**Implementation:**
```sql
-- Add forked_from column (nullable - most prompts aren't forks)
ALTER TABLE public.prompts
ADD COLUMN forked_from_prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL;

-- Index for finding forks of a prompt
CREATE INDEX idx_prompts_forked_from ON public.prompts(forked_from_prompt_id)
WHERE forked_from_prompt_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.prompts.forked_from_prompt_id IS
'UUID of the original prompt this was forked from. NULL for original prompts. SET NULL on source deletion (fork becomes independent).';
```

**Verification:**
- [ ] Column added with correct FK constraint
- [ ] ON DELETE SET NULL preserves forks when original deleted
- [ ] Index created for efficient fork queries

---

### Task 5: Add default visibility to user_settings

**Goal**: Allow users to set their default visibility for new prompts

**Implementation:**
```sql
-- Add default_visibility column
ALTER TABLE public.user_settings
ADD COLUMN default_visibility public.prompt_visibility NOT NULL DEFAULT 'private';
```

**Verification:**
- [ ] Column added with default 'private'
- [ ] Existing user_settings rows get default value

---

### Task 6: Regenerate TypeScript types

**Goal**: Update generated types to include new schema

**Implementation:**
```powershell
npx supabase gen types typescript --linked --schema public | Out-File -Encoding utf8 src/types/supabase-generated.ts
```

**Verification:**
- [ ] `prompt_visibility` enum type present
- [ ] `prompts` type includes `visibility` and `forked_from_prompt_id`
- [ ] `saved_prompts` table type present
- [ ] `user_settings` type includes `default_visibility`
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

## Verification

**Database verification:**
```sql
-- Check enum exists
SELECT typname FROM pg_type WHERE typname = 'prompt_visibility';

-- Check prompts columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'prompts' AND column_name IN ('visibility', 'forked_from_prompt_id');

-- Check saved_prompts table
SELECT * FROM information_schema.tables WHERE table_name = 'saved_prompts';

-- Check user_settings column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_settings' AND column_name = 'default_visibility';

-- Check RLS policies
SELECT policyname FROM pg_policies WHERE tablename = 'prompts';
SELECT policyname FROM pg_policies WHERE tablename = 'saved_prompts';
```

**Application verification:**
- [ ] `npm run lint` - No type errors
- [ ] `npm run build` - Successful build
- [ ] Existing functionality unchanged (regression check)

---

## Success Criteria

1. **Schema complete**: All tables, columns, constraints, and indexes created
2. **Types updated**: TypeScript types regenerated and valid
3. **RLS secure**: Policies enforce proper access control
4. **Backward compatible**: Existing prompts remain private, existing features work
5. **Build passes**: No lint or build errors

---

## Output

**Created:**
- Migration file: `supabase/migrations/YYYYMMDDHHMMSS_public_prompt_library_schema.sql`
- Updated types: `src/types/supabase-generated.ts`

**Next phase**: Phase 12 (Type Extensions) - Add TypeScript interfaces for new tables

---

## Notes

**Design Decisions:**
- Using enum for visibility (vs boolean) allows future 'unlisted' state
- `saved_prompts` as separate table (vs column) supports proper junction relationship
- `ON DELETE CASCADE` for saved_prompts (saved entry meaningless without source)
- `ON DELETE SET NULL` for forks (fork becomes independent original)
- Partial index on forked_from (most rows are NULL, saves space)

**Security Considerations:**
- Public prompts readable by all authenticated users
- Only owner can modify their prompts (even public ones)
- saved_prompts only visible to owner who saved them
