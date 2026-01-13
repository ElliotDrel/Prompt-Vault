# Discovered Version History from Copy Events

**Analysis date:** 2026-01-13
**Total prompts analyzed:** 40
**Prompts with discovered versions:** 21
**Total new versions found:** ~45 distinct historical states
**Prompts with title changes:** 10
**User ID:** `a39a8008-3fb2-4f56-b336-c08f082ff670`

---

## Database Record Format

Each discovered version will be inserted into `prompt_versions` with these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Auto-generated |
| `prompt_id` | uuid | From prompt |
| `user_id` | uuid | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| `version_number` | integer | Sequential starting at 1 |
| `title` | text | Prompt title at that version |
| `body` | text | Template with `{{variable}}` placeholders |
| `variables` | jsonb | Array of variable names |
| `created_at` | timestamptz | From copy event timestamp |
| `reverted_from_version_id` | uuid | null for discovered versions |

**Numbering strategy:** Discovered versions are numbered 1, 2, 3, etc. Existing v1 (from backfill) becomes the highest version number.

---

## Summary Table

| # | Prompt | prompt_id | Discovered Versions |
|---|--------|-----------|---------------------|
| 1 | Clear, Install, Build... | `2f1b06b6-956f-4e26-a7f6-4efbd560fa56` | 3 |
| 2 | Implement Features... | `d13b8a53-78a9-402a-9be8-b228d08bcf58` | 1 |
| 3 | Commit Update Chunks to GIT | `2f73cbba-edce-40f4-9634-b03cedf25961` | 5 |
| 5 | Make Changes After Code Review | `2b9ec168-8386-4b00-b158-aaba564ef999` | 3 |
| 6 | Code Review for Uncommitted | `e3af62de-5fe0-4e36-b1b7-e21a51c9889f` | 3 |
| 7 | Identify Status and Next Steps | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` | 6 |
| 8 | V1 - PR Comment Review | `80996ca1-6b87-4af9-a9e5-56bb127e21ee` | 1 |
| 10 | Create an Implementation Plan | `7c2bdfed-a78a-49ee-8809-ccf043f6f44d` | 3 |
| 12 | Make MGMT 352 Lecture Title | `53d0fce3-0b84-4c5d-a782-4840ad26bea0` | 4 |
| 14 | Granola Meeting Notes Title | `937a7e7a-6538-430e-b6cc-249d9885900d` | 3 |
| 15 | v1 - adding a new feature idea | `aaf2dd8d-4db0-4740-b599-5cf6c816eb92` | 3 |
| 16 | Create List of Missing Topics | `9b30ba85-9d1b-4b23-9407-97bca34c3c5f` | 2 |
| 17 | Make ECON 252 transcript title | `011cd1a6-7153-4725-845d-b9ab4b417ad6` | 1 |
| 18 | MGMT 306 HW Problem Teaching | `68fe9309-2e62-44d0-b981-656aee7ec2c4` | 3 |
| 19 | Review Plan | `a64d3819-feca-4798-be4e-ddb10dee2576` | 1 |
| 21 | v2 - create comprehensive notes | `1d9dccb9-f8a4-4c0d-b7f1-03153347704c` | 3 |
| 22 | v3 - 2 lecture comprehensive notes | `974159fb-f71b-418b-bfc8-a682bfba4c21` | 2 |
| 25 | new project claude planning prompt | `35792ba0-fbf3-4a36-be99-78ce16064088` | 1 |
| 26 | buildpurdue long form content | `590d513e-3514-4d37-90a3-816c5a9d77ed` | 1 |
| 29 | Create a Features and Function File | `34abb60d-1248-448e-a295-0e4e6d542e38` | 1 |
| 31 | v1 - create comprehensive notes | `d2732e54-70ae-4197-ba91-aaab8c4ac5e0` | 1 |
| 32 | Generate Interview Clip Social Posts | `a31fca67-8d6a-415c-a562-a4e9e0faf39f` | 1 |
| 38 | Better ChatGPT Titles | `f5f0cc99-7291-4208-9b9e-a173adbaafa2` | 1 |
| 40 | How to Improve Prompts after mistakes | `ac71ec9c-7ab9-49b5-9743-dbc16853d2e4` | 1 |

---

## Detailed Findings - Exact Database Records

---

### Prompt 7: Identify Status and Next Steps from Plan
**prompt_id:** `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `IDENIFY CODEBASE STATUS AND NEXT STEP` |
| body | `Based on the planning files what is the current state of the codebase and what is the next step?` |
| variables | `[]` |
| created_at | `2025-09-29 13:02:39.110527+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Codebase Status and Identify Next Steps` |
| body | `Based on the planning files what is the current state of the codebase and what is the next step?` |
| variables | `[]` |
| created_at | `2025-10-02 16:31:27.91169+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Identify Status and Next Steps from Plan` |
| body | `Based on the planning files what is the current state of the codebase and what is the next step? {{Planning File Names}}` |
| variables | `["Planning File Names"]` |
| created_at | `2025-10-02 16:32:45.679973+00` |

#### Version 4 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `4` |
| title | `Identify Status and Next Steps from Plan` |
| body | `Based on the planning files (@{{Planning File Names}}) what is the current state of the codebase and what is the next step?` |
| variables | `["Planning File Names"]` |
| created_at | `2025-10-16 14:55:10.484572+00` |

#### Version 5 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `5` |
| title | `Identify Status and Next Steps from Plan` |
| body | `Based on the planning files (@{{Planning File Names}}), what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually search, read, and explore to identify the current state.` |
| variables | `["Planning File Names"]` |
| created_at | `2025-11-08 03:15:53.986193+00` |

#### Version 6 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `6` |
| title | `Identify Status and Next Steps from Plan` |
| body | `Based on the planning file named:"{{Planning File Name}}", what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually explore to identify the current state (use explore agent).` |
| variables | `["Planning File Name"]` |
| created_at | `2025-12-26 10:06:12.233402+00` |

**Note:** Existing v1 becomes v7 (current state)

---

### Prompt 3: Commit Update Chunks to GIT
**prompt_id:** `2f73cbba-edce-40f4-9634-b03cedf25961`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f73cbba-edce-40f4-9634-b03cedf25961` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Commit Update Chunks to GIT` |
| body | `Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to properly make the im-tns work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. Finally, commit these commit groups one by one.` |
| variables | `[]` |
| created_at | `2025-09-29 22:54:38.040101+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f73cbba-edce-40f4-9634-b03cedf25961` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Commit Update Chunks to GIT` |
| body | `Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, commit these commit groups one by one.` |
| variables | `[]` |
| created_at | `2025-11-05 05:01:58.134425+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f73cbba-edce-40f4-9634-b03cedf25961` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Commit Update Chunks to GIT` |
| body | `Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why that follows the same style and format as the previous commits. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, commit these commit groups one by one.` |
| variables | `[]` |
| created_at | `2025-11-05 05:03:38.051259+00` |

#### Version 4 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f73cbba-edce-40f4-9634-b03cedf25961` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `4` |
| title | `Commit Update Chunks to GIT` |
| body | `Identify which files you made changes to in this chat or have not committed. Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why that follows the same style and format as the previous commits. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT.` |
| variables | `[]` |
| created_at | `2025-11-05 19:49:48.544298+00` |

#### Version 5 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f73cbba-edce-40f4-9634-b03cedf25961` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `5` |
| title | `Commit Update Chunks to GIT` |
| body | `Identify which files you made changes to in this chat or are still uncommitted. Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why that follows the same style and format as the previous commits (get minimum last 5 commit messages to use as reference). These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT.` |
| variables | `[]` |
| created_at | `2025-12-29 17:41:32+00` |

**Note:** Existing v1 has "(get minimum last 10 commit messages...)" - becomes v6 (current state)

---

### Prompt 5: Make Changes After Code Review
**prompt_id:** `2b9ec168-8386-4b00-b158-aaba564ef999`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2b9ec168-8386-4b00-b158-aaba564ef999` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `make code review changes (codex) - after code review` |
| body | `Make the changes that the code review suggested. If there are any comments you don't understand, ask me to clarify.` |
| variables | `[]` |
| created_at | `2025-09-29 13:49:02+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2b9ec168-8386-4b00-b158-aaba564ef999` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `make code review changes (codex) - after code review` |
| body | `Make the changes that the code review suggested. If there are any comments you don't understand, ask me to clarify. Before starting, verify that the issue is still present before fixing it.` |
| variables | `[]` |
| created_at | `2025-11-20 19:25:02+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2b9ec168-8386-4b00-b158-aaba564ef999` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Make Changes After Code Review` |
| body | `## Goal\nImplement the code review feedback below.\n\n## Input\n{{Comments To Implement}}\n\n## Process\n1. Before starting each fix, verify the issue still exists\n2. Make minimal, targeted changes to address each comment\n3. If a comment is unclear, ask for clarification before proceeding` |
| variables | `["Comments To Implement"]` |
| created_at | `2025-12-26 20:33:36+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 6: Code Review for Uncommitted Changes
**prompt_id:** `e3af62de-5fe0-4e36-b1b7-e21a51c9889f`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `e3af62de-5fe0-4e36-b1b7-e21a51c9889f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `code review - uncommited` |
| body | `Perform a code review on the uncommitted changes. Output a numbered list of issues along with file paths. If there are no issues, output "No issues found".` |
| variables | `[]` |
| created_at | `2025-09-29 14:01:01+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `e3af62de-5fe0-4e36-b1b7-e21a51c9889f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Code Review for Uncommitted Changes` |
| body | `## Goal\nPerform a thorough code review on uncommitted changes.\n\n## Review Process\n1. Check for bugs, logic errors, and edge cases\n2. Verify consistent naming and code style\n3. Look for security vulnerabilities\n4. Identify performance concerns\n5. Check for proper error handling\n\n## Output Format\nOutput a numbered list of issues along with file paths. If there are no issues, output "No issues found".` |
| variables | `[]` |
| created_at | `2025-12-29 17:29:55+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `e3af62de-5fe0-4e36-b1b7-e21a51c9889f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Code Review for Uncommitted Changes` |
| body | `## Goal\nPerform a thorough code review on uncommitted changes.\n\n## Review Process\n1. Check for bugs, logic errors, and edge cases\n2. Verify consistent naming and code style\n3. Look for security vulnerabilities\n4. Identify performance concerns\n5. Check for proper error handling\n\n## Output Format\nOutput a numbered list of ALL the issues along with file paths. If there are no issues, output "No issues found".` |
| variables | `[]` |
| created_at | `2026-01-05 17:27:51+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 1: Clear, Install, Build, Everything Else, and Dev
**prompt_id:** `2f1b06b6-956f-4e26-a7f6-4efbd560fa56`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f1b06b6-956f-4e26-a7f6-4efbd560fa56` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Clear, Install, Build, Everything Else, and Dev` |
| body | `Results for running the following: Clear; npm install && npm run build && npm run dev` |
| variables | `[]` |
| created_at | `2025-09-29 14:03:13+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f1b06b6-956f-4e26-a7f6-4efbd560fa56` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Clear, Install, Build, Everything Else, and Dev` |
| body | `Results from running the following: Clear; npm install && npm run build && npm run dev` |
| variables | `[]` |
| created_at | `2025-11-07 18:39:10+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `2f1b06b6-956f-4e26-a7f6-4efbd560fa56` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Clear, Install, Build, Everything Else, and Dev` |
| body | `Results from running the following: Clear; npm run ci; npm install && npm run build && npm run dev` |
| variables | `[]` |
| created_at | `2025-11-07 20:05:44+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 2: Implement Features Step by Step for CC based on plan
**prompt_id:** `d13b8a53-78a9-402a-9be8-b228d08bcf58`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `d13b8a53-78a9-402a-9be8-b228d08bcf58` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Implement Features Step by Step  for CC` |
| body | (same as current - only title changed: double space, missing "based on plan") |
| variables | (same as current) |
| created_at | `2025-09-29 13:06:07+00` |

**Note:** Existing v1 becomes v2 (current state)

---

### Prompt 8: V1 - PR Comment Review
**prompt_id:** `80996ca1-6b87-4af9-a9e5-56bb127e21ee`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `80996ca1-6b87-4af9-a9e5-56bb127e21ee` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `PR Comment Review - NEED TO UPDATE` |
| body | `I had a few devs review my PR for this branch and they left some pretty detailed comments. Review the comments they left (attached below) and help me determine which to implement and which to disregard. For each comment, first articulate what issue it is identifying or what change it is suggesting to make, then review the codebase and explain what the current situation is. After that, make an analysis on whether or not the suggested change/suggestion is a good idea to implement (include reasoning).` |
| variables | `[]` |
| created_at | `2025-10-04 02:43:15.14666+00` |

**Note:** All 25 copy events show title "PR Comment Review - NEED TO UPDATE" but current v1 is "V1 - PR Comment Review". Existing v1 becomes v2 (current state).

---

### Prompt 10: Create an Implementation Plan based on planning files
**prompt_id:** `7c2bdfed-a78a-49ee-8809-ccf043f6f44d`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `7c2bdfed-a78a-49ee-8809-ccf043f6f44d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Create an Implementation Plan based on planning files - Claude Code` |
| body | `Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files" based on the WHOLE discussion we had in this chat.\n\nFormat and Style: \n* Read and mirror the headings, ordering, tone, and formatting used in the example(s) from @"Planning and Task Files". Extract requirements, decisions, and rationale from the source discussion.\n\nConstraints: \n* Minimal code in the output: include only small, illustrative snippets when absolutely necessary (e.g., 1–10 lines for a command, signature, or config key). Prefer file paths, interfaces, and step bullets over code blocks. No full implementations.\n* Match the section order, heading syntax, bullet style, typography, and depth of the reference files.\n* Filename pattern: match the repository's existing pattern \n\nWhat a Implementation Plan file is: A single Markdown document that turns the discussion into an actionable, phase-structured plan: scope, approach, concrete steps per phase, files to create/modify, testing strategy, deployment notes, and clear success criteria. It's decision- and action-oriented, not a spec.` |
| variables | `[]` |
| created_at | `2025-10-16 22:32:57.066459+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `7c2bdfed-a78a-49ee-8809-ccf043f6f44d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Create an Implementation Plan based on planning files - Claude Code` |
| body | `Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files" based on the WHOLE discussion we had in this chat.\n\n  **STEP 1 - BEFORE WRITING**:\n  Analyze reference files and report:\n  1. How many code blocks does each reference file have?\n  2. What do they show in code vs. prose?\n\n  **STEP 2 - WHILE WRITING**:\n  - Write in "Documentation Writer" mode (NOT Implementer mode)\n  - If any block >10 lines: STOP and convert to prose bullets\n  - Ask: "Is this code necessary or just helpful?" (If helpful, use prose)\n\n  Format and Style:\n  * Read and mirror the headings, ordering, tone, and formatting used in examples\n  * Extract requirements, decisions, and rationale from source discussion\n\nConstraints: \n* Minimal code in the output: include only small, illustrative snippets when absolutely necessary (e.g., 1–10 lines for a command, signature, or config key). Prefer file paths, interfaces, and step bullets over code blocks. No full implementations.\n* Match the section order, heading syntax, bullet style, typography, and depth of the reference files.\n* Filename pattern: match the repository's existing pattern \n\nWhat a Implementation Plan file is: A single Markdown document that turns the discussion into an actionable, phase-structured plan: scope, approach, concrete steps per phase, files to create/modify, testing strategy, deployment notes, and clear success criteria. It's decision- and action-oriented, not a spec.` |
| variables | `[]` |
| created_at | `2025-11-19 13:13:03.850669+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `7c2bdfed-a78a-49ee-8809-ccf043f6f44d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Create an Implementation Plan based on planning files - Claude Code` |
| body | `Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files" based on the WHOLE discussion we had in this chat.\n\n  **STEP 1 - BEFORE WRITING**:\n  Analyze reference files and report (use your explore capability):\n  1. How many code blocks does each reference file have?\n  2. What do they show in code vs. prose?\n\n  **STEP 2 - WHILE WRITING**:\n  - Write in "Documentation Writer" mode (NOT Implementer mode)\n  - If any block >10 lines: STOP and convert to prose bullets\n  - Ask: "Is this code necessary or just helpful?" (If helpful, use prose)\n\n  Format and Style:\n  * Read and mirror the headings, ordering, tone, and formatting used in examples\n  * Extract requirements, decisions, and rationale from source discussion\n\nConstraints: \n* Minimal code in the output: include only small, illustrative snippets when absolutely necessary (e.g., 1–10 lines for a command, signature, or config key). Prefer file paths, interfaces, and step bullets over code blocks. No full implementations.\n* Match the section order, heading syntax, bullet style, typography, and depth of the reference files.\n* Filename pattern: match the repository's existing pattern \n\nWhat a Implementation Plan file is: A single Markdown document that turns the discussion into an actionable, phase-structured plan: scope, approach, concrete steps per phase, files to create/modify, testing strategy, deployment notes, and clear success criteria. It's decision- and action-oriented, not a spec.` |
| variables | `[]` |
| created_at | `2025-12-25 16:02:04.864506+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 12: Make MGMT 352 Lecture Title in granola - School
**prompt_id:** `53d0fce3-0b84-4c5d-a782-4840ad26bea0`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `53d0fce3-0b84-4c5d-a782-4840ad26bea0` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Make MGMT 352 Lecture Title in granola - School` |
| body | `Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}} \n\nExample Titles:\n- L14 - Transcript - Technology Strategy and Innovation, Innovation Lifecycle Stages, Customer Adoption Patterns, and Disruptive Innovation Strategy - MGMT 352\n- L13 - Lecture and Case Review Transcript - Cost Leadership vs Differentiation Strategies, Blue Ocean, JetBlue & Warby Parker Cases - MGMT 352\n...` |
| variables | `["lecture number"]` |
| created_at | `2025-10-23 12:47:04.520687+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `53d0fce3-0b84-4c5d-a782-4840ad26bea0` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Make MGMT 352 Lecture Title in granola - School` |
| body | `Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}. The title TOTAL characters has to be UNDER 260 characters.\n\n...` |
| variables | `["lecture number"]` |
| created_at | `2025-11-01 18:35:43.197486+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `53d0fce3-0b84-4c5d-a782-4840ad26bea0` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Make MGMT 352 Lecture Title in granola - School` |
| body | `Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}. The title TOTAL characters has to be UNDER 260 characters. Also, name this chat "L{{lecture number}} Title Creation".\n\n...` |
| variables | `["lecture number"]` |
| created_at | `2025-11-01 18:36:44.051738+00` |

#### Version 4 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `53d0fce3-0b84-4c5d-a782-4840ad26bea0` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `4` |
| title | `Make MGMT 352 Lecture Title in granola - School` |
| body | `Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}}. The title TOTAL characters has to be UNDER 160 characters.\n\n...` |
| variables | `["lecture number"]` |
| created_at | `2025-11-18 01:38:57.406788+00` |

**Note:** Existing v1 becomes v5 (current state)

---

### Prompt 14: Granola Meeting Notes Title Generation
**prompt_id:** `937a7e7a-6538-430e-b6cc-249d9885900d`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `937a7e7a-6538-430e-b6cc-249d9885900d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Create a Good Title for Granola Meeting Notes` |
| body | `**Goal:**\nHelp the user create a better meeting title that clearly articulates the content and purpose of the meeting.\n\n**Task:**\nSuggest 5 improved titles for this meeting based on the transcript and meeting notes provided.\n\n**Title Format:**\n\`{Attendee Name} & Elliot - {Topic 1}, {Topic 2}, & {Topic 3}\`\n\n**Title Guidelines:**\n- Include 2-4 key topics or concepts from the meeting\n- Focus on actionable outcomes, strategic themes, and key decisions — not granular details\n- Use concise noun phrases (e.g., "ICP Refinement" not "Refining and narrowing down the ICP")\n- Connect topics with commas, "&", or "and"\n- Keep each title short, direct, and scannable\n\n**Example Titles:**\n- Jeanette & Elliot - ICP Refinement & Customer Discovery Strategy and Business Model Guidance` |
| variables | `[]` |
| created_at | `2026-01-08 20:35:47.589575+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `937a7e7a-6538-430e-b6cc-249d9885900d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Create a Good Title for Granola Meeting Notes` |
| body | (same as v1 but with added example: "- Coach Woody & Elliot -") |
| variables | `[]` |
| created_at | `2026-01-08 20:39:05.738045+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `937a7e7a-6538-430e-b6cc-249d9885900d` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings` |
| body | (same body as v2, title changed) |
| variables | `[]` |
| created_at | `2026-01-08 20:51:22.244598+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 15: v1 - adding a new feature idea
**prompt_id:** `aaf2dd8d-4db0-4740-b599-5cf6c816eb92`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `aaf2dd8d-4db0-4740-b599-5cf6c816eb92` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `adding a new feature idea` |
| body | `I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I wanted to add, how I wanted to work, and what I wanted to do. Think. After that, create a comprehensive and detailed implementation plan that clearly articulates what I want to do, how I want to do it, and then exactly how you're going to do it and why each of these specific changes that you're going to make is the most optimal change for the long-term stability of the codebase.\n\nmy ideas:` |
| variables | `[]` |
| created_at | `2025-09-30 15:10:31.11077+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `aaf2dd8d-4db0-4740-b599-5cf6c816eb92` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `adding a new feature idea` |
| body | `I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I want to add, how I want it to work, and what I want it to do. Think. After that, create a comprehensive and detailed implementation plan that clearly articulates what I want to do, how I want to do it, and then exactly how you're going to do it and why each of these specific changes that you're going to make is the most optimal change for the long-term stability of the codebase. Before asking me any questions, try and find the answer in the codebase yourself. When asking questions, if anything doesn't make sense, explain what you understand, and then ask clarifying questions.\n\nmy ideas:` |
| variables | `[]` |
| created_at | `2025-11-05 13:07:04.996181+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `aaf2dd8d-4db0-4740-b599-5cf6c816eb92` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `adding a new feature idea` |
| body | `I would like to add a new feature to this codebase. Help me articulate and develop my idea completely by asking me questions until you are 100% confident of what feature I want to add, how I want it to work, and what I want it to do. After that, create a comprehensive and detailed implementation plan that clearly articulates what I want to do, how I want to do it, and then exactly how you're going to do it and why each of these specific changes that you're going to make is the most optimal change for the long-term stability of the codebase. \n\nQuestion Criteria:\n* Before asking me any questions, ALWAYS try and find the answer in the codebase yourself. \n* When asking questions, if anything doesn't make sense, explain what you understand, and then ask clarifying questions.\n\nmy ideas:` |
| variables | `[]` |
| created_at | `2025-11-07 18:29:34.785686+00` |

**Note:** Existing v1 has `{{Enter Your Idea}}` variable - becomes v4 (current state)

---

### Prompt 16: Create List of Missing Topics from my notes
**prompt_id:** `9b30ba85-9d1b-4b23-9407-97bca34c3c5f`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `9b30ba85-9d1b-4b23-9407-97bca34c3c5f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Create List of Missing Topics from my notes compared to project files - school` |
| body | `Goal: create a list of missing topics, concepts, and ideas that are MISSING or NOT fully covered in my notes ("")\n\nReference Sources (pull from these first):\n- "": this file contains my current notes for the course. This is your primary reference.\n- ALL other Project Files\n\nAdditional Criteria:\n* Include all relevant equations and information needed to remember from the examples and class conversation.\n* Place higher priority on the transcript to identify additional ideas, suggestions, tips, tricks, and recommendations made verbally in class that are NOT on the slides!\n* Use both slides and transcripts. Do a slide-by-slide sweep. Do not rely on keyword search only; visually parse every slide (including images).\n* If a term appears in slides but not transcripts, still include it. My goal is` |
| variables | `[]` |
| created_at | `2025-10-25 18:51:41.173466+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `9b30ba85-9d1b-4b23-9407-97bca34c3c5f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `Create List of Missing Topics from my notes compared to project files - school` |
| body | `# Goal: \nCreate a list of ALL missing topics, concepts, and ideas that are MISSING, NOT fully or accurately covered in my notes ("{{Notes File Name}}").\n\n# Reference Sources (pull from these first):\n- "{{Notes File Name}}": this file contains my current notes for the course. This is your primary reference.\n- ALL other Project Files\n\n# Additional Criteria:\n* Clearly articulate EXACTLY what I need to add, correct, or remove from my notes to fully and accurately cover ALL topics/ideas/concepts covered in the project files\n* Include all relevant equations and information needed to remember from the examples and class conversation.\n* Place higher priority on the transcript to identify additional ideas, suggestions, tips, tricks, and recommendations made verbally in class that are NOT on the slides!\n* Use both slides and transcripts. Do a slide-by-slide sweep. Do not rely on keyword search only; visually parse every slide (including images).` |
| variables | `["Notes File Name"]` |
| created_at | `2025-11-23 21:05:04.747035+00` |

**Note:** Existing v1 becomes v3 (current state)

---

### Prompt 17: Make ECON 252 transcript title
**prompt_id:** `011cd1a6-7153-4725-845d-b9ab4b417ad6`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `011cd1a6-7153-4725-845d-b9ab4b417ad6` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Make ECON 252 transcript title (copies finished title) - Study` |
| body | (same as current) |
| variables | `["Chapter Title", "Chapter Number", "Current Lecture Number"]` |
| created_at | `2025-10-19 16:09:20.278471+00` |

**Note:** Title changed from "- Study" to "- school". Existing v1 becomes v2 (current state).

---

### Prompt 18: MGMT 306 HW Problem Teaching / Walkthrough
**prompt_id:** `68fe9309-2e62-44d0-b981-656aee7ec2c4`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `68fe9309-2e62-44d0-b981-656aee7ec2c4` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `MGMT 306 HW Problem Teaching / Walkthrough` |
| body | `Teach me how to do problem {{Problem Number}}. \n\nI have included the original problem below in chat and any and all relevant images. Work through the entire problem 1 step by step the same way that we do similar problems in the lectures (refer to project files).\n\nStart with part {{Problem Part To Do (a, b)}}.` |
| variables | `["Problem Number", "Full Problem Text", "Problem Part To Do", "Problem Part To Do (a, b)"]` |
| created_at | `2025-11-24 15:31:51.757196+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `68fe9309-2e62-44d0-b981-656aee7ec2c4` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `MGMT 306 HW Problem Teaching / Walkthrough` |
| body | `Teach me how to do problem {{Problem Number}}. \n\nI have included the original problem below in chat and any and all relevant images. Work through the entire problem 1 step by step the same way that we do similar problems in the lectures (refer to project files).\n\nStart with part {{Problem Part To Do (a, b)}}.\n<FullProblemText>{{Full Problem Text}}</FullProblemText>` |
| variables | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` |
| created_at | `2025-11-24 16:05:12.912274+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `68fe9309-2e62-44d0-b981-656aee7ec2c4` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `MGMT 306 HW Problem Teaching / Walkthrough - school` |
| body | (same as v2 with "- school" title suffix) |
| variables | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` |
| created_at | `2025-12-07 21:37:23.258928+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 19: Review Plan
**prompt_id:** `a64d3819-feca-4798-be4e-ddb10dee2576`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `a64d3819-feca-4798-be4e-ddb10dee2576` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Review Plan` |
| body | `Review the following <planname> plan. \n\nFor your review, first identify what the goal and purpose of the plan is and clearly situate the intended result of the plan.\n\nThen do the following: check if each proposed step directly addresses the intended result, flag any technical mistakes or missing actions, identify risks or dependencies not mentioned, note any unclear reasoning or steps that need clarification, suggest more efficient or robust solutions, and reference specific evidence to support your feedback. \n\nMake a final determination if the plan is the best and most optimal method to achieve the intended result for long-term stability.\n\nFinally, when you are done, output an updated plan for the optimal way to create the intended result, and a detailed report of the original plan and th` |
| variables | `["Plan Name"]` |
| created_at | `2025-09-30 16:11:24.105085+00` |

**Note:** Changed from `<planname>` tags to `@"..."` format. Existing v1 becomes v2 (current state).

---

### Prompt 21: v2 - create comprehensive notes
**prompt_id:** `1d9dccb9-f8a4-4c0d-b7f1-03153347704c`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1d9dccb9-f8a4-4c0d-b7f1-03153347704c` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `v2 - create comprehensive notes (use study mode) - focus on transcript` |
| body | `goal: create exam-ready comprehensive notes in my note-taking style/format that outline EVERY single topic, concept, and idea that was covered in the <lecture_number> transcript and slides\n\nReference Sources (pull from these first):\n"<Lecture_Transcript>" and "<Lecture_Slides>"\n\nNotes Formatting & Style for each topic/idea/concept:\n1. Start each with a simple headline (e.g., "How do buyers behave").\n2. Then each include a definition for explanation of what the topic/idea/concept is.\n3. After that include a bulleted list of any other details, additional notes, or insights that I need to know related to that topic/idea/concept.\n4. Include all formulas, equations, and relevant graphs.\n5. Where relevant add step by step procedures or instructions.\n6. Include any examples that were used in clas` |
| variables | `[]` |
| created_at | `2025-10-08 14:12:36.160266+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1d9dccb9-f8a4-4c0d-b7f1-03153347704c` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `v2 - create comprehensive notes (use study mode) - focus on transcript` |
| body | (started using `{{Lecture Number}}`, `{{Lecture Transcript}}`, `{{Lecture Slides}}` variables) |
| variables | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` |
| created_at | `2025-10-16 19:17:39.276874+00` |

#### Version 3 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `1d9dccb9-f8a4-4c0d-b7f1-03153347704c` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `3` |
| title | `v2 - create comprehensive notes (use study mode) - focus on transcript` |
| body | (added "Output in canvas" instruction) |
| variables | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` |
| created_at | `2025-10-17 00:02:59.814442+00` |

**Note:** Existing v1 becomes v4 (current state)

---

### Prompt 22: v3 - 2 lecture create comprehensive notes
**prompt_id:** `974159fb-f71b-418b-bfc8-a682bfba4c21`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `974159fb-f71b-418b-bfc8-a682bfba4c21` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school` |
| body | (original with "Build notes in same order as slide deck") |
| variables | `["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]` |
| created_at | `2025-12-14 02:11:26.853119+00` |

#### Version 2 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `974159fb-f71b-418b-bfc8-a682bfba4c21` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `2` |
| title | `v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school` |
| body | (added "Every definition and example must be derived directly from the transcript's phrasing") |
| variables | `["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]` |
| created_at | `2025-12-15 17:43:47.161797+00` |

**Note:** Existing v1 becomes v3 (current state)

---

### Prompt 25: new project claude planning prompt
**prompt_id:** `35792ba0-fbf3-4a36-be99-78ce16064088`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `35792ba0-fbf3-4a36-be99-78ce16064088` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `new project claude planning prompt (NEED TO FINISH IT)` |
| body | `I have an idea for a new project that I want to build. Help me articulate and develop my ideas completely by asking me questions until you are 100% confident of what I want to add, how I want it to work, what I want it to do, and ALL other relevant details.\n\nFirst, read the idea braindump (<Initial_Idea_Brain_Dump>) below, which includes a quick braindump of all the ideas I have for the project.\n\nThen Interview me in detail using the AskUserQuestionTool about literally anything and everything related to the project: technical implementation, UI/UX, concerns, trade-offs, etc.\n\nQuestion Criteria:\n* Before asking me any questions, ALWAYS try to find the answer yourself. Exhaust all available context and tools (prior messages, provided files, permitted browsing, and accessible tools) to gather...` |
| variables | `["Initial Idea Brain Dump"]` |
| created_at | `2026-01-08 15:14:20.310974+00` |

**Note:** Changed from `<Initial_Idea_Brain_Dump>` to `<InitialIdeaBrainDump>` format. Existing v1 becomes v2 (current state).

---

### Prompt 26: buildpurdue long form content
**prompt_id:** `590d513e-3514-4d37-90a3-816c5a9d77ed`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `590d513e-3514-4d37-90a3-816c5a9d77ed` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `buildpurdue long form content` |
| body | `Based on the following transcript, make descriptions for the following:\n\n1) A Linkedln post. Make sure to thank the interviewer and the interviewee. Also make sure to tag Purdue University...\n\n2) X Make an X post announcing the interview...\n\n3) Make a Discord Announcement announcing that the` |
| variables | `[]` |
| created_at | `2025-11-11 22:39:57.438173+00` |

**Note:** Major restructuring with 6 variables added. Existing v1 becomes v2 (current state).

---

### Prompt 29: Create a Features and Function File
**prompt_id:** `34abb60d-1248-448e-a295-0e4e6d542e38`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `34abb60d-1248-448e-a295-0e4e6d542e38` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Create a Features and Function File based on planning files - Claude Code` |
| body | `Goal: Create a features and function file in the same style and format as the rest of the feature files in @"Planning and Task Files" based on the ENTER discussion we had in this chat.\n\nFormat and Style: Reference the @"Planning and Task Files" for examples of how other features and function files are structured, formatted, styled and to what level of detail they go.  \n\nWhat a features and function file is: feature files are meant to outline (with no code) what the feature we are building is going to be, how it is going to work, why we are making it, how it will look, how it will feel and any other needed information so after reading the doc a user can completely know the thought process and the motivation and the goal behind this idea.` |
| variables | `[]` |
| created_at | `2025-10-16 22:06:16.055366+00` |

**Note:** Existing v1 becomes v2 (current state)

---

### Prompt 31: v1 - create comprehensive notes
**prompt_id:** `d2732e54-70ae-4197-ba91-aaab8c4ac5e0`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `d2732e54-70ae-4197-ba91-aaab8c4ac5e0` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `create comprehensive notes (use study mode) - focus on transcript` |
| body | (same as current) |
| variables | `[]` |
| created_at | `2025-10-04 16:36:06.654555+00` |

**Note:** Title changed by adding "v1 -" prefix and "- school" suffix. Existing v1 becomes v2 (current state).

---

### Prompt 32: Generate Interview Clip Social Posts
**prompt_id:** `a31fca67-8d6a-415c-a562-a4e9e0faf39f`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `a31fca67-8d6a-415c-a562-a4e9e0faf39f` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `buildpurdue short-form descriptions` |
| body | `Based on the following the following transcript of an interview clip, create the following:\n\n1) A TikTok description. Include a title and description. Keep in mind TikTok is limited to 2200 characters and 5 hashtags. In the first line of the description, say there is a link in bio for the full interview. \n\n2) An Instagram Reels description. Make the first line say to comment "learn more" and you will receive a DM with the link to the full interview (make sure to follow us first).\n\n3) Make a YouTube Shorts description for the video. \n\n4) Make an X post that is a caption to this interview clip.` |
| variables | `[]` |
| created_at | `2025-11-11 22:39:34.392311+00` |

**Note:** Complete title change and major restructuring with variables. Existing v1 becomes v2 (current state).

---

### Prompt 38: Better ChatGPT Titles
**prompt_id:** `f5f0cc99-7291-4208-9b9e-a173adbaafa2`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `f5f0cc99-7291-4208-9b9e-a173adbaafa2` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `Better ChatGPT Titles` |
| body | `You will be analyzing a conversation between a user and an AI assistant to help create a more effective prompt for generating appropriate conversation titles. The goal is to identify what made the conversation successful in arriving at a good title, and then create a refined prompt that would get to that result faster.\n\nYour task is to analyze this conversation and create a refined prompt that would help an AI generate an appropriate conversation title more efficiently, without requiring multiple rounds of back-and-forth refinement.\n\nA good conversation title should:\n- Give an overview of the conversation's purpose and content\n- Help the user know when and why they should reference this conversation later\n- Be specific enough to distinguish it from other similar conversations\n- Capture the` |
| variables | `[]` |
| created_at | `2025-11-15 01:54:39.483147+00` |

**Note:** Existing v1 has "FIX THESE:" section added. Existing v1 becomes v2 (current state).

---

### Prompt 40: How to Improve Prompts after mistakes
**prompt_id:** `ac71ec9c-7ab9-49b5-9743-dbc16853d2e4`

#### Version 1 (to insert)

| Field | Value |
|-------|-------|
| prompt_id | `ac71ec9c-7ab9-49b5-9743-dbc16853d2e4` |
| user_id | `a39a8008-3fb2-4f56-b336-c08f082ff670` |
| version_number | `1` |
| title | `How to Improve Prompts for AI Agents per Matt Shummer Twitter (X)` |
| body | `What went wrong in your prompt/context for you to make this mistake?` |
| variables | `[]` |
| created_at | `2025-10-30 23:13:30.051836+00` |

**Note:** Title changed by adding "after mistakes". Existing v1 becomes v2 (current state).

---

## Prompts with NO Discovered Versions (19 prompts)

These prompts had copy events but all events matched the existing v1:

- Self reflection (67 events)
- code review - in this chat (21 events)
- V2 - PR Comment Review (16 events)
- v2.1 - 2 lecture create comprehensive notes (14 events)
- /PR Comments to XML (7 events)
- V2 - Custom Instructions for ChatGPT, Claude (4 events)
- review changes (3 events)
- NotebookLM Podcast for Exam Prep (2 events)
- ChatGPT School Project Instructions (2 events)
- WORKFLOW - ChatGPT Recommendation (1 event)
- Task Execute (1 event)
- V2 - adding a new feature to a project (1 event)
- /catchup - claude code command (1 event)
- Create Visual Menu Based on Attached Images (1 event)
- context 7 add (1 event)
- LinkedIn post prompt - claude (1 event)

---

## Verification Checklist

Before proceeding to Phase 8.2, please verify:

1. [ ] **Version numbers start at 1** - Fixed from previous version that started at 0
2. [ ] **All prompts have full database records** - Every discovered version shows the table format
3. [ ] **Body text looks correct** - Check that `{{variable}}` placeholders appear where expected
4. [ ] **Timestamps are reasonable** - Do version dates align with when you edited prompts?
5. [ ] **No false positives** - Versions that shouldn't be separate?
6. [ ] **No missing versions** - Changes you remember that aren't detected?

---

## Phase 8.2 Migration Strategy

Once verified, Phase 8.2 will:
1. Renumber existing v1 to make room for discovered versions
2. Insert discovered versions with correct version_number sequence (starting at 1)
3. Ensure chronological ordering (oldest = version 1)
4. Preserve existing v1 as the highest version number (current state)

---

*Generated by Phase 8.1 - Version History Discovery*
*Ready for Phase 8.2: Apply Verified Version History to Database*
