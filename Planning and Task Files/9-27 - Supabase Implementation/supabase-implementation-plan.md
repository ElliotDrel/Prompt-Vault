# Supabase Implementation Plan: Prompt Vault

## Overview & Objectives

This document captures the end-to-end plan for integrating Supabase authentication and managed PostgreSQL storage into Prompt Vault using the same patterns proven in the personal-knowledge-vault reference repository.

### Primary Goals
- Provide passwordless magic-link authentication for every user
- Persist prompts, stats, and copy history in Supabase with a local fallback
- Enforce per-user data isolation through Row Level Security (RLS)
- Deliver real-time updates across browser sessions
- Preserve localStorage behaviour when offline or unauthenticated

### Success Metrics
- Users sign in via Supabase magic links and return to their intended route
- Authenticated prompts, stats, and copy history round-trip successfully through Supabase
- Unauthenticated users continue using localStorage without regressions
- Real-time subscriptions refresh UI data without manual reloads
- No data loss when migrating from localStorage to Supabase

---

## Phase 1: Supabase Project Wiring

### Objectives
- Initialise the Supabase CLI workflow
- Define database schema, policies, and triggers matching the reference architecture
- Prepare default data seeding for new accounts

### Implementation Steps

#### 1.1 CLI & Project Setup
```bash
npm install @supabase/supabase-js
npm install -D supabase
npx supabase init
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase status
```
**Exit Criteria**: `supabase/config.toml` is committed, CLI is linked to the hosted project, and status reports a healthy connection.

#### 1.2 Initial Database Migration (`supabase/migrations/<timestamp>_init_prompts.sql`)
- Create required extensions and core tables
- Mirror the reference repo's function + trigger structure

```sql
-- Enable UUID generation
create extension if not exists pgcrypto;

-- Prompts table (equivalent to reference resources table)
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  variables text[] not null default '{}',
  notes text not null default '',
  is_pinned boolean not null default false,
  times_used integer not null default 0,
  time_saved_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Copy history table mirroring local copy events
create table public.copy_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete set null,
  title text not null,
  snippet text not null,
  created_at timestamptz not null default now()
);

-- Prompt stats table to persist global counters per user
create table public.prompt_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_prompts integer not null default 0,
  total_copies integer not null default 0,
  time_saved_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Shared updated_at trigger (same approach as reference repo)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_prompts_updated_at
  before update on public.prompts
  for each row execute function public.update_updated_at_column();

create trigger trg_prompt_stats_updated_at
  before update on public.prompt_stats
  for each row execute function public.update_updated_at_column();

-- Default data for new users (mirrors reference SECURITY DEFINER pattern)
create or replace function public.initialize_default_prompt_data(user_uuid uuid)
returns void as $$
begin
  -- Insert default stats row
  insert into public.prompt_stats (user_id)
  values (user_uuid)
  on conflict (user_id) do nothing;

  -- Seed introductory prompts equivalent to samplePrompts
  insert into public.prompts (user_id, title, body, variables, notes, is_pinned)
  values
    (user_uuid, 'Welcome Prompt', 'Introduce yourself to the team using this template.', array['recipient_name'], '', true),
    (user_uuid, 'Bug Report Template', 'Summarise the issue: {summary}
Steps to reproduce: {steps}
Expected vs actual: {expected}', array['summary','steps','expected'], '', false),
    (user_uuid, 'Daily Standup', 'Yesterday: {yesterday}
Today: {today}
Blocked: {blocked}', array['yesterday','today','blocked'], '', false)
  on conflict do nothing;
end;
$$ language plpgsql security definer;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  perform public.initialize_default_prompt_data(new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security policies mirroring reference granularity
alter table public.prompts enable row level security;
alter table public.copy_history enable row level security;
alter table public.prompt_stats enable row level security;

create policy "select own prompts" on public.prompts
  for select using (auth.uid() = user_id);
create policy "insert own prompts" on public.prompts
  for insert with check (auth.uid() = user_id);
create policy "update own prompts" on public.prompts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own prompts" on public.prompts
  for delete using (auth.uid() = user_id);

create policy "select own copy history" on public.copy_history
  for select using (auth.uid() = user_id);
create policy "modify own copy history" on public.copy_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "select own stats" on public.prompt_stats
  for select using (auth.uid() = user_id);
create policy "update own stats" on public.prompt_stats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Permissions aligned with reference repo
grant usage on schema public to authenticated;
grant all on public.prompts to authenticated;
grant all on public.copy_history to authenticated;
grant select, update on public.prompt_stats to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Helpful indexes
create index idx_prompts_user_id on public.prompts(user_id);
create index idx_prompts_updated_at on public.prompts(user_id, updated_at desc);
create index idx_prompts_pinned on public.prompts(user_id) where is_pinned;
create index idx_copy_history_user_id on public.copy_history(user_id, created_at desc);
```

**Exit Criteria**: Migration applies cleanly with `npx supabase db push`, RLS prevents cross-user access, and seeded data appears for fresh accounts.

#### 1.3 Follow-up Migrations
- Use additional migrations for incremental adjustments (e.g., data clean-up, column additions) just as the reference repo does (`supabase/migrations/<timestamp>_*.sql`).

---

## Phase 2: Authentication & Client Foundation

### Objectives
- Mirror the reference repo's auth client setup and provider structure
- Gate routed pages behind authentication while preserving redirects

### Implementation Steps

#### 2.1 Supabase Client (`src/lib/supabaseClient.ts`)
- Copy the reference implementation verbatim, updating placeholder validation message copy for Prompt Vault
- Ensure environment guard rails fall back to placeholders only in development

#### 2.2 Auth Context (`src/contexts/AuthContext.tsx`)
- Reproduce the reference provider to expose `session`, `user`, `loading`, and `signOut`
- Register the `onAuthStateChange` listener and tear it down on unmount
- Export `AuthProvider` and `useAuth` helpers

#### 2.3 Auth Route Control
- Implement `RequireAuth` (under `src/components/auth/RequireAuth.tsx`) mirroring the reference spinner + redirect behaviour
- Update `src/App.tsx` to wrap routes with `AuthProvider` and protect dashboard routes
- Introduce `src/pages/Auth.tsx` with the reference magic-link flow adjusted for Prompt Vault copy

**Exit Criteria**: Visiting any protected route unauthenticated redirects to `/auth`, successful magic-link returns users to their previous path, and sign-out clears session state.

---

## Phase 3: Supabase-aware Data Layer

### Objectives
- Port the reference storage adapter pattern to manage prompts and copy history
- Provide identical async APIs whether backed by Supabase or localStorage

### Implementation Steps

#### 3.1 Supabase Storage Module (`src/data/supabaseStorage.ts`)
- Define `DatabasePrompt`, `DatabasePromptStats`, and `DatabaseCopyEvent` interfaces reflecting migration schema
- Implement CRUD helpers for prompts, copy history, and stats using the reference repo's patterns (`transformDatabaseResource`, optimistic updates, comprehensive error logging)
- Add helper to ensure a stats row exists (`ensurePromptStats`) before updates
- Expose subscription handlers using `supabase.channel(...).on('postgres_changes', ...)` for `prompts` and `copy_history`

#### 3.2 Local Storage Module Updates (`src/data/storage.ts`)
- Ensure functions remain source of truth for offline mode
- Add migration utility to export local prompts/copy history so Supabase adapter can import them on first sign-in

#### 3.3 Hybrid Adapter (`src/data/storageAdapter.ts`)
- Port the reference `getStorageAdapter` factory, returning `SupabaseStorageAdapter` when authenticated
- Expose unified methods for prompts, copy history, stats, subscriptions, and online status
- Add `useStorageAdapter` hook that re-evaluates when the authenticated user changes (dependency on `user?.id`)

#### 3.4 Data Migration on Sign-in
- In `PromptsContext` (and `CopyHistoryContext`), detect first Supabase session and invoke a migration routine that pushes any local data upstream (avoiding duplicates by checking IDs)
- After successful migration, clear migrated localStorage entries to prevent replays

**Exit Criteria**: Calling storage adapter methods yields consistent data regardless of backing store, and real-time updates trigger callback handlers in authenticated mode.

---

## Phase 4: Contexts, Hooks, and UI Integration

### Objectives
- Convert contexts and pages to the async storage pattern used in the reference app
- Ensure loading and error states surface properly across the UI

### Implementation Steps

#### 4.1 PromptsContext Refactor
- Replace direct localStorage manipulation with adapter calls (`getPrompts`, `createPrompt`, `updatePrompt`, `deletePrompt`)
- Compute stats from Supabase data (or read `prompt_stats`) and keep the context API unchanged for consumers
- Provide `loading`, `error`, and `refetch` states similar to `useResources` in the reference repo

#### 4.2 CopyHistoryContext Refactor
- Swap `localStorage` access with adapter methods for `copy_history`
- Maintain the same context API while persisting data for authenticated users
- Subscribe to Supabase real-time changes for cross-tab consistency

#### 4.3 UI Surface Updates
- Update `Dashboard`, `EditorModal`, `CopyHistory`, and dependent components to handle async loading states and errors gracefully (mirroring the reference skeleton spinners)
- Wire real-time subscription cleanup in components using `useEffect`
- Ensure pinned prompts, usage counters, and stats update immediately after mutations

#### 4.4 Routing Adjustments
- Confirm all routes requiring data are wrapped in `RequireAuth`
- Allow `/auth` to remain public and handle redirect query params identical to the reference implementation

**Exit Criteria**: The UI behaves identically to the reference repo in authenticated mode and matches existing behaviour in offline mode.

---

## Phase 5: Environment & Typing

### Objectives
- Document required environment variables and add generated types for type safety

### Implementation Steps

#### 5.1 Environment Template
- Update `.env.example` with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Add notes to `README.md` and `CLAUDE.md` about required env configuration

#### 5.2 Type Generation
```bash
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
```
- Import generated types in `supabaseStorage.ts` to strongly type query results and payloads

**Exit Criteria**: Builds fail fast when env vars are missing, and TypeScript enforces database schema contracts.

---

## Phase 6: Testing & Validation

### Automated Coverage
- Unit tests: storage adapter contract (mocking Supabase client)
- Integration tests: magic-link flow (Playwright or Cypress with Supabase testing project)
- Database tests: exercise RLS policies via Supabase client using multiple sessions

### Manual Checklist
1. Authenticate via magic link and confirm redirect target
2. Create, update, pin, unpin, copy, and delete prompts in authenticated mode
3. Verify copy history entries replicate across browser sessions in real time
4. Sign out and confirm the app falls back to localStorage behaviour
5. Toggle network offline to ensure local mode remains usable
6. Confirm RLS blocks access when calling Supabase with a different session
7. Validate stats totals update when prompts are added or copied

---

## Phase 7: Risk Mitigation & Rollback

- Keep migrations ASCII-only (the reference repo required a follow-up migration when emojis slipped in)
- Run `npx supabase db pull` before pushing migrations to stay in sync with remote schema
- Maintain backup copies of local prompts before first Supabase sync (export to JSON)
- Provide a feature flag that forces local-only mode if Supabase is unavailable
- Use git branches per migration; avoid rewriting applied migrations

---

## Timeline & Dependencies

| Phase | Scope | Duration |
|-------|-------|----------|
| 1 | Supabase CLI setup, schema, migrations | 1-2 days |
| 2 | Auth client, providers, routing | 1 day |
| 3 | Storage adapters and migration | 2-3 days |
| 4 | Context/UI refactor & subscriptions | 2-3 days |
| 5 | Env & typing | 0.5 day |
| 6 | Testing & hardening | 1-2 days |

Total estimate: 7-11 working days depending on migration complexity.

---

## Acceptance Criteria
- Supabase CLI workflow is fully operational and documented
- All Supabase tables, functions, triggers, and policies deploy cleanly
- Prompt Vault runs end-to-end with Supabase auth and database storage
- Offline/localStorage behaviour remains available when not signed in
- Real-time sync functions for prompts and copy history in authenticated sessions
- Documentation (`CLAUDE.md`, README) reflects the new workflow
