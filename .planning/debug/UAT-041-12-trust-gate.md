---
status: diagnosed
trigger: "UAT-041-12-trust-gate: GitHub workflow claude.yml allows anyone to trigger @claude by commenting"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - The claude.yml workflow lacks author_association checks, allowing any commenter to trigger the workflow
test: Read workflow file and verify no role-based guards exist
expecting: Find missing MEMBER/OWNER/COLLABORATOR checks in the `if:` condition
next_action: Document root cause and return diagnosis

## Symptoms

expected: Only trusted roles (MEMBER, OWNER, COLLABORATOR) should trigger @claude workflow
actual: Anyone who can comment can trigger the workflow
errors: Security risk - quota exhaustion, potential secrets exposure
reproduction: External contributor comments with @claude on any issue/PR
started: Code review finding from PR #41

## Eliminated

(none - hypothesis confirmed on first investigation)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: .github/workflows/claude.yml lines 15-19
  found: |
    The `if:` condition only checks for @claude mention in comment body:
    ```yaml
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
    ```
  implication: No author_association check means ANY GitHub user who can comment can trigger the workflow

- timestamp: 2026-02-03T00:00:00Z
  checked: GitHub repository visibility
  found: |
    Repository: https://github.com/ElliotDrel/Prompt-Vault
    Visibility: PUBLIC ("private": false, "visibility": "public")
  implication: Anyone on the internet can create an account and comment to trigger the workflow

- timestamp: 2026-02-03T00:00:00Z
  checked: Secrets exposed in workflow
  found: |
    Line 37: `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`
    This secret is used to authenticate with Claude Code API
  implication: |
    While secrets are not directly leaked in logs, the workflow RUNS with this token,
    meaning attackers can exhaust Claude API quota by spam-commenting @claude

- timestamp: 2026-02-03T00:00:00Z
  checked: GitHub author_association values
  found: |
    GitHub provides `github.event.comment.author_association` with values:
    - OWNER: Repository owner
    - MEMBER: Organization member
    - COLLABORATOR: Invited collaborator
    - CONTRIBUTOR: Has merged PRs
    - FIRST_TIME_CONTRIBUTOR: First PR
    - FIRST_TIMER: First-ever GitHub contribution
    - NONE: No relationship to repo
  implication: The workflow should check for OWNER, MEMBER, or COLLABORATOR at minimum

## Resolution

root_cause: |
  The `.github/workflows/claude.yml` workflow is missing author_association guards.

  **Current state (lines 15-19):** Only checks if comment contains "@claude"
  **Missing:** Check that commenter is MEMBER, OWNER, or COLLABORATOR

  **Risk for this PUBLIC repository:**
  1. QUOTA EXHAUSTION: Any GitHub user can spam-comment @claude to burn API credits
  2. ABUSE POTENTIAL: Attackers could use Claude to generate malicious content in issues/PRs
  3. CI RESOURCE WASTE: Each trigger runs ubuntu-latest, consuming GitHub Actions minutes

  **Expected fix pattern:**
  ```yaml
  if: |
    (
      github.event.comment.author_association == 'OWNER' ||
      github.event.comment.author_association == 'MEMBER' ||
      github.event.comment.author_association == 'COLLABORATOR'
    ) && (
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      ...
    )
  ```

fix: (not applied - diagnosis only mode)
verification: (not applicable)
files_changed: []
