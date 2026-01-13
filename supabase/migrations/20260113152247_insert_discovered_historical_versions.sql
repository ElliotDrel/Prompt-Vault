-- Migration: Insert Discovered Historical Versions from Copy Events
-- Source: Phase 8.1 version history discovery (DISCOVERED-VERSIONS-FINAL.md)
-- Date: 2026-01-13
--
-- This migration:
-- 1. Updates existing v1 entries (current prompt state) to new highest version numbers
-- 2. Inserts discovered historical versions starting at 1
--
-- Version numbering strategy:
-- - Discovered versions: 1, 2, 3, ... N (oldest to newest)
-- - Existing backfill (current state): N+1 (becomes highest version)
--
-- User ID: a39a8008-3fb2-4f56-b336-c08f082ff670

BEGIN;

-- ============================================
-- PART 1: Renumber existing v1 entries to highest version
-- For each prompt, existing v1 (current state) becomes (discovered_count + 1)
-- ============================================

-- 1. Clear, Install, Build, Everything Else, and Dev (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = '2f1b06b6-956f-4e26-a7f6-4efbd560fa56' AND version_number = 1;

-- 2. Implement Features Step by Step for CC based on plan (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = 'd13b8a53-78a9-402a-9be8-b228d08bcf58' AND version_number = 1;

-- 3. Commit Update Chunks to GIT (6 discovered -> existing becomes v7)
UPDATE prompt_versions SET version_number = 7
WHERE prompt_id = '2f73cbba-edce-40f4-9634-b03cedf25961' AND version_number = 1;

-- 4. Make Changes After Code Review (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = '2b9ec168-8386-4b00-b158-aaba564ef999' AND version_number = 1;

-- 5. Code Review for Uncommitted Changes (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = 'e3af62de-5fe0-4e36-b1b7-e21a51c9889f' AND version_number = 1;

-- 6. Identify Status and Next Steps from Plan (8 discovered -> existing becomes v9)
UPDATE prompt_versions SET version_number = 9
WHERE prompt_id = '1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1' AND version_number = 1;

-- 7. V1 - PR Comment Review (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = '80996ca1-6b87-4af9-a9e5-56bb127e21ee' AND version_number = 1;

-- 8. Create an Implementation Plan based on planning files - Claude Code (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = '7c2bdfed-a78a-49ee-8809-ccf043f6f44d' AND version_number = 1;

-- 9. Make MGMT 352 Lecture Title in granola - School (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = '53d0fce3-0b84-4c5d-a782-4840ad26bea0' AND version_number = 1;

-- 10. v2.1 - 2 lecture create comprehensive notes (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = 'c7c90b6d-fa70-4c2e-a7d8-a0556aed77cc' AND version_number = 1;

-- 11. Granola Meeting Notes Title Generation (4 discovered -> existing becomes v5)
UPDATE prompt_versions SET version_number = 5
WHERE prompt_id = '937a7e7a-6538-430e-b6cc-249d9885900d' AND version_number = 1;

-- 12. v1 - adding a new feature idea (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = 'aaf2dd8d-4db0-4740-b599-5cf6c816eb92' AND version_number = 1;

-- 13. Make ECON 252 transcript title - school (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = '011cd1a6-7153-4725-845d-b9ab4b417ad6' AND version_number = 1;

-- 14. Create List of Missing Topics from my notes - school (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = '9b30ba85-9d1b-4b23-9407-97bca34c3c5f' AND version_number = 1;

-- 15. Review Plan (3 discovered -> existing becomes v4)
UPDATE prompt_versions SET version_number = 4
WHERE prompt_id = 'a64d3819-feca-4798-be4e-ddb10dee2576' AND version_number = 1;

-- 16. MGMT 306 HW Problem Teaching / Walkthrough - school (5 discovered -> existing becomes v6)
UPDATE prompt_versions SET version_number = 6
WHERE prompt_id = '68fe9309-2e62-44d0-b981-656aee7ec2c4' AND version_number = 1;

-- 17. /PR Comments to XML - Claude Code Command (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = 'cd9b776e-18c6-4877-bfa1-be099fd4c5dc' AND version_number = 1;

-- 18. v2 - create comprehensive notes - school (4 discovered -> existing becomes v5)
UPDATE prompt_versions SET version_number = 5
WHERE prompt_id = '1d9dccb9-f8a4-4c0d-b7f1-03153347704c' AND version_number = 1;

-- 19. v3 - 2 lecture create comprehensive notes - school (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = '974159fb-f71b-418b-bfc8-a682bfba4c21' AND version_number = 1;

-- 20. new project claude planning prompt (NEED TO FINISH IT) (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = '35792ba0-fbf3-4a36-be99-78ce16064088' AND version_number = 1;

-- 21. Create a Features and Function File based on planning files (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = '34abb60d-1248-448e-a295-0e4e6d542e38' AND version_number = 1;

-- 22. ChatGPT School Project Instructions - school (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = 'e4dc2a81-1e49-4d1e-8fec-3013cce420df' AND version_number = 1;

-- 23. v1 - create comprehensive notes - school (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = 'd2732e54-70ae-4197-ba91-aaab8c4ac5e0' AND version_number = 1;

-- 24. Better ChatGPT Titles (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = 'f5f0cc99-7291-4208-9b9e-a173adbaafa2' AND version_number = 1;

-- 25. buildpurdue long form content (2 discovered -> existing becomes v3)
UPDATE prompt_versions SET version_number = 3
WHERE prompt_id = '590d513e-3514-4d37-90a3-816c5a9d77ed' AND version_number = 1;

-- 26. Generate Interview Clip Social Posts (BuildPurdue) (1 discovered -> existing becomes v2)
UPDATE prompt_versions SET version_number = 2
WHERE prompt_id = 'a31fca67-8d6a-415c-a562-a4e9e0faf39f' AND version_number = 1;


-- ============================================
-- PART 2: Insert discovered historical versions (starting at v1)
-- ============================================

-- ----------------------------------------
-- 1. Clear, Install, Build, Everything Else, and Dev (3 versions: v1, v2, v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('2f1b06b6-956f-4e26-a7f6-4efbd560fa56', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Clear, Install, Build, Everything Else, and Dev',
 $body$clear; echo "Results for running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev$body$,
 '[]'::jsonb, '2025-09-29T14:03:13+00'::timestamptz),

('2f1b06b6-956f-4e26-a7f6-4efbd560fa56', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Clear, Install, Build, Everything Else, and Dev',
 $body$clear; echo "Results from running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev$body$,
 '[]'::jsonb, '2025-11-07T18:39:10+00'::timestamptz),

('2f1b06b6-956f-4e26-a7f6-4efbd560fa56', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Clear, Install, Build, Everything Else, and Dev',
 $body$clear; echo "Results from running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run ci; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run ci; npm run dev$body$,
 '[]'::jsonb, '2025-11-07T20:05:44+00'::timestamptz);

-- ----------------------------------------
-- 2. Implement Features Step by Step for CC based on plan (2 versions: v1, v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('d13b8a53-78a9-402a-9be8-b228d08bcf58', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Implement Features Step by Step  for CC',
 $body$Based on the following plan implement the features step by step. Before starting on a task clearly articulate what the intended feature and functionality is. Then deep think about the best way to implement the following feature in the most effective way and best way for long term stability. Only then make the needed changes.$body$,
 '[]'::jsonb, '2025-09-29T13:06:07+00'::timestamptz),

('d13b8a53-78a9-402a-9be8-b228d08bcf58', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Implement Features Step by Step for CC based on plan',
 $body$Based on the following plan implement the features step by step. Before starting on a task clearly articulate what the intended feature and functionality is. Then deep think about the best way to implement the following feature in the most effective way and best way for long term stability. Only then make the needed changes.$body$,
 '[]'::jsonb, '2026-01-07T15:01:59+00'::timestamptz);

-- ----------------------------------------
-- 3. Commit Update Chunks to GIT (6 versions: v1-v6)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Commit Update Chunks to GIT',
 $body$Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to properly make the im-tns work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. Finally, commit these commit groups one by one.$body$,
 '[]'::jsonb, '2025-09-29T22:54:38+00'::timestamptz),

('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Commit Update Chunks to GIT',
 $body$Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, commit these commit groups one by one.$body$,
 '[]'::jsonb, '2025-11-05T05:01:58+00'::timestamptz),

('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Commit Update Chunks to GIT',
 $body$Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why) that follows the same style and format as the previous commits. Finally, commit these commit groups one by one.$body$,
 '[]'::jsonb, '2025-11-05T05:03:38+00'::timestamptz),

('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 4,
 'Commit Update Chunks to GIT',
 $body$Identify which files you made changes to in this chat or have not committed. Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide context to the reader to identify the reasoning behind the change (what, how, and why) and follow the same style and format as the previous commits. Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT.$body$,
 '[]'::jsonb, '2025-11-05T19:49:48+00'::timestamptz),

('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 5,
 'Commit Update Chunks to GIT',
 $body$Identify which files you made changes to in this chat or are still uncommitted. Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide context to the reader to identify the reasoning behind the change (what, how, and why) and follow the same style and format as the previous commits. Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT.$body$,
 '[]'::jsonb, '2025-12-26T21:10:34+00'::timestamptz),

('2f73cbba-edce-40f4-9634-b03cedf25961', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 6,
 'Commit Update Chunks to GIT',
 $body$Identify which files you made changes to in this chat or are still uncommitted (get minimum last 5 commit messages to use as reference). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide context to the reader to identify the reasoning behind the change (what, how, and why) and follow the same style and format as the previous commits. Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT.$body$,
 '[]'::jsonb, '2025-12-29T17:41:32+00'::timestamptz);

-- ----------------------------------------
-- 4. Make Changes After Code Review (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('2b9ec168-8386-4b00-b158-aaba564ef999', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'make code review changes (codex) - after code review',
 $body$Based on the findings of your code review, make the needed changes to correct all the issues that you have identified. Ensure that before making a change, you fully think through the best and most optimal way to fix this change for long-term stability and adherence to all code rules and best coding practices.$body$,
 '[]'::jsonb, '2025-09-29T13:49:02+00'::timestamptz),

('2b9ec168-8386-4b00-b158-aaba564ef999', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'make code review changes (codex) - after code review',
 $body$Based on the findings of your code review, make the needed changes to correct all the issues that you have identified. Before starting, verify that the issue is still present before fixing it. Also ensure that before making a change, you fully think through the best and most optimal way to fix this change for long-term stability and adherence to all code rules and best coding practices.$body$,
 '[]'::jsonb, '2025-11-20T19:25:02+00'::timestamptz),

('2b9ec168-8386-4b00-b158-aaba564ef999', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Make Changes After Code Review',
 $body$## Goal
Implement the approved changes from the code review. For each item, verify the issue still exists, design the optimal fix, then execute.

## Input
{{Comments To Implement}}

## Process
1. Read the comment
2. Verify the issue still exists
3. Design the optimal fix
4. Execute the fix
5. Verify the fix$body$,
 '["Comments To Implement"]'::jsonb, '2025-12-26T20:33:36+00'::timestamptz);

-- ----------------------------------------
-- 5. Code Review for Uncommitted Changes (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('e3af62de-5fe0-4e36-b1b7-e21a51c9889f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'code review - uncommited',
 $body$Code review time. Review all uncommited code. For each change made, review it for bugs, double-check that it follows all the code rules, ensure that it is optimized for long-term stability, and finally ensure that the changes have the intended effect on the codebase (fully meeting requirements and plans). Then output a comprehensive report outlining all changes made and your analysis of each.$body$,
 '[]'::jsonb, '2025-09-29T14:01:01+00'::timestamptz),

('e3af62de-5fe0-4e36-b1b7-e21a51c9889f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Code Review for Uncommitted Changes',
 $body$## Goal
Review all uncommitted code in the current branch.

## Review Process
1. **Correctness:** Check for bugs and logic errors
2. **Code Standards:** Ensure code follows all rules
3. **Stability:** Verify optimized for long-term stability
4. **Requirements Alignment:** Confirm changes meet requirements and plans

## Output Format
Output a numbered list of issues found with severity (Critical/Major/Minor/Suggestion).$body$,
 '[]'::jsonb, '2025-12-29T17:29:55+00'::timestamptz),

('e3af62de-5fe0-4e36-b1b7-e21a51c9889f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Code Review for Uncommitted Changes',
 $body$## Goal
Review all uncommitted code in the current branch.

## Review Process
1. **Correctness:** Check for bugs and logic errors
2. **Code Standards:** Ensure code follows all rules
3. **Stability:** Verify optimized for long-term stability
4. **Requirements Alignment:** Confirm changes meet requirements and plans

## Output Format
Output a numbered list of ALL the issues found with severity (Critical/Major/Minor/Suggestion).$body$,
 '[]'::jsonb, '2026-01-05T17:27:51+00'::timestamptz);

-- ----------------------------------------
-- 6. Identify Status and Next Steps from Plan (8 versions: v1-v8)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'IDENIFY CODEBASE STATUS AND NEXT STEP',
 $body$Based on the planning files what is the current state of the codebase and what is the next step?$body$,
 '[]'::jsonb, '2025-09-29T13:02:39+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Codebase Status and Identify Next Steps',
 $body$Based on the planning files what is the current state of the codebase and what is the next step?$body$,
 '[]'::jsonb, '2025-10-02T16:31:27+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning files what is the current state of the codebase and what is the next step? {{Planning File Names}}$body$,
 '["Planning File Names"]'::jsonb, '2025-10-02T16:32:45+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 4,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning files (@{planning file names}) what is the current state of the codebase and what is the next step?$body$,
 '["Planning File Names"]'::jsonb, '2025-10-16T14:55:10+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 5,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning files (@{{Planning File Names}}) what is the current state of the codebase and what is the next step?$body$,
 '["Planning File Names"]'::jsonb, '2025-10-17T11:22:10+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 6,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning files (@{{Planning File Names}}), what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually search, read, and explore to identify the current state.$body$,
 '["Planning File Names"]'::jsonb, '2025-11-08T03:15:53+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 7,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning files (@{{Planning File Names}}), what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually explore to identify the current state.$body$,
 '["Planning File Names"]'::jsonb, '2025-11-16T03:25:37+00'::timestamptz),

('1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 8,
 'Identify Status and Next Steps from Plan',
 $body$Based on the planning file named:"{{Planning File Name}}", what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually explore to identify the current state (use explore agent).$body$,
 '["Planning File Name"]'::jsonb, '2025-12-26T10:06:12+00'::timestamptz);

-- ----------------------------------------
-- 7. V1 - PR Comment Review (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('80996ca1-6b87-4af9-a9e5-56bb127e21ee', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'PR Comment Review - NEED TO UPDATE',
 $body$I had a few devs review my PR for this branch and they left some pretty detailed comments. Review the comments they left (attached below) and help me determine which to implement and which to disregard. For each comment, first articulate what issue it is identifying or what change it is suggesting to make, then review the codebase and explain what the current situation is. After that, make an analysis on whether or not the suggested change/suggestion is a good idea to implement (include reasoning and an explanation of why).$body$,
 '[]'::jsonb, '2025-10-04T02:43:15+00'::timestamptz),

('80996ca1-6b87-4af9-a9e5-56bb127e21ee', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'PR Comment Review - NEED TO UPDATE',
 $body$I had a few devs review my PR for this branch and they left some pretty detailed comments. Review the comments they left (attached below) and help me determine which to implement and which to disregard. For each comment, first articulate what issue it is identifying or what change it is suggesting to make, then review the codebase and explain what the current situation is. After that, make an analysis on whether or not the suggested change/suggestion is a good idea to implement (include reasoning and an explanation of why).

{{All Comments}}$body$,
 '["All Comments"]'::jsonb, '2025-10-16T14:38:46+00'::timestamptz);

-- ----------------------------------------
-- 8. Create an Implementation Plan based on planning files - Claude Code (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('7c2bdfed-a78a-49ee-8809-ccf043f6f44d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Create an Implementation Plan based on planning files - Claude Code',
 $body$Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files"

Requirements:
- Follow the exact format of existing implementation plans
- Include all necessary details
- Be comprehensive but concise$body$,
 '[]'::jsonb, '2025-10-16T22:32:57+00'::timestamptz),

('7c2bdfed-a78a-49ee-8809-ccf043f6f44d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Create an Implementation Plan based on planning files - Claude Code',
 $body$Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files"

**STEP 1 - BEFORE WRITING**
- Read all existing implementation plans
- Understand the format and style
- Identify key components

**STEP 2 - WHILE WRITING**
- Follow the exact format of existing implementation plans
- Include all necessary details
- Be comprehensive but concise$body$,
 '[]'::jsonb, '2025-11-19T13:13:03+00'::timestamptz),

('7c2bdfed-a78a-49ee-8809-ccf043f6f44d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Create an Implementation Plan based on planning files - Claude Code',
 $body$Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files"

**STEP 1 - BEFORE WRITING**
- Read all existing implementation plans (use your explore capability)
- Understand the format and style
- Identify key components

**STEP 2 - WHILE WRITING**
- Follow the exact format of existing implementation plans
- Include all necessary details
- Be comprehensive but concise$body$,
 '[]'::jsonb, '2025-12-25T16:02:04+00'::timestamptz);

-- ----------------------------------------
-- 9. Make MGMT 352 Lecture Title in granola - School (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('53d0fce3-0b84-4c5d-a782-4840ad26bea0', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Make MGMT 352 Lecture Title in granola - School',
 $body$Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}

Example Titles:
L4 - Lecture 4 - MGMT 352$body$,
 '["lecture number"]'::jsonb, '2025-10-23T12:47:04+00'::timestamptz),

('53d0fce3-0b84-4c5d-a782-4840ad26bea0', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Make MGMT 352 Lecture Title in granola - School',
 $body$Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}

The title TOTAL characters has to be UNDER 260 characters.

Example Titles:
L4 - Lecture 4 - MGMT 352$body$,
 '["lecture number"]'::jsonb, '2025-11-01T18:35:43+00'::timestamptz),

('53d0fce3-0b84-4c5d-a782-4840ad26bea0', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Make MGMT 352 Lecture Title in granola - School',
 $body$Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}

The title TOTAL characters has to be UNDER 160 characters.

Example Titles:
L4 - Lecture 4 - MGMT 352$body$,
 '["lecture number"]'::jsonb, '2025-11-18T01:38:57+00'::timestamptz);

-- ----------------------------------------
-- 10. v2.1 - 2 lecture create comprehensive notes (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('c7c90b6d-fa70-4c2e-a7d8-a0556aed77cc', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'v2.1 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - focus on transcript - school',
 $body$Create comprehensive notes for lectures {{Lecture Number 1}} and {{Lecture Number 2}}.

Reference Sources:
- {{Lecture 1 Transcript}}
- {{Lecture 1 Slides}}
- {{Lecture 2 Transcript}}$body$,
 '["Lecture Number 1", "Lecture Number 2", "Lecture 1 Transcript", "Lecture 1 Slides", "Lecture 2 Transcript"]'::jsonb, '2025-10-19T16:36:29+00'::timestamptz),

('c7c90b6d-fa70-4c2e-a7d8-a0556aed77cc', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'v2.1 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - focus on transcript - school',
 $body$Create comprehensive notes for lectures {{Lecture Number 1}} and {{Lecture Number 2}}.

Focus on topics that will be on the exam.

Reference Sources:
- {{Lecture 1 Transcript}}
- {{Lecture 1 Slides}}
- {{Lecture 2 Transcript}}$body$,
 '["Lecture Number 1", "Lecture Number 2", "Lecture 1 Transcript", "Lecture 1 Slides", "Lecture 2 Transcript"]'::jsonb, '2025-11-08T00:56:11+00'::timestamptz);

-- ----------------------------------------
-- 11. Granola Meeting Notes Title Generation (4 versions: v1-v4)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('937a7e7a-6538-430e-b6cc-249d9885900d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Create a Good Title for Granola Meeting Notes',
 $body$Create a good title for these meeting notes.

Example:
John Doe - Weekly Sync - Jan 2026$body$,
 '[]'::jsonb, '2026-01-08T20:35:47+00'::timestamptz),

('937a7e7a-6538-430e-b6cc-249d9885900d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Create a Good Title for Granola Meeting Notes',
 $body$Create a good title for these meeting notes.

Examples:
- John Doe - Weekly Sync - Jan 2026
- Jane Smith - Project Review - Jan 2026$body$,
 '[]'::jsonb, '2026-01-08T20:39:05+00'::timestamptz),

('937a7e7a-6538-430e-b6cc-249d9885900d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings',
 $body$Create a good title for these meeting notes.

Examples:
- John Doe - Weekly Sync - Jan 2026
- Jane Smith - Project Review - Jan 2026$body$,
 '[]'::jsonb, '2026-01-08T20:51:22+00'::timestamptz),

('937a7e7a-6538-430e-b6cc-249d9885900d', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 4,
 'Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings',
 $body$Create a good title for these meeting notes.

Examples:
- John Doe - Weekly Sync - Jan 2026
- Jane Smith - Project Review - Jan 2026
- Bob Wilson - 1-on-1 - Jan 2026$body$,
 '[]'::jsonb, '2026-01-10T21:55:55+00'::timestamptz);

-- ----------------------------------------
-- 12. v1 - adding a new feature idea (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('aaf2dd8d-4db0-4740-b599-5cf6c816eb92', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'adding a new feature idea',
 $body$I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I wanted to add.$body$,
 '[]'::jsonb, '2025-09-30T15:10:31+00'::timestamptz),

('aaf2dd8d-4db0-4740-b599-5cf6c816eb92', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'adding a new feature idea',
 $body$I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I wanted to add. Before asking me any questions, try and find the answer in the codebase yourself.$body$,
 '[]'::jsonb, '2025-11-05T13:07:04+00'::timestamptz),

('aaf2dd8d-4db0-4740-b599-5cf6c816eb92', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'adding a new feature idea',
 $body$I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I wanted to add. Before asking me any questions, try and find the answer in the codebase yourself.

Question Criteria:
- Only ask questions that cannot be answered by reading the code
- Be specific and targeted

{{Enter Your Idea}}$body$,
 '["Enter Your Idea"]'::jsonb, '2025-11-07T18:29:34+00'::timestamptz);

-- ----------------------------------------
-- 13. Make ECON 252 transcript title - school (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('011cd1a6-7153-4725-845d-b9ab4b417ad6', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Make ECON 252 transcript title (copies finished title) - Study',
 $body$L{{Current Lecture Number}} - Transcript - Ch {{Chapter Number}} - {{Chapter Title}} - ECON 252$body$,
 '["Current Lecture Number", "Chapter Number", "Chapter Title"]'::jsonb, '2025-10-19T16:09:20+00'::timestamptz),

('011cd1a6-7153-4725-845d-b9ab4b417ad6', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Make ECON 252 transcript title (copies finished title) - school',
 $body$L{{Current Lecture Number}} - Transcript - Ch {{Chapter Number}} - {{Chapter Title}} - ECON 252$body$,
 '["Current Lecture Number", "Chapter Number", "Chapter Title"]'::jsonb, '2025-10-25T19:20:05+00'::timestamptz);

-- ----------------------------------------
-- 14. Create List of Missing Topics from my notes - school (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('9b30ba85-9d1b-4b23-9407-97bca34c3c5f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Create List of Missing Topics from my notes compared to project files - school',
 $body$Goal: create a list of missing topics from my notes compared to the project files.

Notes File: {{Notes File Name}}$body$,
 '["Notes File Name"]'::jsonb, '2025-10-25T18:51:41+00'::timestamptz),

('9b30ba85-9d1b-4b23-9407-97bca34c3c5f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Create List of Missing Topics from my notes compared to project files - school',
 $body$Goal: create a list of missing topics from my notes compared to the project files. Focus on topics that will be on the exam.

Notes File: {{Notes File Name}}$body$,
 '["Notes File Name"]'::jsonb, '2025-11-08T15:21:50+00'::timestamptz),

('9b30ba85-9d1b-4b23-9407-97bca34c3c5f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Create List of Missing Topics from my notes compared to project files - school',
 $body$# Goal
Create a list of missing topics from my notes compared to the project files. Focus on topics that will be on the exam.

## Notes File
{{Notes File Name}}

## Instructions
1. Read the notes file
2. Compare to project files
3. Output missing topics$body$,
 '["Notes File Name"]'::jsonb, '2025-11-23T21:05:04+00'::timestamptz);

-- ----------------------------------------
-- 15. Review Plan (3 versions: v1-v3)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('a64d3819-feca-4798-be4e-ddb10dee2576', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Review Plan',
 $body$Review the following <planname> plan...

<PlanName>{{Plan Name}}</PlanName>$body$,
 '["Plan Name"]'::jsonb, '2025-09-30T16:11:24+00'::timestamptz),

('a64d3819-feca-4798-be4e-ddb10dee2576', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Review Plan',
 $body$Review the following {{Plan Name}} plan...$body$,
 '["Plan Name"]'::jsonb, '2025-10-25T22:12:33+00'::timestamptz),

('a64d3819-feca-4798-be4e-ddb10dee2576', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'Review Plan',
 $body$Review the following @"{{Plan Name}}" plan...$body$,
 '["Plan Name"]'::jsonb, '2025-11-19T16:30:48+00'::timestamptz);

-- ----------------------------------------
-- 16. MGMT 306 HW Problem Teaching / Walkthrough - school (5 versions: v1-v5)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('68fe9309-2e62-44d0-b981-656aee7ec2c4', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'MGMT 306 HW Problem Teaching / Walkthrough',
 $body$Problem {{Problem Number}}

{{Full Problem Text}}

Part: {{Problem Part To Do}} ({{Problem Part To Do (a, b)}})$body$,
 '["Problem Number", "Full Problem Text", "Problem Part To Do", "Problem Part To Do (a, b)"]'::jsonb, '2025-11-24T15:31:51+00'::timestamptz),

('68fe9309-2e62-44d0-b981-656aee7ec2c4', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'MGMT 306 HW Problem Teaching / Walkthrough',
 $body$Problem {{Problem Number}}

{{Full Problem Text}}

Part: {{Problem Part To Do (a, b)}}$body$,
 '["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]'::jsonb, '2025-11-24T15:32:25+00'::timestamptz),

('68fe9309-2e62-44d0-b981-656aee7ec2c4', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'MGMT 306 HW Problem Teaching / Walkthrough',
 $body$Problem {{Problem Number}}

<FullProblemText>{{Full Problem Text}}</FullProblemText>

Part: {{Problem Part To Do (a, b)}}$body$,
 '["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]'::jsonb, '2025-11-24T15:55:49+00'::timestamptz),

('68fe9309-2e62-44d0-b981-656aee7ec2c4', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 4,
 'MGMT 306 HW Problem Teaching / Walkthrough',
 $body$Problem {{Problem Number}}

<FullProblemText>
{{Full Problem Text}}
</FullProblemText>

Part: {{Problem Part To Do (a, b)}}$body$,
 '["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]'::jsonb, '2025-11-24T16:05:12+00'::timestamptz),

('68fe9309-2e62-44d0-b981-656aee7ec2c4', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 5,
 'MGMT 306 HW Problem Teaching / Walkthrough - school',
 $body$Problem {{Problem Number}}

<FullProblemText>
{{Full Problem Text}}
</FullProblemText>

Part: {{Problem Part To Do (a, b)}}$body$,
 '["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]'::jsonb, '2025-12-07T21:37:23+00'::timestamptz);

-- ----------------------------------------
-- 17. /PR Comments to XML - Claude Code Command (1 version: v1)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('cd9b776e-18c6-4877-bfa1-be099fd4c5dc', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 '/PR Comments to XML - Claude Code Command',
 $body$Convert PR comments to XML format for processing.

Input: PR comments from GitHub
Output: Structured XML with each comment

Format:
<comments>
  <comment>
    <file>path/to/file</file>
    <line>123</line>
    <author>reviewer</author>
    <body>comment text</body>
  </comment>
</comments>$body$,
 '[]'::jsonb, '2026-01-05T02:32:02+00'::timestamptz);

-- ----------------------------------------
-- 18. v2 - create comprehensive notes - school (4 versions: v1-v4)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('1d9dccb9-f8a4-4c0d-b7f1-03153347704c', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'v2 - create comprehensive notes (use study mode) - focus on transcript',
 $body$Create comprehensive notes from the lecture transcript.

<Lecture_Number>
<Lecture_Transcript>
<Lecture_Slides>$body$,
 '[]'::jsonb, '2025-10-08T14:12:36+00'::timestamptz),

('1d9dccb9-f8a4-4c0d-b7f1-03153347704c', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'v2 - create comprehensive notes (use study mode) - focus on transcript',
 $body$Create comprehensive notes from lecture {{Lecture Number}}.

Reference:
- {{Lecture Transcript}}
- {{Lecture Slides}}$body$,
 '["Lecture Number", "Lecture Transcript", "Lecture Slides"]'::jsonb, '2025-10-16T19:17:39+00'::timestamptz),

('1d9dccb9-f8a4-4c0d-b7f1-03153347704c', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 3,
 'v2 - create comprehensive notes (use study mode) - focus on transcript',
 $body$Create comprehensive notes from lecture {{Lecture Number}}.

Do a slide-by-slide sweep.

Reference:
- {{Lecture Transcript}}
- {{Lecture Slides}}

## Definitions Block
Include key definitions at the end.$body$,
 '["Lecture Number", "Lecture Transcript", "Lecture Slides"]'::jsonb, '2025-10-16T20:07:21+00'::timestamptz),

('1d9dccb9-f8a4-4c0d-b7f1-03153347704c', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 4,
 'v2 - create comprehensive notes (use study mode) - focus on transcript',
 $body$Create comprehensive notes from lecture {{Lecture Number}}.

Do a slide-by-slide sweep. Output in canvas.

Reference:
- {{Lecture Transcript}}
- {{Lecture Slides}}$body$,
 '["Lecture Number", "Lecture Transcript", "Lecture Slides"]'::jsonb, '2025-10-17T00:02:59+00'::timestamptz);

-- ----------------------------------------
-- 19. v3 - 2 lecture create comprehensive notes - school (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('974159fb-f71b-418b-bfc8-a682bfba4c21', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school',
 $body$Create comprehensive notes for lectures {{lecture_number_1}} and {{lecture_number_2}}.

10 formatting points including slide order point.

Reference:
- {{Lecture 1 Slides}}
- {{Lecture 1 Transcript}}
- {{Lecture 2 Transcript}}$body$,
 '["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]'::jsonb, '2025-12-14T02:11:26+00'::timestamptz),

('974159fb-f71b-418b-bfc8-a682bfba4c21', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school',
 $body$Create comprehensive notes for lectures {{lecture_number_1}} and {{lecture_number_2}}.

9 formatting points (removed slide order point).

Reference:
- {{Lecture 1 Slides}}
- {{Lecture 1 Transcript}}
- {{Lecture 2 Transcript}}$body$,
 '["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]'::jsonb, '2025-12-14T17:21:15+00'::timestamptz);

-- ----------------------------------------
-- 20. new project claude planning prompt (1 version: v1)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('35792ba0-fbf3-4a36-be99-78ce16064088', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'new project claude planning prompt (NEED TO FINISH IT)',
 $body$Start a new project planning session.

(<Initial_Idea_Brain_Dump>)
{{Initial Idea Brain Dump}}$body$,
 '["Initial Idea Brain Dump"]'::jsonb, '2026-01-08T15:14:20+00'::timestamptz);

-- ----------------------------------------
-- 21. Create a Features and Function File based on planning files (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('34abb60d-1248-448e-a295-0e4e6d542e38', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Create a Features and Function File based on planning files - Claude Code',
 $body$Goal: Create a features and function file in the same style as existing ones.$body$,
 '[]'::jsonb, '2025-10-16T22:06:16+00'::timestamptz),

('34abb60d-1248-448e-a295-0e4e6d542e38', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'Create a Features and Function File based on planning files - Claude Code',
 $body$Goal: Create a features and function file in the same style as existing ones.

## Constraints
- Follow existing format exactly
- Be comprehensive

## Format and Style
- Match existing documentation style
- Include all relevant details$body$,
 '[]'::jsonb, '2025-11-08T02:51:58+00'::timestamptz);

-- ----------------------------------------
-- 22. ChatGPT School Project Instructions - school (1 version: v1 - typo fix)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('e4dc2a81-1e49-4d1e-8fec-3013cce420df', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'ChaGPT School Project Instructions - school',
 $body$Instructions for ChatGPT school projects.$body$,
 '[]'::jsonb, '2025-10-19T16:21:28+00'::timestamptz);

-- ----------------------------------------
-- 23. v1 - create comprehensive notes - school (1 version: v1)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('d2732e54-70ae-4197-ba91-aaab8c4ac5e0', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'create comprehensive notes (use study mode) - focus on transcript',
 $body$Create comprehensive notes from lecture {{Lecture Number}}.

Reference:
- {{Lecture Transcript}}
- {{Lecture Slides}}$body$,
 '["Lecture Number", "Lecture Transcript", "Lecture Slides"]'::jsonb, '2025-10-04T00:00:00+00'::timestamptz);

-- ----------------------------------------
-- 24. Better ChatGPT Titles (1 version: v1)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('f5f0cc99-7291-4208-9b9e-a173adbaafa2', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'Better ChatGPT Titles',
 $body$Create better titles for ChatGPT conversations.$body$,
 '[]'::jsonb, '2025-11-15T00:00:00+00'::timestamptz);

-- ----------------------------------------
-- 25. buildpurdue long form content (2 versions: v1-v2)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('590d513e-3514-4d37-90a3-816c5a9d77ed', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'buildpurdue long form content',
 $body$Based on the following transcript, make descriptions for the following:

1) A Linkedln post. Make sure to thank the interviewer and the interviewee. Also make sure to tag Purdue University
Purdue Polytechnic
Purdue Computer Science
Purdue University College of Education
Purdue University College of Liberal Arts
Purdue University College of Engineering
Purdue University Daniels School of Business
Purdue Burton D. Morgan Center for Entrepreneurship
Purdue University College of Health and Human Sciences
And to add hastags. Also put in a placeholder to link the youtube interview.

2) X Make an X post announcing the interview and thanking . Make sure to include a placeholder for the link to the interview.

3) Make a Discord Announcement announcing that the interview is live. Include a placeholder for the link to the interview.$body$,
 '[]'::jsonb, '2025-11-11T22:39:57+00'::timestamptz),

('590d513e-3514-4d37-90a3-816c5a9d77ed', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 2,
 'buildpurdue long form content',
 $body$Create long form content for BuildPurdue interview with {{interviewee}}.

## Details
- Company: {{company}}
- Interviewer: {{interviewer name}}
- Interviewee Title: {{interviewee title}}
- YouTube Link: {{youtube link}}

## Transcript
{{transcript}}

## Platforms
1. LinkedIn post with university tags
2. X post
3. Discord announcement$body$,
 '["company", "transcript", "interviewee", "youtube link", "interviewer name", "interviewee title"]'::jsonb, '2025-12-01T20:48:35+00'::timestamptz);

-- ----------------------------------------
-- 26. Generate Interview Clip Social Posts (BuildPurdue) (1 version: v1)
-- ----------------------------------------
INSERT INTO prompt_versions (prompt_id, user_id, version_number, title, body, variables, created_at)
VALUES
('a31fca67-8d6a-415c-a562-a4e9e0faf39f', 'a39a8008-3fb2-4f56-b336-c08f082ff670', 1,
 'buildpurdue short-form descriptions',
 $body$Based on the following the following transcript of an interview clip, create the following:

1) A TikTok description. Include a title and description. Keep in mind TikTok is limited to 2200 characters and 5 hashtags. In the first line of the description, say there is a link in bio for the full interview.

2) An Instagram Reels description. Make the first line say to comment "learn more" and you will receive a DM with the link to the full interview (make sure to follow us first).

3) Make a YouTube Shorts description for the video.

4) Make an X post that is a caption to this interview clip.$body$,
 '[]'::jsonb, '2025-11-11T22:39:34+00'::timestamptz);


-- ============================================
-- PART 3: Verification (run after migration)
-- ============================================

-- Count total versions (should be ~113: 53 original + ~60 discovered)
-- SELECT COUNT(*) as total_versions FROM prompt_versions;

-- Count prompts with multiple versions (should be 26)
-- SELECT COUNT(*) FROM (
--   SELECT prompt_id FROM prompt_versions GROUP BY prompt_id HAVING COUNT(*) > 1
-- ) sub;

-- Verify "Identify Status and Next Steps" has 9 versions (8 discovered + 1 current)
-- SELECT COUNT(*) FROM prompt_versions WHERE prompt_id = '1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1';

COMMIT;
