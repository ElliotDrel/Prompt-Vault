# Architecture

**Analysis Date:** 2026-01-09

## Pattern Overview

**Overall:** Single Page Application (SPA) with Context-based State Management

**Key Characteristics:**
- React-based client-side rendered application
- Context API for global state management
- TanStack Query for server state caching
- Protected routes with authentication guards
- Remote-only Supabase backend (no local database)

## Layers

**Presentation Layer:**
- Purpose: UI components and user interactions
- Contains: Pages, components, UI primitives
- Location: `src/pages/*.tsx`, `src/components/**/*.tsx`, `src/components/ui/**/*.tsx`
- Depends on: Context layer for state, utility layer for helpers
- Used by: Router (entry point)

**Context Layer:**
- Purpose: Global state management and business logic orchestration
- Contains: React contexts for auth, prompts, copy history, storage adapter
- Location: `src/contexts/*.tsx`
- Depends on: Storage layer, Supabase client
- Used by: All components via hooks (`useAuth`, `usePromptsContext`, etc.)
- Key contexts:
  - `AuthContext` (`src/contexts/AuthContext.tsx`) - Authentication state
  - `PromptsContext` (`src/contexts/PromptsContext.tsx`) - Prompt CRUD operations
  - `CopyHistoryContext` (`src/contexts/CopyHistoryContext.tsx`) - Copy event tracking
  - `StorageAdapterContext` (`src/contexts/StorageAdapterContext.tsx`) - Storage abstraction

**Storage Layer:**
- Purpose: Data persistence and Supabase API abstraction
- Contains: Storage adapter interface and Supabase implementation
- Location: `src/lib/storage/*.ts`
- Depends on: Supabase client (`src/lib/supabaseClient.ts`)
- Used by: Context layer only (never directly from components)
- Pattern: Adapter pattern for storage abstraction

**Utility Layer:**
- Purpose: Shared helpers and pure functions
- Contains: Prompt variable detection, color utilities, validation
- Location: `src/utils/*.ts`, `src/lib/utils.ts`
- Depends on: Standard library only
- Used by: All other layers

## Data Flow

**Application Initialization:**

1. User loads application → `src/main.tsx` renders `<App />`
2. App sets up provider hierarchy (`src/App.tsx`):
   - QueryClientProvider (TanStack Query)
   - AuthProvider (session restoration)
   - StorageAdapterProvider (Supabase adapter initialization)
   - PromptsProvider (prompt state management)
   - CopyHistoryProvider (history state management)
3. Router determines route → renders page component
4. Protected routes check authentication → redirect to `/auth` if needed

**Authenticated Data Flow (Prompt CRUD):**

1. Component calls context hook: `const { addPrompt } = usePromptsContext()`
2. Context method invoked: `await addPrompt(promptData)`
3. Context calls storage adapter: `await storageAdapter.createPrompt(...)`
4. Adapter makes Supabase API call with RLS enforcement
5. Realtime subscription receives update event
6. Context triggers background refresh (silent mode, no loading spinner)
7. Component re-renders with updated data

**Authentication Flow:**

1. User initiates sign-in (magic link or OAuth) → calls `AuthContext` method
2. AuthContext uses Supabase Auth API
3. OAuth: redirect to provider → callback to `/auth` → code exchange
4. Magic link: email sent → user clicks link → code exchange at `/auth`
5. Session established → context updates state → user redirected to `/dashboard`
6. Token auto-refresh handled by Supabase client

**State Management:**
- Server state: TanStack Query caching (30s stale time)
- Global state: React Context (auth, prompts, history)
- Local state: Component-level useState/useReducer
- Temporary state: sessionStorage for WIP forms

## Key Abstractions

**Context:**
- Purpose: Global state containers with business logic
- Examples: `AuthContext`, `PromptsContext`, `CopyHistoryContext`, `StorageAdapterContext`
- Pattern: Provider pattern with custom hooks

**Storage Adapter:**
- Purpose: Abstract data persistence layer
- Implementation: `src/lib/storage/supabaseAdapter.ts`
- Interface: `src/lib/storage/types.ts`
- Pattern: Adapter pattern (enables future storage implementations)

**Protected Route:**
- Purpose: Authentication guard for routes
- Implementation: `RequireAuth` component (`src/components/auth/RequireAuth.tsx`)
- Pattern: Higher-order component that redirects unauthenticated users

**Page Component:**
- Purpose: Top-level route components
- Examples: `Index`, `Auth`, `CopyHistory`, `PromptDetail`, `Landing`
- Location: `src/pages/*.tsx`
- Pattern: Container components that compose smaller components

## Entry Points

**Browser Entry:**
- Location: `src/main.tsx`
- Triggers: User navigates to site
- Responsibilities: Mount React root, render `<App />`

**Application Root:**
- Location: `src/App.tsx`
- Triggers: Mounted by `main.tsx`
- Responsibilities: Set up providers, configure router, define routes

**Route Pages:**
- Location: `src/pages/*.tsx`
- Triggers: Router matches URL path
- Responsibilities: Render page content, fetch data, handle user interactions

## Error Handling

**Strategy:** Context-level error handling with loading/error states

**Patterns:**
- Async operations wrapped in try/catch blocks
- Context methods return promises that consumers must handle
- Components display loading spinners and error messages
- Toast notifications for user-facing errors (react-hot-toast, sonner)

## Cross-Cutting Concerns

**Logging:**
- Console logs for development (should be removed before production)
- No structured logging service

**Validation:**
- Zod schemas for data validation (implied from dependency)
- Form validation via react-hook-form

**Authentication:**
- Supabase Auth with automatic token refresh
- RLS policies enforce server-side authorization
- RequireAuth component for route protection

**Realtime Updates:**
- Supabase realtime subscriptions in contexts
- Background refresh pattern (silent mode to avoid UI disruption)
- Stable dependencies to prevent re-subscription loops

---

*Architecture analysis: 2026-01-09*
*Update when major patterns change*
