# Coding Conventions

**Analysis Date:** 2026-01-09

## Naming Patterns

**Files:**
- PascalCase.tsx for React components (`PromptCard.tsx`, `Dashboard.tsx`)
- camelCase.ts for TypeScript modules (`promptUtils.ts`, `supabaseClient.ts`)
- kebab-case for hooks and UI components (`use-mobile.tsx`, `alert-dialog.tsx`)
- *.types.ts for type definitions (`database.types.ts`)

**Functions:**
- camelCase for all functions (`detectVariables`, `buildPromptPayload`)
- No special prefix for async functions
- handleEventName for event handlers (`handleSubmit`, `handleCopy`)
- use{HookName} for custom hooks (`useAuth`, `usePromptsContext`)

**Variables:**
- camelCase for variables (`promptData`, `userId`)
- UPPER_SNAKE_CASE for constants (`COPY_HISTORY_LIMIT` in `src/config/copyHistory.ts`)
- No underscore prefix for private members (TypeScript private keyword preferred)

**Types:**
- PascalCase for interfaces (`Prompt`, `CopyEvent`, `StorageAdapter`)
- PascalCase for type aliases (`Database`, `PromptWithMetadata`)
- No "I" prefix for interfaces
- PascalCase for enums (none detected in codebase)

## Code Style

**Formatting:**
- No Prettier config detected (manual formatting or IDE defaults)
- Line length: Not enforced (assumed 80-100 characters)
- Quotes: Single quotes for strings (observed pattern)
- Semicolons: Required (TypeScript default)
- Indentation: 2 spaces (Vite/React default)

**Linting:**
- ESLint with `eslint.config.js`
- Extends: `@eslint/js` recommended, `typescript-eslint`, `react-hooks`, `react-refresh`
- Run: `npm run lint`

**TypeScript:**
- Strict mode: Partially disabled (per `tsconfig.json`)
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedParameters: false`
  - `noUnusedLocals: false`
- Path aliases: `@/*` maps to `src/*`
- `skipLibCheck: true` (skip type checking of .d.ts files)

## Import Organization

**Order:**
1. React and React-related imports
2. External packages (UI libraries, utilities)
3. Internal modules (`@/contexts`, `@/lib`, `@/components`)
4. Relative imports (`.`, `..`)
5. Styles (if any)

**Grouping:**
- Blank lines between import groups (not strictly enforced)
- No automatic sorting observed

**Path Aliases:**
- `@/` maps to `src/` (configured in `tsconfig.json` and `vite.config.ts`)
- Examples: `@/components/ui/button`, `@/contexts/AuthContext`, `@/lib/utils`

## Error Handling

**Patterns:**
- Async operations wrapped in try/catch at context level
- Errors thrown from contexts, caught in components
- User-facing errors displayed via toast notifications (react-hot-toast, sonner)
- Loading/error states managed in components

**Error Types:**
- Standard Error class (no custom error types detected)
- Error messages include context (`throw new Error('Missing VITE_SUPABASE_URL environment variable')`)

**Async:**
- async/await pattern throughout (no .then() chains observed)
- Promises returned from context methods, consumers handle with try/catch

## Logging

**Framework:**
- console.log for development debugging
- No production logging service

**Patterns:**
- Console logs should be removed before production (per CLAUDE.md guidelines)
- No structured logging detected
- Error logs typically in catch blocks

## Comments

**When to Comment:**
- Explain non-obvious business logic
- Document complex algorithms
- Note workarounds or temporary solutions
- Architecture decisions (found in CLAUDE.md, not inline)

**JSDoc/TSDoc:**
- Not consistently used
- Type signatures provide documentation via TypeScript
- Some inline comments for clarification

**TODO Comments:**
- No TODO/FIXME/HACK comments found in current codebase
- Pattern (from CLAUDE.md): TODO comments should be tracked in issues

## Function Design

**Size:**
- No strict limit enforced
- Components vary from small (10-20 lines) to large (100+ lines)
- Context providers tend to be larger due to multiple methods

**Parameters:**
- Destructuring common in function parameters
- No strict parameter count limit
- Object parameters for complex configurations

**Return Values:**
- Explicit returns preferred
- Early returns for guard clauses
- Async functions return Promises

## Module Design

**Exports:**
- Named exports preferred (`export const`, `export function`)
- Default exports for page components and React components
- Contexts export both provider and hook: `export const AuthContext`, `export const useAuth`

**Barrel Files:**
- `src/lib/storage/index.ts` re-exports from `types.ts` and `supabaseAdapter.ts`
- `src/components/ui/` components use individual exports (no index.ts)
- No widespread use of barrel files

**Component Patterns:**
- Functional components only (no class components)
- Hooks for state management
- Context providers wrap children

## React-Specific Conventions

**Hooks:**
- useState/useEffect/useCallback/useMemo used throughout
- Custom hooks start with "use" prefix
- Dependencies arrays carefully managed (per CLAUDE.md: avoid re-renders)

**Context:**
- Context providers in `src/contexts/`
- Custom hook for consuming context (`useAuth`, `usePromptsContext`)
- Never import storage adapters directly - always use contexts

**Components:**
- Functional components with TypeScript
- Props interfaces defined inline or as separate types
- Children passed via props (React.ReactNode type)

**State Management:**
- Context API for global state
- TanStack Query for server state
- Local useState for component state
- sessionStorage for temporary WIP data

## Supabase-Specific Patterns

**Client Usage:**
- Single Supabase client instance in `src/lib/supabaseClient.ts`
- Helper functions exported for common operations
- Never call Supabase directly from components - use storage adapter

**Migrations:**
- Forward-only migrations (never edit applied migrations)
- ASCII-only SQL (no emojis)
- RLS policies for all tables
- Naming: `{timestamp}_{description}.sql`

**Type Generation:**
- Types generated via `npx supabase gen types typescript --linked`
- Output: `src/types/supabase-generated.ts`
- PowerShell-safe: Use `Out-File -Encoding utf8` on Windows

---

*Convention analysis: 2026-01-09*
*Update when patterns change*
