# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Prompt Vault codebase.

## Mandatory: Read This File First
- Always read this document before writing or modifying code.
- Inspect existing components, hooks, and contexts to match established patterns.
- Confirm the current project status and open tasks.
- Follow the workflows in this guide instead of inventing new ones mid-stream.

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
npx supabase status                    # verify CLI is linked before pushing
```

### Database Migration Best Practices
- Keep every migration ASCII-only; emojis or smart quotes break deployments.
- Use `gen_random_uuid()` for IDs; avoid deprecated extensions.
- Apply changes incrementally: separate schema adjustments from data backfills.
- Document dependencies inside migration files so rollbacks follow the correct order (tables, policies, functions, triggers).
- Include RLS policies, grants, and helper functions in the same migration that depends on them.
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
- **State**: `PromptsContext` and `CopyHistoryContext` manage prompt CRUD, stats, and copy history.
- **Routing**: Single-page app with `Index` + `NotFound`.
- **Persistence**: Currently localStorage (`prompts`, `promptStats`) seeded from `samplePrompts`.

### Application Structure
- `src/main.tsx` bootstraps and wraps the app in providers.
- `src/App.tsx` wires navigation, contexts, and base layout.
- `src/pages/Index.tsx` renders the dashboard; `CopyHistory.tsx` exposes usage history.
- Core UI elements live under `src/components/` (dashboard, modal editor, cards, stats counters).
- Prompt utilities (variable detection, payload building) live in `src/utils/promptUtils.ts`.
- `highlighted-textarea` in `src/components/ui` provides real-time variable highlighting.

## Supabase Integration Roadmap
We are adopting the same Supabase architecture used in `personal-knowledge-vault`.

1. **Supabase project wiring**
   - Commit `supabase/config.toml` tuned for this codebase.
   - Create migrations for a `prompts` table (`id`, `user_id`, `title`, `body`, `variables`, flags, timestamps) and a `prompt_stats` table or computed view.
   - Add triggers to maintain `updated_at` and to seed default prompt templates for new users if needed.
   - Enable row level security and policies limiting access to `auth.uid()` scoped data.
   - Grant `authenticated` role privileges; keep migrations ASCII-only.

2. **Client integration**
   - Add `src/lib/supabaseClient.ts` that mirrors the reference setup (reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, enables session persistence).
   - Introduce `AuthContext`, `useAuth`, and `RequireAuth` identical to the reference flow.
   - Create an `Auth` page implementing the email magic-link flow (`supabase.auth.signInWithOtp`, `exchangeCodeForSession`, redirect support).
   - Gate existing routes behind `RequireAuth`, defaulting unauthenticated users to the auth page.

3. **Storage layer upgrade**
   - Port the hybrid storage adapter pattern: keep a local storage adapter for anonymous users, add a Supabase adapter that wraps table CRUD (`prompts`, `prompt_stats`), and expose them via a hook.
   - Refactor `PromptsContext` and copy history logic to use async adapters instead of direct localStorage calls.
   - Use Supabase real-time channels to refresh prompt lists on inserts, updates, and deletes.
   - Update UI loading and error states to handle async storage consistently.

4. **Environment and typing**
   - Document required env vars in `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - Optionally generate database types via `npx supabase gen types` and use them in Supabase calls.

5. **Testing and rollout**
   - Validate migrations through the CLI before linking to production.
   - Smoke-test auth, prompt CRUD, stats updates, and real-time refresh in both authenticated and fallback modes.

## Known Gotchas
- Keep SQL migrations ASCII-only to avoid the emoji corruption seen in the reference repo.
- Ensure `supabase/config.toml` `site_url` matches the app host; the magic link redirect depends on it.
- Always call `supabase.auth.getSession()` before assuming a session exists; React components must handle loading states.
- When adding new fields to prompt metadata, update migrations, adapters, and context typing together.
- Do not bypass the storage adapters - no direct `localStorage` mutations once Supabase integration is live.

## Testing After Changes
```bash
npm install        # keep dependencies in sync
npm run lint       # static analysis
npm run build      # ensure production build still succeeds
npm run dev        # manual exploratory testing
```

**Manual Verification Checklist**
1. Authenticate with a magic link, confirm redirect to the dashboard.
2. Create, edit, pin, copy, and delete prompts; verify data persists across refresh.
3. Confirm prompt usage and time-saved counters update correctly and stay user-specific.
4. Exercise copy history views and ensure stats sync.
5. Test unauthenticated mode: remove the session and confirm localStorage fallback still works (until it is replaced).
6. Validate Supabase RLS by attempting cross-user access (should be denied).
7. Confirm real-time updates propagate across two browser sessions when authenticated.

## Development Status
- **Current**: LocalStorage-backed prompt manager with shadcn/ui components; Supabase integration not yet implemented.
- **Next**: Implement Supabase schema, authentication, and hybrid storage following this guide.
- **Future**: Sharing, collaboration, and deployment hardening once Supabase-based storage is stable.
