# Discovered Version History from Copy Events (FINAL - Merged)

**Analysis date:** 2026-01-13
**Source:** v2 analysis (base) + 2 prompts from v1 analysis
**User ID:** `a39a8008-3fb2-4f56-b336-c08f082ff670`

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total prompts with copy events | 40 |
| Prompts with discovered historical versions | 26 |
| Prompts with NO version changes | 14 |
| Total historical versions to insert | ~60 |
| Prompts where current differs from last copy | 9 |

---

## Database Record Format

Each discovered version will be inserted into `prompt_versions` with:
- `id` - auto-generated UUID
- `prompt_id` - from prompt
- `user_id` - `a39a8008-3fb2-4f56-b336-c08f082ff670`
- `version_number` - integer starting at 0 for oldest discovered
- `title` - text
- `body` - text (template with `{{variable}}` placeholders)
- `variables` - jsonb array
- `created_at` - timestamp from first copy event with this version
- `reverted_from_version_id` - null for discovered versions

---

## Prompts with Discovered Versions (26 prompts)

### 1. Clear, Install, Build, Everything Else, and Dev
**prompt_id:** `2f1b06b6-956f-4e26-a7f6-4efbd560fa56`
**Copy events:** 116 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Clear, Install, Build, Everything Else, and Dev | `clear; echo "Results for running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev` | `[]` | 2025-09-29T14:03:13+00 |
| 1 | Clear, Install, Build, Everything Else, and Dev | `clear; echo "Results from running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev` | `[]` | 2025-11-07T18:39:10+00 |
| 2 | Clear, Install, Build, Everything Else, and Dev | `clear; echo "Results from running the following: npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run ci; npm run dev:"; npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run ci; npm run dev` | `[]` | 2025-11-07T20:05:44+00 |

**Changes:** v0->v1: "Results for" -> "Results from"; v1->v2: Added `npm run ci`
**Current matches:** v2

---

### 2. Implement Features Step by Step for CC based on plan
**prompt_id:** `d13b8a53-78a9-402a-9be8-b228d08bcf58`
**Copy events:** 89 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Implement Features Step by Step  for CC | Based on the following plan implement the features step by step. Before starting on a task clearly articulate what the intended feature and functionality is. Then deep think about the best way to implement the following feature in the most effective way and best way for long term stability. Only then make the needed changes. | `[]` | 2025-09-29T13:06:07+00 |
| 1 | Implement Features Step by Step for CC based on plan | (same body as v0) | `[]` | 2026-01-07T15:01:59+00 |

**Changes:** v0->v1: Title changed (double space fix, added "based on plan")
**Current matches:** v1

---

### 3. Commit Update Chunks to GIT
**prompt_id:** `2f73cbba-edce-40f4-9634-b03cedf25961`
**Copy events:** 81 | **Versions discovered:** 6

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Commit Update Chunks to GIT | Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to properly make the im-tns work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. Finally, commit these commit groups one by one. | `[]` | 2025-09-29T22:54:38+00 |
| 1 | Commit Update Chunks to GIT | Identify what files you made changes to in this chat (Do not run git commands yet). Combine the files into commit groups based on the changes you made. For example, if you added a button to a certain model, but you had to update the 2 other files to make it work, that would qualify for 1 commit group. For each commit group, create an informative but concise commit message that clearly articulates what changes were made, how, and why. These should be detailed enough to provide enough context to the reader to identify the reasoning behind the change (what, how, and why). Finally, commit these commit groups one by one. | `[]` | 2025-11-05T05:01:58+00 |
| 2 | Commit Update Chunks to GIT | (same as v1 + "that follows the same style and format as the previous commits") | `[]` | 2025-11-05T05:03:38+00 |
| 3 | Commit Update Chunks to GIT | Identify which files you made changes to in this chat or have not committed. (...) Finally, for each commit group, output the commit messages in Markdown code blocks IN CHAT. | `[]` | 2025-11-05T19:49:48+00 |
| 4 | Commit Update Chunks to GIT | Identify which files you made changes to in this chat or are still uncommitted. (...) | `[]` | 2025-12-26T21:10:34+00 |
| 5 | Commit Update Chunks to GIT | (...get minimum last 5 commit messages to use as reference...) | `[]` | 2025-12-29T17:41:32+00 |

**Current differs:** YES - Current has "last 10" instead of "last 5"

---

### 4. Make Changes After Code Review
**prompt_id:** `2b9ec168-8386-4b00-b158-aaba564ef999`
**Copy events:** 67 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | make code review changes (codex) - after code review | Based on the findings of your code review, make the needed changes to correct all the issues that you have identified. Ensure that before making a change, you fully think through the best and most optimal way to fix this change for long-term stability and adherence to all code rules and best coding practices. | `[]` | 2025-09-29T13:49:02+00 |
| 1 | make code review changes (codex) - after code review | Based on the findings of your code review, make the needed changes to correct all the issues that you have identified. Before starting, verify that the issue is still present before fixing it. Also ensure that before making a change, you fully think through the best and most optimal way to fix this change for long-term stability and adherence to all code rules and best coding practices. | `[]` | 2025-11-20T19:25:02+00 |
| 2 | Make Changes After Code Review | ## Goal\nImplement the approved changes from the code review. For each item, verify the issue still exists, design the optimal fix, then execute...\n\n## Input\n{{Comments To Implement}}\n\n## Process\n... | `["Comments To Implement"]` | 2025-12-26T20:33:36+00 |

**Changes:** Complete rewrite in v2 - new structured format with variables
**Current matches:** v2

---

### 5. Code Review for Uncommitted Changes
**prompt_id:** `e3af62de-5fe0-4e36-b1b7-e21a51c9889f`
**Copy events:** 50 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | code review - uncommited | Code review time. Review all uncommited code. For each change made, review it for bugs, double-check that it follows all the code rules, ensure that it is optimized for long-term stability, and finally ensure that the changes have the intended effect on the codebase (fully meeting requirements and plans). Then output a comprehensive report outlining all changes made and your analysis of each. | `[]` | 2025-09-29T14:01:01+00 |
| 1 | Code Review for Uncommitted Changes | ## Goal\nReview all uncommitted code in the current branch...\n\n## Review Process\n1. **Correctness:**...\n2. **Code Standards:**...\n3. **Stability:**...\n4. **Requirements Alignment:**...\n\n## Output Format\nOutput a numbered list of issues found... | `[]` | 2025-12-29T17:29:55+00 |
| 2 | Code Review for Uncommitted Changes | (same as v1 but "Output a numbered list of ALL the issues found") | `[]` | 2026-01-05T17:27:51+00 |

**Changes:** v0->v1: Complete restructure; v1->v2: Added "ALL"
**Current matches:** v2

---

### 6. Identify Status and Next Steps from Plan
**prompt_id:** `1ef4db0d-3eb9-4f5e-a30a-23136d60ebe1`
**Copy events:** 42 | **Versions discovered:** 8 (MOST EVOLVED)

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | IDENIFY CODEBASE STATUS AND NEXT STEP | Based on the planning files what is the current state of the codebase and what is the next step? | `[]` | 2025-09-29T13:02:39+00 |
| 1 | Codebase Status and Identify Next Steps | (same body) | `[]` | 2025-10-02T16:31:27+00 |
| 2 | Identify Status and Next Steps from Plan | Based on the planning files what is the current state of the codebase and what is the next step? {{Planning File Names}} | `["Planning File Names"]` | 2025-10-02T16:32:45+00 |
| 3 | Identify Status and Next Steps from Plan | Based on the planning files (@{planning file names}) what is the current state of the codebase and what is the next step? | `["Planning File Names"]` | 2025-10-16T14:55:10+00 |
| 4 | Identify Status and Next Steps from Plan | Based on the planning files (@{{Planning File Names}}) what is the current state of the codebase and what is the next step? | `["Planning File Names"]` | 2025-10-17T11:22:10+00 |
| 5 | Identify Status and Next Steps from Plan | Based on the planning files (@{{Planning File Names}}), what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually search, read, and explore to identify the current state. | `["Planning File Names"]` | 2025-11-08T03:15:53+00 |
| 6 | Identify Status and Next Steps from Plan | (...Actually explore to identify the current state.) | `["Planning File Names"]` | 2025-11-16T03:25:37+00 |
| 7 | Identify Status and Next Steps from Plan | Based on the planning file named:"{{Planning File Name}}", what is the current state of the codebase and what is the next step? Do not make assumptions about the state of the codebase. Actually explore to identify the current state (use explore agent). | `["Planning File Name"]` | 2025-12-26T10:06:12+00 |

**Current matches:** v7

---

### 7. V1 - PR Comment Review
**prompt_id:** `80996ca1-6b87-4af9-a9e5-56bb127e21ee`
**Copy events:** 25 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | PR Comment Review - NEED TO UPDATE | I had a few devs review my PR for this branch and they left some pretty detailed comments. Review the comments they left (attached below) and help me determine which to implement and which to disregard. For each comment, first articulate what issue it is identifying or what change it is suggesting to make, then review the codebase and explain what the current situation is. After that, make an analysis on whether or not the suggested change/suggestion is a good idea to implement (include reasoning and an explanation of why). | `[]` | 2025-10-04T02:43:15+00 |
| 1 | PR Comment Review - NEED TO UPDATE | (same body + {{All Comments}}) | `["All Comments"]` | 2025-10-16T14:38:46+00 |

**Current differs:** YES - Title changed to "V1 - PR Comment Review", body has additional text

---

### 8. Create an Implementation Plan based on planning files - Claude Code
**prompt_id:** `7c2bdfed-a78a-49ee-8809-ccf043f6f44d`
**Copy events:** 17 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Create an Implementation Plan based on planning files - Claude Code | Goal: Create a Implementation Plan file in the same style and format as the rest of the Implementation Plans in @"Planning and Task Files"... (original format) | `[]` | 2025-10-16T22:32:57+00 |
| 1 | Create an Implementation Plan based on planning files - Claude Code | (added **STEP 1 - BEFORE WRITING** and **STEP 2 - WHILE WRITING** sections) | `[]` | 2025-11-19T13:13:03+00 |
| 2 | Create an Implementation Plan based on planning files - Claude Code | (added "(use your explore capability)" to STEP 1) | `[]` | 2025-12-25T16:02:04+00 |

**Current matches:** v2

---

### 9. Make MGMT 352 Lecture Title in granola - School
**prompt_id:** `53d0fce3-0b84-4c5d-a782-4840ad26bea0`
**Copy events:** 16 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Make MGMT 352 Lecture Title in granola - School | Create a title for this lecture similar to the example titles included below. This is lecture {{lecture number}} \n\nExample Titles:... | `["lecture number"]` | 2025-10-23T12:47:04+00 |
| 1 | Make MGMT 352 Lecture Title in granola - School | (...The title TOTAL characters has to be UNDER 260 characters...) | `["lecture number"]` | 2025-11-01T18:35:43+00 |
| 2 | Make MGMT 352 Lecture Title in granola - School | (...UNDER 160 characters...) | `["lecture number"]` | 2025-11-18T01:38:57+00 |

**Current matches:** v2

---

### 10. v2.1 - 2 lecture create comprehensive notes
**prompt_id:** `c7c90b6d-fa70-4c2e-a7d8-a0556aed77cc`
**Copy events:** 14 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | v2.1 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - focus on transcript - school | (original template with Reference Sources format issue) | `["Lecture Number 1", "Lecture Number 2", "Lecture 1 Transcript", "Lecture 1 Slides", "Lecture 2 Transcript"]` | 2025-10-19T16:36:29+00 |
| 1 | v2.1 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - focus on transcript - school | (fixed Reference Sources, added "on the exam" criteria) | `["Lecture Number 1", "Lecture Number 2", "Lecture 1 Transcript", "Lecture 1 Slides", "Lecture 2 Transcript"]` | 2025-11-08T00:56:11+00 |

**Current differs:** YES - Title has "Model: GPT-5.1-Thinking with Study Mode" added

---

### 11. Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings
**prompt_id:** `937a7e7a-6538-430e-b6cc-249d9885900d`
**Copy events:** 13 | **Versions discovered:** 4

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Create a Good Title for Granola Meeting Notes | (1 example title) | `[]` | 2026-01-08T20:35:47+00 |
| 1 | Create a Good Title for Granola Meeting Notes | (2 example titles) | `[]` | 2026-01-08T20:39:05+00 |
| 2 | Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings | (same, title changed) | `[]` | 2026-01-08T20:51:22+00 |
| 3 | Granola Meeting Notes Title Generation - 1-on-1 Sessions / Meetings | (3 example titles) | `[]` | 2026-01-10T21:55:55+00 |

**Current matches:** v3

---

### 12. v1 - adding a new feature idea
**prompt_id:** `aaf2dd8d-4db0-4740-b599-5cf6c816eb92`
**Copy events:** 12 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | adding a new feature idea | I would like to add a new feature to this codebase. Keep asking me questions until you are 100% confident of what feature I wanted to add... | `[]` | 2025-09-30T15:10:31+00 |
| 1 | adding a new feature idea | (...Before asking me any questions, try and find the answer in the codebase yourself...) | `[]` | 2025-11-05T13:07:04+00 |
| 2 | adding a new feature idea | (added Question Criteria section, added {{Enter Your Idea}} variable) | `["Enter Your Idea"]` | 2025-11-07T18:29:34+00 |

**Current differs:** YES - Title has "v1 - " prefix added

---

### 13. Make ECON 252 transcript title - school
**prompt_id:** `011cd1a6-7153-4725-845d-b9ab4b417ad6`
**Copy events:** 11 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Make ECON 252 transcript title (copies finished title) - Study | L{{Current Lecture Number}} - Transcript - Ch {{Chapter Number}} - {{Chapter Title}} - ECON 252 | `["Current Lecture Number", "Chapter Number", "Chapter Title"]` | 2025-10-19T16:09:20+00 |
| 1 | Make ECON 252 transcript title (copies finished title) - school | (same body, title suffix changed) | `["Current Lecture Number", "Chapter Number", "Chapter Title"]` | 2025-10-25T19:20:05+00 |

**Current matches:** v1

---

### 14. Create List of Missing Topics from my notes - school
**prompt_id:** `9b30ba85-9d1b-4b23-9407-97bca34c3c5f`
**Copy events:** 11 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Create List of Missing Topics from my notes compared to project files - school | Goal: create a list of missing topics... (original format) | `["Notes File Name"]` | 2025-10-25T18:51:41+00 |
| 1 | Create List of Missing Topics from my notes compared to project files - school | (added "on the exam" criteria) | `["Notes File Name"]` | 2025-11-08T15:21:50+00 |
| 2 | Create List of Missing Topics from my notes compared to project files - school | (added markdown headers, enhanced instructions) | `["Notes File Name"]` | 2025-11-23T21:05:04+00 |

**Current matches:** v2

---

### 15. Review Plan
**prompt_id:** `a64d3819-feca-4798-be4e-ddb10dee2576`
**Copy events:** 8 | **Versions discovered:** 3

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Review Plan | Review the following <planname> plan... <PlanName>{{Plan Name}}</PlanName> | `["Plan Name"]` | 2025-09-30T16:11:24+00 |
| 1 | Review Plan | Review the following {{Plan Name}} plan... (removed XML tags) | `["Plan Name"]` | 2025-10-25T22:12:33+00 |
| 2 | Review Plan | Review the following @"{{Plan Name}}" plan... | `["Plan Name"]` | 2025-11-19T16:30:48+00 |

**Current matches:** v2

---

### 16. MGMT 306 HW Problem Teaching / Walkthrough - school
**prompt_id:** `68fe9309-2e62-44d0-b981-656aee7ec2c4`
**Copy events:** 8 | **Versions discovered:** 5

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | MGMT 306 HW Problem Teaching / Walkthrough | (original with 4 variables including duplicate) | `["Problem Number", "Full Problem Text", "Problem Part To Do", "Problem Part To Do (a, b)"]` | 2025-11-24T15:31:51+00 |
| 1 | MGMT 306 HW Problem Teaching / Walkthrough | (removed duplicate variable) | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` | 2025-11-24T15:32:25+00 |
| 2 | MGMT 306 HW Problem Teaching / Walkthrough | (added FullProblemText XML tag inline) | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` | 2025-11-24T15:55:49+00 |
| 3 | MGMT 306 HW Problem Teaching / Walkthrough | (newline before XML tag) | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` | 2025-11-24T16:05:12+00 |
| 4 | MGMT 306 HW Problem Teaching / Walkthrough - school | (title changed) | `["Problem Number", "Full Problem Text", "Problem Part To Do (a, b)"]` | 2025-12-07T21:37:23+00 |

**Current differs:** YES - FullProblemText section removed from current

---

### 17. /PR Comments to XML - Claude Code Command
**prompt_id:** `cd9b776e-18c6-4877-bfa1-be099fd4c5dc`
**Copy events:** 7 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | /PR Comments to XML - Claude Code Command | (9687 chars - original version) | `[]` | 2026-01-05T02:32:02+00 |

**Current differs:** YES - Current has 12781 chars (added sections)

---

### 18. v2 - create comprehensive notes - school
**prompt_id:** `1d9dccb9-f8a4-4c0d-b7f1-03153347704c`
**Copy events:** 6 | **Versions discovered:** 4

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | v2 - create comprehensive notes (use study mode) - focus on transcript | (angle bracket placeholders as literal text) | `[]` | 2025-10-08T14:12:36+00 |
| 1 | v2 - create comprehensive notes (use study mode) - focus on transcript | (proper variables added) | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` | 2025-10-16T19:17:39+00 |
| 2 | v2 - create comprehensive notes (use study mode) - focus on transcript | (added slide-by-slide sweep, Definitions Block) | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` | 2025-10-16T20:07:21+00 |
| 3 | v2 - create comprehensive notes (use study mode) - focus on transcript | (removed Definitions Block, added "Output in canvas") | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` | 2025-10-17T00:02:59+00 |

**Current differs:** YES - Title has " - school" suffix added

---

### 19. v3 - 2 lecture create comprehensive notes - school
**prompt_id:** `974159fb-f71b-418b-bfc8-a682bfba4c21`
**Copy events:** 4 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school | (10 formatting points including slide order point) | `["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]` | 2025-12-14T02:11:26+00 |
| 1 | v3 - 2 lecture create comprehensive notes (use study mode) with 2 lectures - Model: GPT-5.2-Thinking with Study Mode - school | (9 formatting points - removed slide order point) | `["Lecture 1 Slides", "lecture_number_1", "lecture_number_2", "Lecture 1 Transcript", "Lecture 2 Transcript"]` | 2025-12-14T17:21:15+00 |

**Current differs:** YES - Added point about "derived directly from the transcript's phrasing"

---

### 20. new project claude planning prompt (NEED TO FINISH IT)
**prompt_id:** `35792ba0-fbf3-4a36-be99-78ce16064088`
**Copy events:** 3 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | new project claude planning prompt (NEED TO FINISH IT) | (uses `(<Initial_Idea_Brain_Dump>)` with underscores) | `["Initial Idea Brain Dump"]` | 2026-01-08T15:14:20+00 |

**Current differs:** YES - Uses `(<InitialIdeaBrainDump>)` camelCase

---

### 21. Create a Features and Function File based on planning files - Claude Code
**prompt_id:** `34abb60d-1248-448e-a295-0e4e6d542e38`
**Copy events:** 2 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Create a Features and Function File based on planning files - Claude Code | Goal: Create a features and function file... (original shorter format) | `[]` | 2025-10-16T22:06:16+00 |
| 1 | Create a Features and Function File based on planning files - Claude Code | (added Constraints section, rewrote Format and Style) | `[]` | 2025-11-08T02:51:58+00 |

**Current matches:** v1

---

### 22. ChatGPT School Project Instructions - school
**prompt_id:** `e4dc2a81-1e49-4d1e-8fec-3013cce420df`
**Copy events:** 2 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | ChaGPT School Project Instructions - school | (typo in title - missing 't') | `[]` | 2025-10-19T16:21:28+00 |

**Current differs:** YES - Title typo fixed to "ChatGPT"

---

### 23. v1 - create comprehensive notes - school
**prompt_id:** `d2732e54-70ae-4197-ba91-aaab8c4ac5e0`
**Copy events:** 1 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | create comprehensive notes (use study mode) - focus on transcript | (original without title prefixes/suffixes) | `["Lecture Number", "Lecture Transcript", "Lecture Slides"]` | 2025-10-04T00:00:00+00 |

**Current differs:** YES - Title has "v1 - " prefix and " - school" suffix added

---

### 24. Better ChatGPT Titles
**prompt_id:** `f5f0cc99-7291-4208-9b9e-a173adbaafa2`
**Copy events:** 1 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | Better ChatGPT Titles | (original without FIX THESE section) | `[]` | 2025-11-15T00:00:00+00 |

**Current differs:** YES - Added "FIX THESE:" section with ChatGPT URLs

---

### 25. buildpurdue long form content (FROM v1)
**prompt_id:** `590d513e-3514-4d37-90a3-816c5a9d77ed`
**Copy events:** 2 | **Versions discovered:** 2

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | buildpurdue long form content | Based on the following transcript, make descriptions for the following:\n\n1) A Linkedln post. Make sure to thank the interviewer and the interviewee. Also make sure to tag Purdue University\nPurdue Polytechnic\nPurdue Computer Science\nPurdue University College of Education\nPurdue University College of Liberal Arts\nPurdue University College of Engineering\nPurdue University Daniels School of Business\nPurdue Burton D. Morgan Center for Entrepreneurship\nPurdue University College of Health and Human Sciences\nAnd to add hastags. Also put in a placeholder to link the youtube interview.\n\n2) X Make an X post announcing the interview and thanking . Make sure to include a placeholder for the link to the interview.\n\n3) Make a Discord Announcement announcing that the interview is live. Include a placeholder for the link to the interview. | `[]` | 2025-11-11T22:39:57+00 |
| 1 | buildpurdue long form content | (Major restructuring - detailed platform-specific instructions with brand guide, 6 variables added) | `["company", "transcript", "interviewee", "youtube link", "interviewer name", "interviewee title"]` | 2025-12-01T20:48:35+00 |

**Current matches:** v1

---

### 26. Generate Interview Clip Social Posts (BuildPurdue) (FROM v1)
**prompt_id:** `a31fca67-8d6a-415c-a562-a4e9e0faf39f`
**Copy events:** 1 | **Versions discovered:** 1

| ver | title | body | variables | created_at |
|-----|-------|------|-----------|------------|
| 0 | buildpurdue short-form descriptions | Based on the following the following transcript of an interview clip, create the following:\n\n1) A TikTok description. Include a title and description. Keep in mind TikTok is limited to 2200 characters and 5 hashtags. In the first line of the description, say there is a link in bio for the full interview.\n\n2) An Instagram Reels description. Make the first line say to comment "learn more" and you will receive a DM with the link to the full interview (make sure to follow us first).\n\n3) Make a YouTube Shorts description for the video.\n\n4) Make an X post that is a caption to this interview clip. | `[]` | 2025-11-11T22:39:34+00 |

**Current differs:** YES - Title changed to "Generate Interview Clip Social Posts (BuildPurdue)", body restructured with variables

---

## Prompts with NO Discovered Versions (14 prompts)

These prompts had copy events but all events matched the current state:

| Prompt | Copy Events | Notes |
|--------|-------------|-------|
| Self reflection | 72 | Unchanged since creation 2025-09-29 |
| code review - in this chat | 21 | Unchanged since creation |
| V2 - PR Comment Review | 16 | Unchanged since creation 2025-12-26 |
| V2 - Custom Instructions for ChatGPT, Claude | 4 | Unchanged since creation 2025-11-21 |
| review changes | 3 | Unchanged since creation |
| NotebookLM Podcast for Exam Prep | 2 | Unchanged since creation |
| WORKFLOW - ChatGPT Recommendation | 1 | Single event matches current |
| /catchup - claude code command | 1 | Single event matches current |
| Create Visual Menu Based on Attached Images | 1 | Single event matches current |
| context 7 add | 1 | Single event matches current |

---

## Additional Single-Event Prompts with Changes (4 prompts)

### Task Execute (based on plan or task list)
**prompt_id:** `61685e87-e781-40a9-813a-6b6c45c1bbcb`
- Copy event had hard-coded "TITLE_GENERATOR_PLAN.md"
- Current has variable placeholder `{Name of task list or planning document}`

### V2 - adding a new feature to a project
**prompt_id:** `17a1a6c5-4e01-45d6-885f-5d4c67011625`
- Copy event captured specific braindump about version history feature
- Current is empty template

### LinkedIn post prompt - claude
**prompt_id:** `c27df51b-d119-4c16-ae18-cfa6a79bd85a`
- Copy event captured specific Whop event recap content
- Current is generalized template with placeholders

### How to Improve Prompts after mistakes for AI Agents
**prompt_id:** `ac71ec9c-7ab9-49b5-9743-dbc16853d2e4`
- Title changed: "for AI Agents" -> "after mistakes for AI Agents"

---

## Verification Checklist

Before Phase 8.2 migration:

1. [x] Merged v2 base with 2 prompts from v1
2. [ ] Review prompts with discovered versions - do changes look correct?
3. [ ] Review prompts where current differs from last copy - note for potential data loss
4. [ ] Confirm version numbering strategy (0, 1, 2... for discovered, existing v1 becomes highest)
5. [ ] Verify timestamps align with when edits were made

---

*Generated by Phase 8.1 - Version History Discovery (Final Merged)*
*Ready for Phase 8.2: Apply Verified Version History to Database*
