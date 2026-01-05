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
- Uses Supabase Auth with email magic links (OTP)
- `AuthContext` (`src/contexts/AuthContext.tsx`) provides centralized auth state management
- Auth state persists across sessions and auto-refreshes tokens
- Token refresh events should not trigger data reloads; expose a stable `authUserId` and use it for data contexts and realtime filters
- Protected routes use `RequireAuth` component to enforce authentication (`src/components/auth/RequireAuth.tsx`)
- Magic link redirects include code exchange handled in `AuthContext.exchangeCodeForSession()`

### Routing Structure
- `BrowserRouter` wraps entire app
- Routes: `/` (Landing - public), `/auth` (Auth - public), `/dashboard` (Dashboard - protected), `/history` (Copy History - protected), `*` (NotFound)
- All routes wrapped in `AuthProvider` for consistent auth state
- Protected routes use `RequireAuth` component to enforce authentication

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

### Database Migration Best Practices:
- **Document object dependencies**: Track triggers -> policies -> functions -> tables -> enums for removal order
- **Avoid double counting in views**: Pre-aggregate one-to-many tables before joining
- **Test end-to-end workflows**: Ensure navigation works after database changes
- **Use incremental migrations**: Separate schema changes from data fixes
- **Always verify CLI is linked**: Check project connection before pushing migrations
- **Preserve migration history**: Never delete migration files, even for removed features

**Rationale**: This approach ensures all changes are version-controlled, reproducible, and eliminates dependency on local Docker setup while maintaining full control over project configuration.

### Supabase Realtime Setup:
- **Enable first**: Dashboard → Database → Publications → `supabase_realtime` → Toggle tables ON
- **Verify RLS**: SELECT policy must exist for `auth.uid() = user_id`
- **Subscribe pattern**: Use `channel.subscribe((status) => {...})` NOT `await channel.subscribe()`
- **Race condition symptom**: Code works with console.logs but breaks without them → missing callback
- **Debug checklist**: Publication enabled? RLS policy exists? User authenticated? Callback handles status?
- **Test**: Two tabs logged in, edit in Tab A, Tab B updates instantly

### Time Tracking Architecture (2026-01-04):
- **Frontend calculation pattern**: Compute derived values (time saved = timesUsed * multiplier) in components, not database
- **Configurable multiplier**: Store multiplier in `user_settings` table, expose via `prompt_stats` view
- **Reduced writes**: Only increment atomic counters (times_used), calculate aggregates on-demand
- **Adapter consistency**: Both Supabase and localStorage adapters return multiplier in getStats()
- **Component pattern**: Access multiplier via `stats.timeSavedMultiplier`, calculate display values inline
- **Benefits**: Instant multiplier changes, fewer DB writes, cleaner schema, ready for user customization

## Project Commands
```bash
npm install        # setup dependencies
npm run dev        # start Vite dev server (port 5173)
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
- **Persistence**: Hybrid storage adapter (Supabase when authenticated, localStorage fallback otherwise) lives under `src/lib/storage/`.
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
├── contexts/                   # PromptsContext, CopyHistoryContext, AuthContext
├── lib/
│   ├── storage/               # Hybrid storage adapters
│   ├── supabaseClient.ts      # Supabase client config
│   └── database.types.ts      # Generated Supabase types
├── utils/
│   └── promptUtils.ts         # Variable detection, payload building
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
- Storage decision: Component state (UI-only) → Session (WIP) → Local (preferences) → Server (truth)

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
**Architecture**: Hybrid storage (Supabase + localStorage fallback)

**Environment Variables** (required in `.env`):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Database Schema**:
- `prompts` table: id (uuid), user_id (uuid), title, body, variables (jsonb), is_pinned, times_used, created_at, updated_at
- `copy_events` table: id (uuid), user_id (uuid), prompt_id (uuid), prompt_title, variable_values (jsonb), copied_text, created_at
- `user_settings` table: user_id (uuid), time_saved_multiplier (integer, default: 5), created_at, updated_at
- `prompt_stats` view: Aggregates total_prompts, total_copies, total_prompt_uses, time_saved_multiplier per user
- RLS policies: Users can only access their own data

**Time Tracking**: Frontend calculates time saved dynamically using `timesUsed * multiplier` instead of storing accumulated values

**Auth Flow**: Magic-link email → `exchangeCodeForSession` → dashboard redirect

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
- **Storage bypass**: Never use direct `localStorage` or Supabase calls from components
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
- [ ] localStorage fallback works for unauthenticated users

**Manual Testing**
1. Auth flow: magic link → dashboard redirect
2. CRUD: create, edit, pin, copy, delete prompts
3. Persistence: data survives refresh
4. Dual mode: authenticated (Supabase) + fallback (localStorage)
5. RLS: cross-user access denied
6. Real-time: updates across browser sessions

## Development Status & Roadmap

**✅ Completed**:
- Hybrid storage architecture (Supabase + localStorage)
- Magic-link authentication with session management
- Async contexts with loading/error states
- Real-time prompt synchronization (WebSocket, background refresh, stabilized dependencies)
- Copy history tracking
- Pin/unpin functionality
- Variable highlighting (color-coded, case-insensitive, auto-add dialog, overlay-based)
- Work-in-progress form persistence (sessionStorage, survives unmounts)
- Time tracking refactor (frontend calculation, configurable multiplier, reduced DB writes)

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
3. Clear browser localStorage and retry auth flow

**If database breaks**:
1. `npx supabase status` (should show linked project)
2. `npx supabase db push` (apply pending migrations)
3. Check Supabase dashboard for table existence and RLS policies
