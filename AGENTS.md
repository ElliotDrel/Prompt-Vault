# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Prompt Vault codebase.

## 🚨 MANDATORY: Read This File FIRST

**CRITICAL RULE**: Before making ANY assumptions about tools, workflows, or architecture:
1. **READ this entire CLAUDE.md file thoroughly**
2. **CHECK existing code patterns and imports**
3. **VERIFY current project status and phase completion**
4. **UNDERSTAND the established workflows before suggesting alternatives**

**Failure to read documentation first leads to:**
- Wasted time on incorrect approaches
- Contradicting established workflows
- Making assumptions about missing tools that actually exist
- Implementing solutions that conflict with existing architecture

### Supabase Remote Development

**CRITICAL**: This project uses **REMOTE-ONLY** Supabase development. **NO local Docker or `supabase start` commands.**

#### One-Time Setup
```bash
# Link CLI to remote Supabase project (run once per machine)
npx supabase link --project-ref hupdhjdasqgfcabaiiwa
```

#### Daily Workflow
```bash
# Create migration
npx supabase migration new <name>

# Apply migrations to remote database
npx supabase db push

# Generate TypeScript types from remote schema (PowerShell-safe)
npx supabase gen types typescript --linked --schema public | Out-File -Encoding utf8 src/types/supabase-generated.ts

# If using bash/zsh instead:
# npx supabase gen types typescript --linked --schema public > src/types/supabase-generated.ts

# Pull remote schema changes (team collaboration)
npx supabase db pull

# List migration status
npx supabase migration list
```

#### Forbidden Commands
```bash
❌ npx supabase start                        # NO local Docker
❌ npx supabase stop                         # NO local services
❌ npx supabase db reset                     # NO local reset
❌ npx supabase gen types typescript --local # NO local types
❌ npx supabase functions serve              # NO local functions
```

**Why Remote-Only?**
- No Docker dependency (Windows compatibility)
- Version-controlled migrations
- No local/remote schema drift
- Direct deployment to production environment

**Command Hygiene**
- Never suggest local Supabase commands in responses; use migrations or remote-safe fixes instead.
- Keep docs/examples aligned with the remote-only workflow (no `npx supabase functions serve` references).
- Ensure generated files are UTF-8 (PowerShell `>` writes UTF-16 and can break ESLint parsing).

## Architecture

### Authentication Flow
- Uses Supabase Auth with Google OAuth and email magic links (OTP)
- `AuthContext` (`src/contexts/AuthContext.tsx`) provides centralized auth state management
- Auth state persists across sessions and auto-refreshes tokens
- Token refresh events should not trigger data reloads; expose a stable `authUserId` and use it for data contexts and realtime filters
- Protected routes use `RequireAuth` component to enforce authentication (`src/components/auth/RequireAuth.tsx`)
- Magic link redirects include code exchange handled in `AuthContext.exchangeCodeForSession()`

#### OAuth Provider Setup
OAuth providers (Google, GitHub, etc.) must be configured in the Supabase dashboard before use:
1. Navigate to Supabase Dashboard → Authentication → Providers
2. Enable the desired OAuth provider (e.g., Google)
3. Configure OAuth credentials:
   - Client ID (from provider's developer console)
   - Client Secret (from provider's developer console)
4. Set authorized redirect URLs:
   - Development: `http://localhost:2902/auth`
   - Production: `https://yourdomain.com/auth`
5. Save configuration

**Note**: OAuth credentials are managed entirely through the Supabase dashboard - no environment variables needed in the application. The `signInWithProvider` function in `AuthContext` accepts any valid Supabase `Provider` type for extensibility.

### Routing Structure
- Uses React Router data router API with `createBrowserRouter` and `RouterProvider`
- Routes: `/` (Landing - public), `/auth` (Auth - public), `/dashboard` (Dashboard - protected), `/dashboard/prompt/new` (New Prompt - protected), `/dashboard/prompt/:promptId` (Prompt Detail - protected), `/history` (Copy History - protected), `*` (NotFound)
- `/dashboard` supports nested subroutes (for example, `/dashboard/prompt/...` workflows)
- All routes wrapped in `AuthProvider` for consistent auth state
- Protected routes use `RequireAuth` component in the route configuration

### Supabase Integration
- Client configured in `src/lib/supabaseClient.ts` with environment variable validation
- Environment variables required: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Helper functions provided for common auth operations
- **Remote-only development**: CLI operates against hosted Supabase project
- Migrations stored in `supabase/migrations/` and applied via `npx supabase db push`
- Project ref: `hupdhjdasqgfcabaiiwa` (configured in `.mcp.json` for MCP server)

### Supabase MCP Server (Model Context Protocol)

**What it is**: Development tool for exploring and querying the Supabase database during development.

**Configuration**: Project-specific `.mcp.json` in repository root:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=hupdhjdasqgfcabaiiwa"
    }
  }
}
```

**When to Use MCP vs CLI**:
- ✅ **Use MCP for**: Schema exploration, quick queries, debugging, drafting migrations
- ✅ **Use CLI for**: Production deployments, applying migrations, generating types, managing secrets

**Troubleshooting**:
- If MCP connects to wrong project, check `~/.claude.json` for global `mcpServers` config
- Global config overrides project `.mcp.json` - remove global config to use project config
- Restart Claude Code after changing `.mcp.json`
- Verify connection: MCP tools should show project ref `hupdhjdasqgfcabaiiwa`

### Edge Functions Development

**CRITICAL**: Edge Functions follow the **REMOTE-ONLY** development pattern. **NO local testing with Docker.**

#### File Structure
```
supabase/functions/
  _shared/              # Shared utilities (imported by all functions)
    claude.ts          # Claude API utility
    types.ts           # Shared type definitions
    README.md          # Documentation
  function-name/
    index.ts           # Function entry point
```

#### Development Workflow
```bash
# 1. Create function directory
mkdir -p supabase/functions/my-function

# 2. Create index.ts with function logic

# 3. Deploy to remote (this is your "test")
npx supabase functions deploy my-function

# 4. Test the deployed function
curl -i --location --request POST \
  'https://hupdhjdasqgfcabaiiwa.supabase.co/functions/v1/my-function' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'

# 5. Iterate: edit code, deploy, test

# 6. Delete function when no longer needed
npx supabase functions delete my-function
```

## Codex Agent Notes (2025-10-16)

- When fixing placeholder substitution, adjust shared helpers (such as `createVariableRegex`) so every consumer stays consistent and proximity checks retain their matching semantics.
- Keep sanitizers aligned with normalization rules; dedupe using `normalizeVariableName` (or an equivalent helper) to prevent hard-to-debug collisions during payload construction.
- For layered UI components, audit both layers before tweaking styles; remove redundant decoration from background overlays instead of altering the interactive surface.
- Large files can trigger command timeouts; use `Get-Content -TotalCount` or scoped `rg` queries to gather context quickly before editing.
- PowerShell git refs like `@{upstream}` must be quoted (e.g., `"@{upstream}"`) to avoid hash literal parsing errors.
- Quote triple-dot refs in PowerShell (e.g., `"BASE...HEAD"`) so `git diff` parses correctly.
- For route-specific document titles, set them in the page component and reset to the default on unmount; avoid live updates unless explicitly required.
- **Context dependencies**: Use primitive values (`user?.id`) not objects (`user`) to prevent re-renders on token refresh
- **Background refresh**: Add optional `silent` parameter to load functions; use separate `loading` and `isBackgroundRefresh` flags
- **Realtime subscriptions**: Always use silent mode for background updates to avoid spinner/unmount cycles

## Codex Agent Notes (2026-01-05)

- When editing `CLAUDE.md`, ensure `AGENTS.md` is synced (run `scripts/sync-agents.cjs` or update both files in the same change).
- Keep routing docs aligned with `src/App.tsx` (data router API, nested `/dashboard` subroutes, and prompt detail routes).
- Copy actions should consistently update stats and history via contexts; keep the clipboard payload unchanged.
- Realtime teardown on `CHANNEL_ERROR`/`CLOSED` should trigger resubscribe for existing subscribers to avoid silent drops.
- When de-duplicating adapter guards, use a shared helper and consider parallel updates in related contexts for consistency.
- Avoid success logs in realtime handlers; keep console output to actionable errors only.

## Codex Agent Notes (2026-01-08)

- When addressing review comments, scan for all occurrences with `rg` and note any similar patterns that remain out of scope.
- When React Query is gated by `enabled`, keep query keys aligned with real auth state (avoid dead "anonymous" fallbacks); add a short comment when using non-null assertions.
- When realtime callbacks trigger refetches, handle promise rejections (`void refetch().catch(...)`) with a contextual error message.
- Fail fast in mutations when `userId` is missing to surface clear client-side errors before adapter/RLS.
- For search/result caps, centralize the limit in config and surface a lightweight UI hint when the cap is reached.

## Claude Code Agent Notes (2026-01-13) - Version History Feature Retrospective

### RPC Function Design (Critical)
- **Parameter name mismatch**: SQL functions using `p_` prefix (e.g., `p_prompt_id`) don't match frontend TypeScript parameters (`prompt_id`). PostgREST resolves functions by **parameter names**, not positions. Always verify SQL signatures match frontend exactly.
- **Return format matters**: `RETURNS SETOF table` is not the same as returning a JSON object `{ versions: [...], total_count: N }`. Choose return format intentionally and document it.
- **Test RPC end-to-end**: Unit testing SQL functions is not enough - test from the frontend through PostgREST to catch interface mismatches early.

### Versioning Model Design
- **Define the model first**: Before implementing versioning, explicitly define: Does version N contain content BEFORE or AFTER the Nth save? We initially captured OLD state, but correct model is **Version N = content AFTER Nth save**.
- **Avoid separate "Current" concepts**: If every edit creates a version immediately, the latest version IS current. A separate "Current" entry creates confusion and UI complexity.
- **No "unsaved changes" in auto-save systems**: If edits save immediately, there are never unsaved changes. Don't add messaging that contradicts the system's actual behavior.

### UI State Logic Patterns
- **Position-based over content-based decisions**: For showing/hiding UI elements like "Revert" buttons, use `isLatestVersion` (position) rather than content comparison like `arePromptsIdentical()`. Position is deterministic; content comparison can have edge cases.
- **useEffect auto-selection conflicts**: If a useEffect auto-selects the first item, it will override manual user selections. Add guards like `&& !manuallySelected` to prevent conflicts.
- **Diff direction consistency**: Create a single utility function (`getComparisonPair()`) that determines which version is "old" vs "new" for diff computation. Don't scatter this logic across components.

### UAT-Driven Development
- **Plan for multiple UAT rounds**: First UAT round found 11 issues; fixes introduced 4 new issues requiring a second round. Budget time for iterative testing.
- **UAT reveals conceptual errors**: Unit tests catch bugs; UAT catches wrong mental models (like OLD vs NEW state capture). Both are necessary.
- **Document UAT issues systematically**: Create a single issues file per phase (e.g., `07-UAT-ISSUES.md`) tracking discovered → root cause → resolution → commit.

### Data Migration & Historical Reconstruction
- **Backfill can create duplicates**: When backfilling existing records as "version 1", check if a version 1 already exists (from prior operations).
- **Timestamps need verification**: When mining historical data (e.g., copy_events → prompt_versions), verify timestamps are logically consistent after insertion.
- **Dual analysis for validation**: When reconstructing history from indirect sources, run multiple analysis approaches (v1 vs v2) and reconcile differences.
- **Renumbering requires care**: When inserting discovered historical versions, you may need to renumber existing versions. Use CTEs and explicit ordering to avoid gaps.

### Database Migration Best Practices:
- **🚨 NEVER EDIT APPLIED MIGRATIONS**: Once a migration has been pushed to remote (`npx supabase db push`), NEVER edit the file. Supabase tracks migrations by **timestamp only**, not content. Editing creates a mismatch between local files and remote schema.
  - **How it works**: Remote migrations tracked in `supabase_migrations.schema_migrations` table with timestamp as unique ID
  - **Tracking**: Local migrations in `supabase/migrations/` directory, remote in `schema_migrations` table - only timestamps compared
  - **Symptom**: `npx supabase db push` says "Remote database is up to date" but schema doesn't match local migration files
  - **Detection**: Run `npx supabase migration list` to compare local vs remote, or query remote schema directly
  - **Fix**: Create a NEW migration to update the remote schema (forward-only approach)
  - **Example**: If you need to change a function signature, create a new migration with `DROP FUNCTION` + `CREATE FUNCTION`, don't edit the original migration
  - **Recovery**: If mismatches occur, use `npx supabase migration repair` to fix migration history table
- **Preview before applying**: Use `npx supabase db push --dry-run` to see what changes will be applied before committing
- **Handle teammate conflicts**: If teammate merges new migration, rename your migration file with new timestamp and run `npx supabase db push` (or `npx supabase db push --dry-run` to preview)
  ```bash
  # Example: Teammate merged migration while you were working
  git pull
  mv supabase/migrations/<old_time>_my_feature.sql supabase/migrations/<new_time>_my_feature.sql
  npx supabase db push  # Apply the renamed migration to remote
  ```
- **Detect schema drift**: Use `npx supabase db diff` to detect changes made through Dashboard that aren't in migration files
- **Document object dependencies**: Track triggers -> policies -> functions -> tables -> enums for removal order
- **Avoid double counting in views**: Pre-aggregate one-to-many tables before joining
- **Test end-to-end workflows**: Ensure navigation works after database changes
- **Use incremental migrations**: Separate schema changes from data fixes
- **Always verify CLI is linked**: Check project connection before pushing migrations (`npx supabase status`)
- **Preserve migration history**: Never delete migration files, even for removed features
- **Verify after push**: After applying migrations, verify the remote schema matches expectations using MCP SQL queries or `npx supabase migration list`

**Rationale**: This approach ensures all changes are version-controlled, reproducible, and eliminates dependency on local Docker setup while maintaining full control over project configuration.

**Real Example (2026-01-07)**: The `increment_prompt_usage` function was created as a two-parameter function and pushed to remote. Later, the migration files were edited to use a one-parameter signature (with `auth.uid()` internally). However, the remote DB still had the old two-parameter version, causing runtime errors. Fixed by creating migration `20260107150343_fix_increment_prompt_usage_signature_mismatch.sql` that explicitly dropped the old function and created the new one.

### SECURITY DEFINER Functions:
- **Always** add `SET search_path = public` to the function definition
- **Always** schema-qualify tables (`public.my_table`, not `my_table`)
- Auth triggers run in a different schema context; without explicit search_path they fail with "relation does not exist"

**Real Example (2026-01-13)**: `initialize_user_settings` trigger lacked `SET search_path = public`, breaking new user signups for 8 days until discovered. Fixed in `20260113201104_fix_initialize_user_settings_schema.sql`.

### Supabase Realtime Setup:
- **Enable first**: Dashboard → Database → Publications → `supabase_realtime` → Toggle tables ON
- **Verify RLS**: SELECT policy must exist for `auth.uid() = user_id`
- **Subscribe pattern**: Use `channel.subscribe((status) => {...})` NOT `await channel.subscribe()`
- **Race condition symptom**: Code works with console.logs but breaks without them → missing callback
- **Debug checklist**: Publication enabled? RLS policy exists? User authenticated? Callback handles status?
- **Test**: Two tabs logged in, edit in Tab A, Tab B updates instantly

### 🚨 CRITICAL: Supabase Broadcast Channel Gotcha (2026-01-18)

**THE PROBLEM**: `supabase.channel(name)` REUSES existing channel instances by name. If you have a persistent subscription to `'my_channel'` and later call `supabase.channel('my_channel')` to send a one-off broadcast, you get the SAME channel instance. Calling `removeChannel()` on it will CLOSE your persistent subscription!

**SYMPTOM**: Console spam with "subscription closed" messages, channels constantly reconnecting, functionality appears to work but with excessive churn.

**WRONG APPROACH** (causes subscription churn):
```typescript
// ❌ DON'T DO THIS - creates/removes same channel instance as receiver
async function broadcastChange() {
  const channel = supabase.channel('public_prompts_broadcast');
  await channel.send({ type: 'broadcast', event: 'changed', payload: {} });
  await supabase.removeChannel(channel); // BREAKS receiver's subscription!
}
```

**CORRECT APPROACH** (check if channel is already subscribed):
```typescript
// ✅ DO THIS - reuse existing subscription, only remove newly created channels
async function broadcastChange() {
  const channel = supabase.channel('public_prompts_broadcast');

  // Check if this is the persistent subscription (state === 'joined')
  const isExistingSubscription = channel.state === 'joined';

  await channel.send({ type: 'broadcast', event: 'changed', payload: {} });

  // Only remove if this was a newly created channel (not the persistent one)
  if (!isExistingSubscription) {
    await supabase.removeChannel(channel);
  }
}
```

**WHY THIS MATTERS**:
- Persistent subscriptions (for receiving broadcasts) stay connected
- One-off sends (for broadcasting changes) get cleaned up
- No subscription churn, no console spam, no reconnection loops

**ALTERNATIVE APPROACH** (use unique channel names for sending):
```typescript
// Also works - sender uses unique name, receiver uses fixed name
// BUT: messages won't reach receiver unless they're on same channel name!
// Only use this if sender doesn't need to receive, and receivers are on different channel
const sendChannel = supabase.channel(`broadcast_send_${Date.now()}`);
```

**Real Example (2026-01-18)**: Spent hours debugging "subscription closed" console spam. Root cause: `broadcastPublicPromptChange()` was calling `removeChannel()` on the same channel instance used by the persistent subscription in `SupabaseAdapter.setupSubscription()`. Fixed by checking `channel.state === 'joined'` before removing.

### Time Tracking Architecture (2026-01-04):
- **Frontend calculation pattern**: Compute derived values (time saved = timesUsed * multiplier) in components, not database
- **Configurable multiplier**: Store multiplier in `user_settings` table, expose via `prompt_stats` view
- **Reduced writes**: Only increment atomic counters (times_used), calculate aggregates on-demand
- **Adapter consistency**: Supabase adapter returns multiplier in getStats()
- **Component pattern**: Access multiplier via `stats.timeSavedMultiplier`, calculate display values inline
- **Benefits**: Instant multiplier changes, fewer DB writes, cleaner schema, ready for user customization

### Version History Architecture (2026-01-13):
- **Immutable snapshots**: Version N = content AFTER Nth save (not before). Each edit creates a new version with the saved content.
- **Storage model**: `prompt_versions` table stores full snapshots (title, body, variables), not deltas. Easier to query and display.
- **Content vs metadata**: Only title, body, and variables trigger version creation. isPinned and timesUsed changes are skipped.
- **Revert tracking**: `reverted_from_version_id` column tracks when a version was created by reverting. Shows "Reverted from Version X" in UI.
- **Cascade delete**: Versions deleted when parent prompt deleted (ON DELETE CASCADE).
- **RPC functions**: `create_prompt_version`, `get_prompt_versions` (paginated with total_count), parameter names must match frontend exactly.
- **Diff computation**: Uses `diff` npm package for word-level diffing (`diffWords`). `getComparisonPair()` utility ensures consistent diff direction.
- **UI pattern**: Two-column modal (2:1 ratio), time-grouped accordion list, inline diff highlighting with toggle.
- **Auto-save on revert**: Revert creates new version capturing current state before restoring (nothing ever lost).

## Project Commands
```bash
npm install        # setup dependencies
npm run dev        # start Vite dev server (port 2902)
npm run build      # production build
npm run build:dev  # development build
npm run lint       # run ESLint
npm run preview    # preview production build
```

## Architecture Overview
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **State**: `PromptsContext`, `CopyHistoryContext`, and `AuthContext` manage prompt CRUD, stats, copy history, and authentication state.
- **Routing**: Vite SPA gated by `RequireAuth`; unauthenticated users are redirected to `/auth`.
- **Persistence**: Supabase storage adapter (auth required; no anonymous fallback) lives under `src/lib/storage/`; sessionStorage is used only for in-progress variable inputs.
- **Auth required**: Storage adapter is null until a user is present; contexts must handle `adapter === null`.
- **Realtime**: Supabase realtime subscriptions trigger prompt/history refresh when supported by the adapter.

### File Structure & Key Paths
```
src/
├── main.tsx                    # App bootstrap with providers
├── App.tsx                     # Router, auth, core providers
├── pages/
│   ├── Auth.tsx               # Magic-link auth flow (memoized effects)
│   ├── Index.tsx              # Dashboard
│   └── CopyHistory.tsx        # Usage history
├── components/                 # UI components (dashboard, modal, cards, stats)
│   └── version-history/       # Version history feature components
│       ├── VersionHistoryModal.tsx   # Main modal with two-column layout
│       ├── VersionList.tsx           # Time-grouped version list with accordion
│       ├── VersionListItem.tsx       # Individual version row with diff summary
│       ├── VersionDiff.tsx           # Inline word-level diff visualization
│       ├── VariableChanges.tsx       # Added/removed variable badges
│       └── RevertConfirmDialog.tsx   # Confirmation dialog for revert action
├── contexts/                   # PromptsContext, CopyHistoryContext, AuthContext
├── hooks/
│   ├── usePromptVersions.ts   # React Query hook for fetching versions
│   └── useRevertToVersion.ts  # Mutation hook for revert with auto-save
├── lib/
│   ├── storage/               # Supabase storage adapter (includes VersionsAdapter)
│   └── supabaseClient.ts      # Supabase client config
├── types/
│   └── supabase-generated.ts  # Generated Supabase types (from remote schema)
├── utils/
│   ├── promptUtils.ts         # Variable detection, payload building
│   ├── diffUtils.ts           # computeDiff, getComparisonPair utilities
│   └── versionUtils.ts        # groupVersionsByPeriod for time grouping
└── components/ui/             # shadcn/ui components (auto-generated)

supabase/
├── config.toml                # Auth & project configuration
├── migrations/                # Database schema migrations
└── functions/                 # Edge functions (if any)
```

## Implementation Guidelines
- **Holistic Planning**: When refactoring core APIs, update ALL consuming components
- **Incremental Testing**: Test each architectural change before proceeding
- **Integration Impact**: Audit all context consumers when updating APIs

## Critical Implementation Patterns

### Async Context & Storage Guidelines (Core Pattern)
```typescript
// ✅ CORRECT - Use async storage adapter with proper error handling
import { usePromptsContext } from '@/contexts/PromptsContext';

const Component = () => {
  const { addPrompt } = usePromptsContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePrompt = async (promptData) => {
    setLoading(true);
    setError(null);
    try {
      await addPrompt(promptData);
      // Success handling
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
};

// ❌ WRONG - Never use storage layers directly
import { supabase } from '@/lib/supabaseClient';
// Direct Supabase calls from components
```

**Core Guidelines:**
- Always `await` context methods and handle rejections with loading/error states
- Define `useCallback` helpers before `useEffect` dependencies
- Merge with existing records to preserve metadata (pin state, counters, timestamps)
- Use standard PostgREST updates, avoid unsupported helpers
- Clean up realtime subscriptions in effects
- **NEVER import storage adapters directly** - always use contexts
- **Context Pattern**: `usePromptsContext()`, `useCopyHistoryContext()`, `useAuth()`

## Additional Implementation Patterns

### Overlay UI (Syntax Highlighting)
- Use `color: transparent !important` in CSS for overlay text (browser `<mark>` defaults override parent classes)
- Both layers must have identical font, padding, line-height for pixel-perfect alignment
- Synchronize scroll between background and foreground layers

### String Normalization
- Normalize consistently across ALL comparison points: `.replace(/[\s_]+/g, '').toLowerCase()`
- Grep for all locations where string type is compared and update together
- Centralize normalization in utilities, do not scatter it

### One-Time Dialogs
- Use session-scoped flag: `const [hasShown, setHasShown] = useState(false)`
- Reset flag when modal opens in `useEffect(() => { if (isOpen) setHasShown(false) }, [isOpen])`
- Check flag before showing to prevent spam

### Form State Persistence
- Use sessionStorage for work-in-progress inputs (survives unmount, cleared on browser close)
- Pattern: Lazy init from storage → auto-save on change → clear after submit
- Storage decision: Component state (UI-only) → Session (WIP) → Server (truth); do not persist prompts/history locally.

### Debug Logging
- Remove all `console.log` before commit unless feature-flagged
- Search codebase for `console.log/warn/error` before finishing
- Console should only show actionable warnings in production

### AnimatePresence Keys
- Always provide explicit `key` props on `motion.div` children: `<motion.div key="backdrop" />`
- Render auxiliary dialogs outside `AnimatePresence` blocks to avoid key conflicts

## Lint & Tooling
- Use `type Foo = Bar` instead of empty interfaces
- ESM required: use `import` not `require()` in config files
- Fast Refresh warnings are acknowledged
- **CRITICAL**: Always read `package.json`, `vite.config.ts`, etc. BEFORE assuming problems

## Supabase Integration Status
**Architecture**: Supabase-only storage (auth required; no localStorage fallback)

**Environment Variables** (required in `.env`):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Database Schema**:
- `prompts` table: id (uuid), user_id (uuid), title, body, variables (jsonb), is_pinned, times_used, created_at, updated_at
- `prompt_versions` table: id (uuid), prompt_id (uuid FK), user_id (uuid), version_number (int), title, body, variables (jsonb), reverted_from_version_id (uuid nullable self-ref), created_at
- `copy_events` table: id (uuid), user_id (uuid), prompt_id (uuid), prompt_title, variable_values (jsonb), copied_text, created_at
- `user_settings` table: user_id (uuid), time_saved_multiplier (integer, default: 5), created_at, updated_at
- `prompt_stats` view: Aggregates total_prompts, total_copies, total_prompt_uses, time_saved_multiplier per user
- RLS policies: Users can only access their own data (SELECT only for prompt_versions - immutable snapshots)

**Time Tracking**: Frontend calculates time saved dynamically using `timesUsed * multiplier` instead of storing accumulated values

**Auth Flow**:
- Google OAuth: `signInWithProvider` → OAuth redirect → `exchangeCodeForSession` → dashboard redirect
- Magic-link email: `signInWithEmail` → email link click → `exchangeCodeForSession` → dashboard redirect

## Common Issues & Solutions

### React Rendering Pitfalls
- Sanitize prompt variable arrays (trim and dedupe) before rendering chips or inputs so React keys never fall back to empty strings
- When mapping over user-provided identifiers, compose keys with a stable fallback (e.g. `${value || 'fallback'}-${index}`) instead of relying on the raw value
- Framer Motion `AnimatePresence` must wrap a single keyed element; render auxiliary dialogs or overlays outside the animated block
- Clear temporary `console.log` debugging before finishing so the console only reflects actionable issues
- Browser extensions can inject false-positive console errors; re-check in an extension-free window before treating them as app bugs

### Critical Errors to Avoid
- **SQL migrations**: Keep ASCII-only (emojis break deployment)
- **Auth state**: Always check session before assuming user exists
- **Storage bypass**: Never use direct Supabase calls from components
- **Anonymous storage**: Do not add localStorage fallbacks or unauth adapters; data access requires auth
- **Context imports**: Never import `src/lib/storage/*` directly - use contexts only
- **Async errors**: Always implement loading/error states with `try/catch`
- **Provider errors**: Verify context hierarchy in App.tsx
- **Build errors**: Use ESM imports, proper TypeScript types

### Debugging Steps
1. **Configuration first**: Verify Supabase realtime/RLS/publications, check `.env`, verify CLI linked, check auth session
2. **Auth Issues**: Check browser dev tools → Application → Local Storage for session
3. **Database Issues**: Verify `npx supabase status` shows linked project
4. **Context Issues**: Ensure components wrapped in proper providers
5. **Type Issues**: Regenerate types with `npx supabase gen types typescript --linked`
6. **Build Issues**: Clear node_modules and reinstall, check ESLint output
7. **Race conditions**: If console.logs "fix" the bug → missing callback or wrong async pattern
8. **Test incrementally**: One change → test → verify → next change (never batch architectural changes)

## Testing Protocol
1. Test components in isolation before integration
2. Run `npm run lint` and `npm run build` after changes
3. Test complete user flows last

## 🚨 CRITICAL: Implementation Quality Standards

**MANDATORY before claiming any feature "complete":**
1. **No placeholders** - Real endpoints, auth tokens, UI elements (no `??` or `TODO`)
2. **Cross-system sync** - When changing shared utilities, update ALL consumers
3. **Quality gates** - Pass `npm run lint`, `npm run build`
4. **End-to-end test** - Complete user workflow works with real data

**Warning signs to STOP and fix:**
- `any` types, ESLint suppressions, or dependency array warnings
- Components work in isolation but fail when integrated
- Authentication bypasses or hard-coded credentials
- Unhandled Promise rejections in async operations

### Quality Checklist
- [ ] SQL references match ID strategy (UUID vs auto-increment)
- [ ] No empty interfaces, proper TypeScript types
- [ ] Async operations have loading/error states
- [ ] useCallback dependencies correct
- [ ] Dynamic lists use stable, non-empty keys even when user input is blank
- [ ] Framer Motion blocks follow the single-child `AnimatePresence` contract
- [ ] No direct storage imports (use contexts)
- [ ] Subscription cleanup in effects
- [ ] Debug logging removed or behind feature-flagged utilities
- [ ] Environment variables documented in `.env.example`
- [ ] Magic-link redirect URL matches `supabase/config.toml`
- [ ] RLS policies prevent cross-user access
- [ ] Real-time subscriptions work for authenticated users
- [ ] Storage adapter initializes after authentication
- [ ] RPC function parameter names match frontend TypeScript exactly
- [ ] Versioning captures NEW state (after save), not OLD state (before save)
- [ ] Diff direction consistent across all comparison modes (use `getComparisonPair()`)

**Manual Testing**
1. Auth flow: magic link → dashboard redirect
2. CRUD: create, edit, pin, copy, delete prompts
3. Persistence: data survives refresh
4. Auth required: unauthenticated sessions redirect to /auth; authenticated data persists after refresh
5. RLS: cross-user access denied
6. Real-time: updates across browser sessions
7. Version history: create prompt → edit → verify version list shows correct content
8. Diff display: compare to previous shows additions (green) and removals (red) correctly
9. Revert flow: revert to older version → confirm dialog → verify new version created with old content

## Development Status & Roadmap

**✅ Completed**:
- Supabase-only storage architecture
- Magic-link authentication with session management
- Async contexts with loading/error states
- Real-time prompt synchronization (WebSocket, background refresh, stabilized dependencies)
- Copy history tracking
- Pin/unpin functionality
- Variable highlighting (color-coded, case-insensitive, auto-add dialog, overlay-based)
- Work-in-progress form persistence (sessionStorage, survives unmounts)
- Time tracking refactor (frontend calculation, configurable multiplier, reduced DB writes)
- **Version history tracking** (immutable snapshots, word-level diff, revert with auto-save, revert tracking)

**🔄 Current Focus**:
- Testing & quality assurance
- Performance optimization

**🚀 Future**:
- Sharing & collaboration features
- Advanced prompt organization
- Export/import functionality
- Production deployment automation

## Emergency Troubleshooting

**If build fails**:
1. `rm -rf node_modules package-lock.json`
2. `npm install`
3. Check for ESLint errors: `npm run lint`

**If auth breaks**:
1. Check environment variables in `.env`
2. Verify `supabase/config.toml` site_url matches dev server
3. Clear browser storage and retry auth flow

**If database breaks**:
1. `npx supabase status` (should show linked project)
2. `npx supabase db push` (apply pending migrations)
3. Check Supabase dashboard for table existence and RLS policies


