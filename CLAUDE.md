# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Prompt Vault codebase.

## Mandatory: Read This File First
- Always read this document before writing or modifying code.
- Inspect existing components, hooks, and contexts to match established patterns.
- Confirm the current project status and open tasks.
- Follow the workflows in this guide instead of inventing new ones mid-stream.
- **CLI-First Rule**: Research CLI automation capabilities thoroughly before recommending manual steps.
- **Template Validation Rule**: Always validate generated code (SQL, TypeScript, etc.) against specific technology choices before applying.

## Documentation-First Approach
- Review official docs for Supabase, Vercel, React Router, shadcn/ui, Tailwind CSS, and Playwright before touching those areas.
- Use the Context7 MCP to fetch current library documentation (`mcp__context7__resolve-library-id` then `mcp__context7__get-library-docs`) when you need API references.
- Only propose alternative tooling after confirming it aligns with this document and existing architecture.

## Supabase Development Workflow
- Supabase is managed exclusively with the Supabase CLI. Do **not** run `supabase start` or any Docker services.
- All work targets the hosted Supabase project; keep configuration in version control under `supabase/`.
- Auth settings live in `supabase/config.toml`. Database schema lives in SQL migrations under `supabase/migrations/`.
- Deploy schema changes with `npx supabase db push` after migrations are committed.
- Never edit the remote database by hand. Every change must come from a migration.

### Required CLI Commands
```bash
npx supabase init                      # generate supabase/config.toml and folders
npx supabase login                     # authenticate your CLI session
npx supabase link --project-ref <ref>  # link to the hosted project

npx supabase migrate new name_here     # scaffold a new migration
npx supabase db push                   # apply local migrations to remote
npx supabase db pull                   # sync remote changes locally
npx supabase db reset                  # rebuild remote db (careful!)
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
npx supabase status                                                       # verify CLI is linked before pushing
```

### Database Migration Best Practices
- Keep every migration ASCII-only; emojis or smart quotes break deployments.
- Enable required extensions explicitly (e.g., `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`) before using `gen_random_uuid()`.
- Use `gen_random_uuid()` for IDs; avoid deprecated extensions.
- Apply changes incrementally: separate schema adjustments from data backfills.
- Document dependencies inside migration files so rollbacks follow the correct order (tables, policies, functions, triggers).
- Include RLS policies, grants, and helper functions in the same migration that depends on them.
- **VALIDATION RULE**: For UUID tables, never reference auto-increment sequences (`table_id_seq`) in GRANT statements.
- **CONSISTENCY CHECK**: Verify all SQL references match the chosen ID strategy (UUID vs auto-increment) before applying.
- Test migrations through the CLI before committing.

## Project Commands
### Development
- `npm run dev` - start Vite dev server on port 5173.
- `npm run build` - production build.
- `npm run build:dev` - development build.
- `npm run lint` - run ESLint.
- `npm run preview` - preview the production build.

### Setup
```bash
npm install
npm run dev
```

## Architecture Overview
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **State**: `PromptsContext`, `CopyHistoryContext`, and `AuthContext` manage prompt CRUD, stats, copy history, and authentication state.
- **Routing**: Vite SPA gated by `RequireAuth`; unauthenticated users are redirected to `/auth`.
- **Persistence**: Hybrid storage adapter (Supabase when authenticated, localStorage fallback otherwise) lives under `src/lib/storage/`.
- **Realtime**: Supabase realtime subscriptions trigger prompt/history refresh when supported by the adapter.

### Application Structure
- `src/main.tsx` bootstraps and wraps the app in providers.
- `src/App.tsx` wires the router, authentication, and core providers.
- `src/pages/Auth.tsx` implements the Supabase magic-link flow and must keep its effects memoised to satisfy lint rules.
- `src/pages/Index.tsx` renders the dashboard; `CopyHistory.tsx` exposes usage history.
- Core UI elements live under `src/components/` (dashboard, modal editor, cards, stats counters).
- Prompt utilities (variable detection, payload building) live in `src/utils/promptUtils.ts`.

## Implementation Planning & Architecture Changes
- **Holistic Change Planning**: When refactoring core APIs (e.g., contexts from sync to async), systematically identify and plan updates for ALL consuming components, not just the core implementation.
- **Incremental Integration Testing**: Test each major architectural change before proceeding to the next (e.g., test storage adapters → test context refactoring → test component integration).
- **Component Integration Checklist**: When updating context APIs, audit all components that consume those contexts and update their error handling, loading states, and async patterns.
- **Error Boundary Strategy**: Add error boundaries around async operations, especially when transitioning from synchronous to asynchronous patterns.

## Async Context & Storage Guidelines
- Storage adapters return Promises; every call site must `await` context methods (`addPrompt`, `incrementCopyCount`, `clearHistory`, etc.) and handle rejections to surface user feedback.
- Define `useCallback` helpers before any `useEffect` that references them in its dependency array to avoid temporal-dead-zone runtime errors.
- When updating prompts, always merge with the existing record so metadata such as pin state, usage counters, and timestamps are preserved.
- Supabase adapters should map rows through shared helpers; avoid calling unsupported helpers such as `supabase.sql`. Use standard PostgREST updates or RPCs instead.
- Clean up realtime subscriptions in effects; always capture and call the unsubscribe function on teardown to prevent duplicate listeners after adapter switches.
- **Integration Impact Rule**: When refactoring contexts to async, ensure ALL consuming components handle the new loading states and error conditions.

## Lint & Tooling Expectations
- The repo enforces `@typescript-eslint/no-empty-object-type`; prefer `type Foo = Bar` (or add members) instead of declaring empty `interface Foo extends Bar {}`.
- ESM is required in configuration files�use `import tailwindcssAnimate from "tailwindcss-animate"` rather than `require()` in `tailwind.config.ts`.
- Fast Refresh warnings stemming from shared helpers are acknowledged; do not silence them unless the project owner requests it.

## Supabase Integration Roadmap
We are adopting the same Supabase architecture used in `personal-knowledge-vault`.

1. **Supabase project wiring**
   - Commit `supabase/config.toml` tuned for this codebase.
   - Create migrations for a `prompts` table (`id`, `user_id`, `title`, `body`, `variables`, flags, timestamps) and a `prompt_stats` table or computed view.
   - Add triggers to maintain `updated_at` and to seed default prompt templates for new users if needed.
   - Enable row level security and policies limiting access to `auth.uid()` scoped data.
   - Grant `authenticated` role privileges; keep migrations ASCII-only.

2. **Client integration**
   - `src/lib/supabaseClient.ts` MUST throw if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing; this prevents silent fallback to insecure modes.
   - `AuthContext`, `useAuth`, and `RequireAuth` manage magic-link sessions; ensure loading states are respected before rendering gated routes.
   - Maintain the `Auth` page magic-link flow (`supabase.auth.signInWithOtp`, `exchangeCodeForSession`, redirect support) with memoised handlers.
   - Gate existing routes behind `RequireAuth`, defaulting unauthenticated users to the auth page.

3. **Storage layer upgrade**
   - Hybrid storage adapter pattern is live: local storage adapter for anonymous users, Supabase adapter for authenticated users.
   - Keep adapters async, strongly typed, and responsible for realtime subscriptions.
   - Refactor contexts to use the adapters only�no direct `localStorage` or Supabase calls from components.
   - Update UI loading and error states to handle async storage consistently.

4. **Environment and typing**
   - Document required env vars in `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - Regenerate database types via `npx supabase gen types` whenever migrations change the schema.

5. **Testing and rollout**
   - Validate migrations through the CLI before linking to production.
   - Smoke-test auth, prompt CRUD, stats updates, and real-time refresh in both authenticated and fallback modes.

## Known Gotchas
- Keep SQL migrations ASCII-only to avoid the emoji corruption seen in the reference repo.
- Ensure `supabase/config.toml` `site_url` matches the app host; the magic link redirect depends on it.
- Always call `supabase.auth.getSession()`/`getUser()` before assuming a session exists; React components must handle loading states.
- When adding new fields to prompt metadata, update migrations, adapters, context typing, and the Supabase row-to-model mapper together.
- Do not bypass the storage adapters�no direct `localStorage` mutations or raw Supabase client calls from UI components.
- Event handlers must stay `async` and `await` context methods; unhandled Promise rejections will surface as console errors and break the UX.
- Tailwind config, ESLint config, and other tooling files are ESM�avoid `require()` to keep lint happy.

## Testing Strategy & Quality Assurance

### Incremental Testing Protocol
1. **Per-Component Testing**: Test each major component (storage adapters, contexts, auth) in isolation before integration
2. **Build Validation**: Run `npm run build` after each significant change to catch TypeScript errors early
3. **Lint Compliance**: Address ESLint errors immediately to prevent accumulation
4. **Integration Testing**: Test the complete user flow only after all components are individually validated

### Testing After Changes
```bash
npm install        # keep dependencies in sync
npm run lint       # static analysis - fix errors immediately
npm run build      # ensure production build still succeeds
npm run dev        # manual exploratory testing
```

### Template & Code Validation Checklist
- [ ] All SQL references match chosen ID strategy (UUID vs auto-increment)
- [ ] All TypeScript interfaces properly extend or define members (no empty interfaces)
- [ ] All async operations have proper error handling and loading states
- [ ] All useCallback dependencies are correctly specified
- [ ] All components consuming updated contexts handle new async patterns

**Manual Verification Checklist**
1. Authenticate with a magic link, confirm redirect to the dashboard.
2. Create, edit, pin, copy, and delete prompts; verify data persists across refresh.
3. Confirm prompt usage and time-saved counters update correctly and stay user-specific.
4. Exercise copy history views and ensure stats sync.
5. Test unauthenticated mode: remove the session and confirm localStorage fallback still works until Supabase is available.
6. Validate Supabase RLS by attempting cross-user access (should be denied).
7. Confirm real-time updates propagate across two browser sessions when authenticated.

## Development Status
- **Current**: Hybrid storage adapters with Supabase authentication and realtime refresh are implemented; contexts and components are fully async.
- **Next**: Expand Supabase-backed features (sharing, collaboration), ensure extensive testing, and polish error handling.
- **Future**: Production hardening, deployment automation, and collaboration features once Supabase storage is proven stable.
