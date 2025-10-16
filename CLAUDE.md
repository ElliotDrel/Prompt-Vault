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

**Core Rules:**
- **CLI-First Rule**: Research CLI automation capabilities thoroughly before recommending manual steps
- **Documentation-First Rule**: Use Context7 MCP (`mcp__context7__resolve-library-id` → `mcp__context7__get-library-docs`) for current library docs
- **Template Validation Rule**: Always validate generated code against specific technology choices

## ⚠️ CRITICAL: Supabase Development Workflow

**CLI-Only Development Rule**: This project uses Supabase CLI exclusively for schema and configuration management against the deployed/hosted Supabase project. **NO local Docker setup or `supabase start` commands.**

### Required Supabase Workflow:
1. **Project Management**: Work against deployed Supabase projects only
2. **Configuration**: All auth settings, database schema, and project config managed via `supabase/config.toml`
3. **Deployment**: Use `supabase db push` to deploy changes to remote project
4. **No Local Services**: Never use `supabase start`, Docker containers, or local database instances

### CLI Commands for Development:
```bash
# Project setup (run with npx prefix)
npx supabase init                    # Initialize config files
npx supabase login                   # Authenticate with Supabase
npx supabase link --project-ref <id> # Link to hosted project

# Configuration management
npx supabase db push                 # Deploy local config to remote
npx supabase db pull                 # Pull remote config changes
npx supabase validate               # Validate config before deployment
npx supabase status                 # Verify CLI is linked before pushing

# Migration management
npx supabase migrate new name_here   # Create new migration
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts

# Auth configuration via config.toml only
# Database schema via migrations only
# No dashboard clicking for configuration
```

### Database Migration Best Practices:
- **Use modern PostgreSQL functions**: `gen_random_uuid()` instead of `uuid_generate_v4()`
- **Handle Unicode/emojis carefully**: Test emoji storage in JSONB fields
- **CRITICAL: Use ASCII-only in SQL files**: Unicode characters (✅⚠️) cause deployment failures
- **Document object dependencies**: Track triggers → policies → functions → tables → enums for removal order
- **Test end-to-end workflows**: Ensure navigation works after database changes
- **Use incremental migrations**: Separate schema changes from data fixes
- **Always verify CLI is linked**: Check project connection before pushing migrations
- **Preserve migration history**: Never delete migration files, even for removed features

**Rationale**: This approach ensures all changes are version-controlled, reproducible, and eliminates dependency on local Docker setup while maintaining full control over project configuration.

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
- Centralize normalization in utilities, don't scatter it

### One-Time Dialogs
- Use session-scoped flag: `const [hasShown, setHasShown] = useState(false)`
- Reset flag when modal opens in `useEffect(() => { if (isOpen) setHasShown(false) }, [isOpen])`
- Check flag before showing to prevent spam

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
- `prompts` table: id (uuid), user_id (uuid), title, body, variables (jsonb), is_pinned, copy_count, created_at, updated_at
- `copy_history` table: id (uuid), user_id (uuid), prompt_id (uuid), copied_at, time_saved
- RLS policies: Users can only access their own data

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
1. **Auth Issues**: Check browser dev tools → Application → Local Storage for session
2. **Database Issues**: Verify `npx supabase status` shows linked project
3. **Context Issues**: Ensure components are wrapped in proper providers
4. **Type Issues**: Regenerate types with `npx supabase gen types typescript --linked`
5. **Build Issues**: Clear node_modules and reinstall, check ESLint output

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
- Real-time prompt synchronization
- Copy history tracking
- Pin/unpin functionality
- Variable highlighting in prompt editor
  - Color-coded variable references
  - Case-insensitive matching
  - Undefined variable detection with auto-add dialog
  - Overlay-based syntax highlighting

**🔄 Current Focus**:
- Testing & quality assurance
- Error handling improvements
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
