# Prompt Vault

## What This Is

Prompt Vault is a React-based prompt management application that helps users store, organize, and reuse text prompts with variable substitution. Users authenticate via Supabase (Google OAuth or magic links), create prompts with placeholders like `{{name}}`, fill in variables on-demand, and track their copy usage over time. The app provides a clean, focused interface for managing prompt templates without the complexity of larger writing tools.

## Core Value

Never lose work. Every prompt edit is automatically preserved with complete history, clear diffs showing exactly what changed, and confident one-click revert to any previous state.

## Requirements

### Validated

<!-- Capabilities already shipped and working in production -->

- ✓ User authentication with Google OAuth and magic link email (Supabase Auth) — existing
- ✓ Prompt CRUD operations with title, body, and variable placeholders — existing
- ✓ Automatic variable detection from `{{placeholder}}` syntax with color-coded highlighting — existing
- ✓ Copy-to-clipboard with variable substitution (modal dialog for input) — existing
- ✓ Pin/unpin prompts for quick access — existing
- ✓ Copy event tracking with full history (what was copied, when, variable values used) — existing
- ✓ Usage statistics dashboard (total prompts, copies, time saved with configurable multiplier) — existing
- ✓ Real-time synchronization across browser sessions via Supabase realtime — existing
- ✓ Row-level security (RLS) enforcing user data isolation — existing
- ✓ Remote-only Supabase development workflow (no local Docker) — existing
- ✓ Context-based state management (AuthContext, PromptsContext, CopyHistoryContext) — existing
- ✓ TanStack Query for server state caching with background refresh — existing

### Active

<!-- Current scope - building toward these with version history feature -->

- [ ] Version tracking for prompt edits (title, body, variables changes)
- [ ] Immutable version snapshots stored in `prompt_versions` table
- [ ] Initial prompt creation captured as v1 in history
- [ ] Modal UI with time-based version list (Today, Yesterday, Last 7 days, monthly groups)
- [ ] Inline diff highlighting (green for additions, red for deletions)
- [ ] Variable change visualization (chips with +/- badges)
- [ ] Comparison modes: diff from previous version OR diff from current version
- [ ] One-click revert to any previous version
- [ ] Auto-save current state before revert (ensures no data loss)
- [ ] History button accessible from both view mode and edit mode
- [ ] Paginated version fetching for prompts with extensive history
- [ ] Skip version creation for metadata-only changes (pin state, usage counters)
- [ ] Database functions for version CRUD (`create_prompt_version`, `get_prompt_versions`)
- [ ] Storage adapter integration (modify `addPrompt` and `updatePrompt` methods)
- [ ] TypeScript interfaces for version data structures

### Out of Scope

<!-- Explicit boundaries with reasoning -->

- Background consolidation job (Phase 6 in original plan) — Defer until storage needs prove it's necessary. Ship core feature first, optimize later based on real usage patterns.
- Named/starred versions — Keep v1 simple with automatic timestamps only. Can add milestone marking later if user feedback requests it.
- Real-time version list updates — Version list refreshes on user action only. Realtime publication will be enabled for future-proofing but not actively subscribed.
- Comparison between arbitrary versions — v1 only supports "previous" or "current" comparison. Arbitrary version-to-version diff adds UI complexity without clear user value yet.
- Version export/import — Not needed for core use case. Users can already copy prompt content manually.
- Version search/filtering — History grouping by time period provides sufficient navigation for expected version counts.
- User attribution per version — Single-user app context. All versions belong to authenticated user.
- Bulk version operations — No delete/cleanup UI needed if consolidation is deferred.

## Context

**Technical Environment:**
- React 18.3 SPA with TypeScript 5.5
- Supabase backend (auth, database, realtime) with remote-only development
- TanStack Query for server state caching
- shadcn/ui component library (Radix UI + Tailwind CSS)
- Vite build tool with HMR

**Existing Patterns:**
- Context API for global state, never direct storage imports from components
- Storage adapter abstraction layer (`src/lib/storage/supabaseAdapter.ts`)
- Async operations with loading/error states in all contexts
- Modal dialogs for complex flows (variable input, confirmations)
- Immutable history pattern already established with `copy_events` table

**User Research:**
- Feature request inspired by Google Docs version history UX
- User wants safety net for prompt editing (reversible changes)
- User values seeing "what changed" more than "when it changed"
- User prefers automatic timestamps over manual version naming
- User expects instant revert without losing current work

**Known Issues to Address:**
- Currently no way to recover from accidental prompt edits
- No visibility into how prompts evolved over time
- Users hesitant to make major prompt changes due to fear of losing previous versions

## Constraints

- **Remote-only Supabase**: All migrations pushed to remote immediately via `npx supabase db push`. No local Docker setup. Follow established workflow documented in CLAUDE.md.
- **Performance**: Modal must load versions within 500ms for typical history sizes. Diff rendering must handle large prompts (1000+ words) without UI freezing. Paginated loading required.
- **Security**: Version history must respect existing RLS policies. Users can only access versions of their own prompts. `auth.uid() = user_id` on all version table policies.
- **Storage growth**: Design schema to support future consolidation even though v1 defers the background job. Include `is_consolidated` and `consolidation_group_id` columns for forward compatibility.
- **Backward compatibility**: Existing prompts have no version history. Empty state must handle gracefully. First edit after feature launch creates v1.
- **Context pattern**: All version operations go through contexts, never direct Supabase calls from components. Follow existing `PromptsContext` pattern.

## Key Decisions

<!-- Decisions made during planning that constrain implementation -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Save OLD state on edit, not new state | Current prompt always reflects "live" version. History stores what it looked like BEFORE each change. Simpler mental model. | — Pending |
| Immutable snapshots, not deltas | Easier to query and display. No reconstruction logic needed. Storage cost acceptable for text content. | — Pending |
| Skip versions for metadata changes | Pin state and usage counters don't need version tracking. Reduces noise in history, keeps focus on content changes. | — Pending |
| Word-level diff using `diff` npm package | Lightweight, well-maintained library. Word-level more readable than character-level for prose content. | — Pending |
| Modal dialog UI pattern | Matches existing app patterns (variable input modal, confirmation dialogs). No new routing needed. Familiar UX. | — Pending |
| Auto-save before revert | Builds user trust. Nothing ever lost. Current state becomes newest version automatically. | — Pending |
| Paginated version fetching | Future-proofs for high-frequency editors. React Query caching minimizes redundant fetches. | — Pending |
| Defer consolidation to Phase 6 | Ship core feature first. Optimize storage later based on real usage data. Avoid premature optimization. | — Pending |
| Time-based grouping with expandable sections | Scannable at a glance. Mirrors Google Docs pattern users already understand. Reduces initial visual complexity. | — Pending |
| Create v1 on first edit, not prompt creation | Avoids backfilling existing prompts. Graceful rollout. Empty state handles new vs existing prompts uniformly. | — Pending |

---
*Last updated: 2026-01-09 after initialization*
