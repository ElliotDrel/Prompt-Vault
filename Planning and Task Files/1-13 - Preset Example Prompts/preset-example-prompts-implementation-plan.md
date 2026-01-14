# Implementation Plan: Preset Example Prompts for New Users

## Overview
Create a database trigger that automatically inserts 3 example prompts when a new user signs up. These prompts are **regular prompts** with no special treatment - they can be edited, deleted, pinned/unpinned, and versioned exactly like user-created prompts.

## Requirements Summary
- **Trigger**: Supabase Auth trigger on new user creation
- **Target**: New users only (created after deployment)
- **Count**: 3 example prompts
- **Types**:
  1. Developer/coding prompt (with variables, pre-pinned)
  2. Productivity prompt (no variables)
  3. Image generation prompt (no variables)
- **Features showcased**: Variables, pinning, version history, copy stats
- **Behavior**: Identical to regular prompts (fully editable, deletable)
- **Content**: Draft during implementation (after plan approval)

## Architecture Analysis

### Existing Pattern: `initialize_user_settings()`
The codebase already has a proven pattern for auto-initializing user data:
- Migration: `20260104000001_create_user_settings_table.sql`
- Trigger: `on_auth_user_created` → `initialize_user_settings()`
- Executes: `AFTER INSERT ON auth.users`
- Uses: `SECURITY DEFINER` to bypass RLS
- Pattern: `INSERT INTO ... VALUES (NEW.id, ...) ON CONFLICT DO NOTHING`

### Database Schema
**Prompts table** (`20241028000001_create_prompts_table.sql`):
```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Version creation RPC** (`20260111154355_create_prompt_version_rpc.sql`):
```sql
CREATE OR REPLACE FUNCTION create_prompt_version(
    p_prompt_id UUID,
    p_version_number INTEGER,
    p_title TEXT,
    p_body TEXT,
    p_variables JSONB
) RETURNS TABLE (...)
```

### Key Constraints
1. **Required fields**: `title`, `body`, `user_id`
2. **RLS policies**: Users can only access their own prompts (`auth.uid() = user_id`)
3. **Version tracking**: Every prompt needs a version 1 snapshot via `create_prompt_version()`
4. **Idempotency**: Use `ON CONFLICT` or check for existing prompts

## Implementation Plan

### Step 1: Create Migration File
**File**: `supabase/migrations/<timestamp>_initialize_example_prompts.sql`

Create a new migration that follows the existing `initialize_user_settings()` pattern.

### Step 2: Define Trigger Function
**Function**: `initialize_example_prompts()`

```sql
CREATE OR REPLACE FUNCTION initialize_example_prompts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_prompt_1_id UUID;
    v_prompt_2_id UUID;
    v_prompt_3_id UUID;
BEGIN
    -- Insert Prompt 1: Developer (with variables, pre-pinned)
    INSERT INTO prompts (user_id, title, body, variables, is_pinned, times_used)
    VALUES (
        NEW.id,
        'Code Review Request',  -- placeholder, to be replaced with final content
        'Please review...',     -- placeholder
        '["language", "feature"]'::jsonb,
        true,  -- pre-pinned
        0
    )
    RETURNING id INTO v_prompt_1_id;

    -- Create version 1 for prompt 1
    PERFORM create_prompt_version(
        v_prompt_1_id,
        1,
        'Code Review Request',
        'Please review...',
        '["language", "feature"]'::jsonb
    );

    -- Insert Prompt 2: Productivity (no variables)
    INSERT INTO prompts (user_id, title, body, variables, is_pinned, times_used)
    VALUES (
        NEW.id,
        'Email Template',       -- placeholder
        'Dear team...',         -- placeholder
        '[]'::jsonb,
        false,
        0
    )
    RETURNING id INTO v_prompt_2_id;

    -- Create version 1 for prompt 2
    PERFORM create_prompt_version(
        v_prompt_2_id,
        1,
        'Email Template',
        'Dear team...',
        '[]'::jsonb
    );

    -- Insert Prompt 3: Image Generation (no variables)
    INSERT INTO prompts (user_id, title, body, variables, is_pinned, times_used)
    VALUES (
        NEW.id,
        'AI Image Prompt',      -- placeholder
        'Generate an image...', -- placeholder
        '[]'::jsonb,
        false,
        0
    )
    RETURNING id INTO v_prompt_3_id;

    -- Create version 1 for prompt 3
    PERFORM create_prompt_version(
        v_prompt_3_id,
        1,
        'AI Image Prompt',
        'Generate an image...',
        '[]'::jsonb
    );

    RETURN NEW;
END;
$$;
```

**Key Implementation Details**:
- `SECURITY DEFINER`: Bypasses RLS (required for trigger context)
- `SET search_path = public`: Security best practice
- `RETURNING id INTO v_prompt_X_id`: Capture generated UUIDs
- `PERFORM create_prompt_version()`: Create version 1 snapshots
- `RETURN NEW`: Required for AFTER INSERT triggers

### Step 3: Attach Trigger to auth.users
```sql
CREATE TRIGGER on_auth_user_created_example_prompts
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_example_prompts();
```

**Trigger naming**: Use descriptive name to distinguish from existing `on_auth_user_created` trigger (Postgres allows multiple triggers on same event).

### Step 4: Add Idempotency Check (Optional)
To prevent duplicate initialization if trigger fires multiple times:

```sql
-- Check if user already has prompts before inserting
IF EXISTS (SELECT 1 FROM prompts WHERE user_id = NEW.id LIMIT 1) THEN
    RETURN NEW;
END IF;
```

**Decision**: Skip this check for initial implementation since:
- New users won't have existing prompts
- `AFTER INSERT ON auth.users` only fires once per user creation
- Adds unnecessary complexity

### Step 5: Content Creation
After plan approval, draft the 3 example prompts with:

**Prompt 1 (Developer, pinned, with variables)**:
- Title: Something like "Code Review Request" or "Debug Analysis"
- Body: Demonstrates `{{language}}`, `{{feature}}` variables
- Educational content: Mentions variable substitution, pinning feature
- Use case: Practical developer workflow

**Prompt 2 (Productivity, no variables)**:
- Title: Something like "Meeting Notes Template" or "Email Draft"
- Body: Simple copy-paste template
- Educational content: Mentions copy history, time-saved tracking
- Use case: General professional productivity

**Prompt 3 (Image Generation, no variables)**:
- Title: Something like "AI Image Prompt" or "DALL-E Template"
- Body: Example prompt for image generation
- Educational content: Mentions version history, prompt iteration
- Use case: Creative/AI content generation

### Step 6: Testing Strategy

**Manual Testing Checklist**:
1. ✅ Create a new user via Google OAuth
2. ✅ Create a new user via magic link email
3. ✅ Verify 3 prompts appear immediately in dashboard
4. ✅ Verify developer prompt is pre-pinned
5. ✅ Verify developer prompt has variables detected
6. ✅ Verify all prompts have version 1 in version history
7. ✅ Test editing example prompt → verify version 2 created
8. ✅ Test deleting example prompt → verify successful deletion
9. ✅ Test copying example prompt → verify copy history tracked
10. ✅ Test pinning/unpinning → verify toggle works
11. ✅ Verify existing users are unaffected (no new prompts)

**Database Verification**:
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_example_prompts';

-- Test with new user (after signup)
SELECT id, user_id, title, is_pinned, variables
FROM prompts
WHERE user_id = '<new_user_id>'
ORDER BY created_at;

-- Verify version 1 snapshots exist
SELECT pv.prompt_id, pv.version_number, pv.title
FROM prompt_versions pv
JOIN prompts p ON p.id = pv.prompt_id
WHERE p.user_id = '<new_user_id>'
ORDER BY pv.prompt_id, pv.version_number;
```

## Critical Implementation Notes

### 1. User ID Handling
- **Trigger context**: Use `NEW.id` (the newly created user's ID)
- **RLS bypass**: `SECURITY DEFINER` required since trigger doesn't have `auth.uid()` context
- **Version creation**: RPC function validates ownership internally (safe to call from trigger)

### 2. Version Snapshot Creation
- **Timing**: Create version 1 immediately after prompt insertion
- **Method**: Use `PERFORM create_prompt_version()` (not `SELECT create_prompt_version()`)
- **Data consistency**: Title, body, variables must match between prompt and version

### 3. Content Duplication
Since title/body/variables appear twice (prompt INSERT + version RPC), consider:
- **Option A**: Inline literals (current plan) - simpler but duplicated
- **Option B**: Use variables to store content once - cleaner but more complex

```sql
DECLARE
    v_title_1 TEXT := 'Code Review Request';
    v_body_1 TEXT := 'Please review...';
    v_vars_1 JSONB := '["language", "feature"]'::jsonb;
BEGIN
    INSERT INTO prompts (...) VALUES (NEW.id, v_title_1, v_body_1, v_vars_1, true, 0)
    RETURNING id INTO v_prompt_1_id;

    PERFORM create_prompt_version(v_prompt_1_id, 1, v_title_1, v_body_1, v_vars_1);
END;
```

**Recommendation**: Use Option B (variables) to avoid content drift between prompts and versions.

### 4. Migration Rollback
Since this is an `AFTER INSERT` trigger on `auth.users`, rollback considerations:
- **Trigger removal**: `DROP TRIGGER IF EXISTS on_auth_user_created_example_prompts ON auth.users;`
- **Function removal**: `DROP FUNCTION IF EXISTS initialize_example_prompts();`
- **Data cleanup**: Not needed - existing example prompts can remain (users can delete them)

### 5. Future Content Updates
If example prompts need updating after deployment:
- **Cannot modify existing user prompts** (they own them now)
- **New users get updated prompts** (edit migration function)
- **Migration naming**: Use new timestamp, keep function name same

## Files to Modify

### New Files
- `supabase/migrations/<timestamp>_initialize_example_prompts.sql` - Main migration

### Verification Files (no changes)
- `supabase/migrations/20260104000001_create_user_settings_table.sql` - Reference pattern
- `supabase/migrations/20241028000001_create_prompts_table.sql` - Schema reference
- `supabase/migrations/20260111154355_create_prompt_version_rpc.sql` - RPC reference

### Testing Entry Points
- Dashboard component will automatically display example prompts via existing context
- No frontend code changes required
- Example prompts appear as regular prompts in `PromptsContext`

## Deployment Steps

1. **Create migration file** with timestamp: `npx supabase migration new initialize_example_prompts`
2. **Write trigger function** with final content (after drafting prompts)
3. **Test locally** by creating test user and verifying prompts appear
4. **Apply to remote**: `npx supabase db push`
5. **Verify deployment**: Create new test user via OAuth/magic link
6. **Monitor**: Check Supabase logs for any trigger errors

## Success Criteria

✅ New users automatically receive 3 example prompts on signup
✅ Example prompts are indistinguishable from regular prompts (no special flags/styling)
✅ Developer prompt is pre-pinned
✅ Developer prompt has variables auto-detected
✅ All prompts have version 1 in history
✅ Users can edit, delete, copy example prompts without restrictions
✅ Existing users are unaffected
✅ Trigger executes successfully for both OAuth and magic link signups
✅ No console errors or failed database operations

## Open Questions / Decisions Made

- ✅ **Trigger vs Frontend**: Database trigger (matches existing pattern)
- ✅ **Existing users**: No backfill (new users only)
- ✅ **Deletable**: Yes, fully deletable like regular prompts
- ✅ **Visual indicators**: None (regular prompts)
- ✅ **Content timing**: Draft after plan approval
- ✅ **Idempotency**: Not needed (trigger fires once per user)
- ⏳ **Final prompt content**: To be drafted during implementation

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Trigger fails silently | Users get no prompts | Add error handling, log to Supabase logs |
| Content/version mismatch | Version history shows wrong content | Use variables to store content once |
| RLS blocks version creation | No version 1 created | Use `SECURITY DEFINER` + `PERFORM` |
| Large prompt bodies | Migration file too large | Keep prompt bodies concise (<500 chars) |
| Future content updates | Can't update existing users | Document that updates only affect new users |

## Next Steps

1. Get plan approval
2. Draft the 3 example prompt contents (title + body for each)
3. Create migration file with final content
4. Test with new user signup
5. Deploy to remote database
6. Verify with production test account
