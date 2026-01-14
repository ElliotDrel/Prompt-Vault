-- Fix example prompts content:
-- 1. Correct variable syntax from {{variable}} to {variable}
-- 2. Remove false claim about "-optional" suffix
-- 3. Update image prompt with better title and content

-- Drop and recreate the function with corrected content
CREATE OR REPLACE FUNCTION public.initialize_example_prompts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_welcome_id UUID;
    v_developer_id UUID;
    v_productivity_id UUID;
    v_image_id UUID;
    v_now TIMESTAMPTZ := NOW();
    v_one_minute_ago TIMESTAMPTZ := NOW() - INTERVAL '1 minute';

    -- Welcome prompt content (FIXED: single curly braces, removed false -optional claim)
    v_welcome_title TEXT := 'Welcome to Prompt Vault';
    v_welcome_body_v1 TEXT := 'Welcome to Prompt Vault!

This is Version 1 - it exists just to show you how version history works!

Click the clock icon on this prompt''s detail page to open the Version History panel. You''ll see both versions listed, and you can compare them to see what changed.

Head to Version 2 (the current version) for the actual platform guide.';
    v_welcome_body_v2 TEXT := 'Welcome to Prompt Vault - your personal prompt library!

## What is Prompt Vault?
A tool to save, organize, and reuse your AI prompts. Stop rewriting the same prompts - save them once, use them forever.

## Key Features

**Variables**
Use {variable_name} syntax to create dynamic prompts. When you copy, you''ll be prompted to fill in the values before the text is copied to your clipboard.

**Pinning**
Pin your most-used prompts to keep them at the top of your list. Click the pin icon on any prompt card.

**Copy with One Click**
Click the copy button to copy any prompt to your clipboard. Your usage is tracked automatically.

**Version History**
Every edit is saved. Click the clock icon to see past versions, compare changes, and revert if needed.

**Copy History**
See a history of all the prompts you''ve copied to your clipboard INCLUDING THE VARIABLE VALUES. Click the history icon in the navigation to see the list.

## Getting Started
1. Create new prompts with the + button
2. Try using {variables} in your prompts
3. Pin your favorites for quick access

Feel free to delete this welcome prompt once you''re familiar with the app!';

    -- Developer prompt content (unchanged)
    v_developer_title TEXT := 'Code Review for Uncommitted Changes';
    v_developer_body TEXT := '## Goal
Review all uncommitted code in the current branch. Analyze the changes for correctness, adherence to code standards, long-term stability, and alignment with requirements. Identify any issues that should be addressed before committing.

---

## Review Process

Examine all uncommitted changes and evaluate against these criteria:

1. **Correctness:** Are there bugs, logic errors, or unhandled edge cases? Does the code do what it''s supposed to do?

2. **Code Standards:** Does it follow the established rules, conventions, and patterns in this codebase? Are naming, structure, and style consistent?

3. **Stability:** Is this built for the long term? Are there fragile assumptions, tight coupling, or maintenance risks?

4. **Requirements Alignment:** Do the changes fully meet the intended requirements and plans? Is anything missing or only partially implemented?

---

## Output Format

Output a numbered list of ALL the issues found. For each issue:

**Issue [#]: [Brief descriptive title]**
- **Location:** Where in the code this occurs.
- **What I found:** Description of the problem or concern.
- **Why it matters:** Which criteria this violates and the potential impact.
- **Suggested fix:** How to address it.

If no issues are found, state that the changes look ready to commit.';

    -- Productivity prompt content (unchanged)
    v_productivity_title TEXT := 'AI Meeting Notes Generator';
    v_productivity_body TEXT := 'Generate comprehensive meeting notes from the following information.

## Meeting Transcript
{Transcript (Required)}

## People Present (Optional)
{People Present (Optional)}

## My Notes (Optional)
{My Notes (Optional)}

---

## Generate the Following

### Meeting Summary
A 2-3 sentence overview of what was discussed and decided.

### Key Decisions
- List each decision made during the meeting

### Action Items
| Owner | Task | Due Date |
|-------|------|----------|
| [Name] | [Action] | [Date if mentioned] |

### Discussion Points
- Main topics covered with brief context

### Key Takeaways
- Important insights or conclusions

### Next Steps
- Follow-up meetings or milestones mentioned

---

If people or notes weren''t provided, infer what you can from the transcript. Focus on extracting actionable information.';
    v_productivity_vars JSONB := '["Transcript (Required)", "People Present (Optional)", "My Notes (Optional)"]'::jsonb;

    -- Image prompt content (NEW: better title and more versatile prompt)
    v_image_title TEXT := 'Cinematic Scene Generator';
    v_image_body TEXT := 'A cinematic wide-angle shot with dramatic lighting and rich atmosphere. The scene features bold composition with strong foreground, midground, and background elements creating visual depth. Golden hour sunlight casts long shadows and warm highlights across the environment. Shot on ARRI Alexa with anamorphic lens, slight lens flare, film grain texture. Color graded with teal and orange tones. Volumetric fog adds atmosphere and depth. Ultra-detailed, 8K resolution, photorealistic, award-winning cinematography.';

BEGIN
    -- Insert Welcome prompt (pinned, with v2 content)
    INSERT INTO public.prompts (user_id, title, body, variables, is_pinned, times_used, created_at, updated_at)
    VALUES (NEW.id, v_welcome_title, v_welcome_body_v2, '[]'::jsonb, true, 0, v_now, v_now)
    RETURNING id INTO v_welcome_id;

    -- Create version 1 for Welcome (older timestamp)
    INSERT INTO public.prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
    VALUES (v_welcome_id, NEW.id, 1, v_welcome_title, v_welcome_body_v1, '[]'::jsonb, v_one_minute_ago);

    -- Create version 2 for Welcome (current timestamp)
    INSERT INTO public.prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
    VALUES (v_welcome_id, NEW.id, 2, v_welcome_title, v_welcome_body_v2, '[]'::jsonb, v_now);

    -- Insert Developer prompt (not pinned)
    INSERT INTO public.prompts (user_id, title, body, variables, is_pinned, times_used, created_at, updated_at)
    VALUES (NEW.id, v_developer_title, v_developer_body, '[]'::jsonb, false, 0, v_now, v_now)
    RETURNING id INTO v_developer_id;

    -- Create version 1 for Developer
    INSERT INTO public.prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
    VALUES (v_developer_id, NEW.id, 1, v_developer_title, v_developer_body, '[]'::jsonb, v_now);

    -- Insert Productivity prompt (with variables)
    INSERT INTO public.prompts (user_id, title, body, variables, is_pinned, times_used, created_at, updated_at)
    VALUES (NEW.id, v_productivity_title, v_productivity_body, v_productivity_vars, false, 0, v_now, v_now)
    RETURNING id INTO v_productivity_id;

    -- Create version 1 for Productivity
    INSERT INTO public.prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
    VALUES (v_productivity_id, NEW.id, 1, v_productivity_title, v_productivity_body, v_productivity_vars, v_now);

    -- Insert Image prompt
    INSERT INTO public.prompts (user_id, title, body, variables, is_pinned, times_used, created_at, updated_at)
    VALUES (NEW.id, v_image_title, v_image_body, '[]'::jsonb, false, 0, v_now, v_now)
    RETURNING id INTO v_image_id;

    -- Create version 1 for Image
    INSERT INTO public.prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
    VALUES (v_image_id, NEW.id, 1, v_image_title, v_image_body, '[]'::jsonb, v_now);

    RETURN NEW;
END;
$$;

-- Update comment
COMMENT ON FUNCTION public.initialize_example_prompts() IS 'Creates 4 example prompts for new users: Welcome (pinned, 2 versions), Developer, Productivity (with variables), and Cinematic Scene Generator. Runs automatically on user signup.';
