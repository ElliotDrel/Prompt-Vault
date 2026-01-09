# External Integrations

**Analysis Date:** 2026-01-09

## APIs & External Services

**External APIs:**
- None detected (self-contained application)

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary data store
  - Connection: via `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` env vars (`src/lib/supabaseClient.ts`)
  - Client: `@supabase/supabase-js` v2.58
  - Migrations: Version-controlled in `supabase/migrations/` (11 migrations)
  - Tables: `prompts`, `copy_events`, `user_settings` (with RLS policies)
  - Views: `prompt_stats` (aggregated statistics)
  - Functions: `increment_prompt_usage`, `search_copy_events`

**File Storage:**
- Not detected (no file upload functionality)

**Caching:**
- TanStack Query - Client-side query caching (30s stale time, `src/App.tsx`)
- No server-side caching layer

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email magic links and Google OAuth
  - Implementation: `@supabase/supabase-js` with `AuthContext` (`src/contexts/AuthContext.tsx`)
  - Token storage: Browser localStorage (automatic via Supabase client)
  - Session management: Auto-refresh tokens, persistent sessions
  - Auth guard: `RequireAuth` component (`src/components/auth/RequireAuth.tsx`)

**OAuth Integrations:**
- Google OAuth - Social sign-in
  - Configured in Supabase dashboard (no client-side credentials needed)
  - Redirect URL: `/auth` route handles OAuth callbacks

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry or similar service)

**Analytics:**
- Vercel Analytics - Web vitals and page views
  - SDK: `@vercel/analytics` v1.6
  - Integration: `<Analytics />` component in `src/App.tsx`

**Logs:**
- Browser console only (no centralized logging service)

## CI/CD & Deployment

**Hosting:**
- Vercel - Static site hosting
  - Configuration: `vercel.json` in project root
  - Deployment: Automatic on git push (assumed from Vercel config presence)
  - Environment vars: Managed in Vercel dashboard

**CI Pipeline:**
- Husky - Git hooks for pre-commit checks
  - Scripts: `prepare` script in `package.json` sets up hooks
  - Configuration: `.husky/` directory

**Development Tools:**
- Supabase CLI - Remote database management
  - Project ref: `hupdhjdasqgfcabaiiwa` (configured in `.mcp.json`)
  - Workflow: Remote-only (no local Docker)
  - Commands: `npx supabase db push`, `npx supabase gen types`

## Environment Configuration

**Development:**
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Example file: `.env.example` documents required variables
- Secrets location: `.env` (gitignored)

**Production:**
- Secrets management: Vercel environment variables
- Database: Supabase hosted project (same as dev)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Realtime Subscriptions

**Supabase Realtime:**
- WebSocket subscriptions for live data updates
  - Tables: `prompts`, `copy_events` (enabled in migration `20251016170631_enable_realtime.sql`)
  - Implementation: Context-level subscriptions in `PromptsContext` and `CopyHistoryContext`
  - Events: INSERT, UPDATE, DELETE operations

---

*Integration audit: 2026-01-09*
*Update when adding/removing external services*
