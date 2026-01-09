# Codebase Structure

**Analysis Date:** 2026-01-09

## Directory Layout

```
Prompt-Vault/
├── .claude/                # Claude Code configuration
├── .github/                # GitHub Actions workflows (if any)
├── .husky/                 # Git hooks
├── .planning/              # Project planning documents (newly created)
│   └── codebase/          # Codebase analysis documents
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
├── src/                    # Application source code
│   ├── components/        # React components
│   ├── contexts/          # React contexts (state management)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Library code and integrations
│   ├── pages/             # Route page components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── supabase/              # Supabase configuration and migrations
│   ├── migrations/        # Database schema migrations
│   └── config.toml        # Supabase project config
├── dist/                  # Build output (gitignored)
├── node_modules/          # Dependencies (gitignored)
└── [config files]         # vite.config.ts, tsconfig.json, etc.
```

## Directory Purposes

**src/components/**
- Purpose: Reusable UI components
- Contains: Feature components, layout components, UI primitives
- Key files:
  - `Dashboard.tsx` - Main dashboard layout
  - `PromptCard.tsx` - Prompt list item
  - `PromptEditor.tsx` - Prompt creation/edit form
  - `PromptView.tsx` - Prompt display with variable inputs
  - `HighlightedTextarea.tsx` - Syntax-highlighted textarea
  - `Navigation.tsx` - Main navigation component
  - `LandingNav.tsx` - Landing page navigation
  - `StatsCounter.tsx` - Usage statistics display
  - `CopyEventCard.tsx` - Copy history card
  - `InfiniteScrollContainer.tsx` - Infinite scroll wrapper
  - `ScrollToTop.tsx` - Scroll restoration component
- Subdirectories:
  - `auth/` - Authentication components (`RequireAuth.tsx`)
  - `ui/` - shadcn/ui components (60+ files, auto-generated)

**src/contexts/**
- Purpose: Global state management via React Context
- Contains: Context providers and custom hooks
- Key files:
  - `AuthContext.tsx` - Authentication state and methods
  - `PromptsContext.tsx` - Prompt CRUD operations and state
  - `CopyHistoryContext.tsx` - Copy event tracking and history
  - `StorageAdapterContext.tsx` - Storage layer abstraction
- Subdirectories: None (flat structure)

**src/hooks/**
- Purpose: Custom React hooks
- Contains: Reusable stateful logic
- Key files:
  - `use-mobile.tsx` - Mobile breakpoint detection
  - `use-toast.ts` - Toast notification hook (shadcn/ui)
  - `useInfiniteCopyEvents.ts` - Infinite scroll for copy history
  - `usePromptCopyHistory.ts` - Prompt-specific copy history
- Subdirectories: None

**src/lib/**
- Purpose: Library integrations and utilities
- Contains: Supabase client, storage adapters, shared utilities
- Key files:
  - `supabaseClient.ts` - Supabase client initialization and helpers
  - `database.types.ts` - Database type definitions
  - `utils.ts` - Shared utility functions (className merging, etc.)
- Subdirectories:
  - `storage/` - Storage layer abstraction
    - `index.ts` - Exports
    - `types.ts` - Storage adapter interface
    - `supabaseAdapter.ts` - Supabase implementation

**src/pages/**
- Purpose: Top-level route components
- Contains: One component per route
- Key files:
  - `Index.tsx` - Dashboard (home) page `/dashboard`
  - `Auth.tsx` - Authentication page `/auth`
  - `Landing.tsx` - Landing page `/`
  - `CopyHistory.tsx` - Copy history page `/history`
  - `PromptDetail.tsx` - Prompt detail page `/dashboard/prompt/:id` and `/dashboard/prompt/new`
  - `NotFound.tsx` - 404 page
- Subdirectories: None (flat structure)

**src/types/**
- Purpose: TypeScript type definitions
- Contains: Shared types and interfaces
- Key files:
  - `prompt.ts` - Prompt data types
  - `supabase-generated.ts` - Auto-generated Supabase types
- Subdirectories: None

**src/utils/**
- Purpose: Utility functions and helpers
- Contains: Pure functions for data transformation
- Key files:
  - `promptUtils.ts` - Variable detection, payload building
  - `variableUtils.ts` - Variable normalization and matching
  - `colorUtils.ts` - Color assignment for variable highlighting
- Subdirectories: None

**src/config/**
- Purpose: Application configuration constants
- Contains: Feature flags, limits, rules
- Key files:
  - `copyHistory.ts` - Copy history result limits
  - `variableRules.ts` - Variable syntax rules
- Subdirectories: None

**supabase/**
- Purpose: Supabase project configuration
- Contains: Database migrations, Edge functions (if any), config
- Key files:
  - `config.toml` - Supabase auth and project settings
- Subdirectories:
  - `migrations/` - 11 SQL migration files (chronologically ordered)

**scripts/**
- Purpose: Build and maintenance scripts
- Contains: Node.js scripts
- Key files:
  - `sync-agents.cjs` - Sync AGENTS.md with CLAUDE.md
  - `check-agents-sync.cjs` - Verify AGENTS.md and CLAUDE.md are in sync
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React application entry point
- `src/App.tsx` - Router and provider setup
- `index.html` - HTML entry point

**Configuration:**
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration (root)
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node tooling TypeScript config
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - ESLint linting rules
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Environment variable template
- `components.json` - shadcn/ui configuration

**Core Logic:**
- `src/contexts/*.tsx` - State management and business logic
- `src/lib/storage/*.ts` - Data persistence layer
- `src/utils/*.ts` - Shared utility functions

**Testing:**
- Not detected (no test files found)

**Documentation:**
- `README.md` - Basic project documentation
- `CLAUDE.md` - Codebase instructions for Claude Code
- `AGENTS.md` - Mirror of CLAUDE.md for agent reference

## Naming Conventions

**Files:**
- PascalCase.tsx: React components (`PromptCard.tsx`, `Dashboard.tsx`)
- camelCase.ts: TypeScript modules (`promptUtils.ts`, `supabaseClient.ts`)
- kebab-case.tsx: UI components (`use-mobile.tsx`, `use-toast.ts`)
- UPPERCASE.md: Important project files (`README.md`, `CLAUDE.md`)

**Directories:**
- lowercase: All directories (`src/`, `components/`, `contexts/`)
- Plural for collections: `components/`, `contexts/`, `hooks/`, `pages/`, `utils/`

**Special Patterns:**
- `*.types.ts`: Type definition files (`database.types.ts`)
- `use-*.ts`: Custom hooks (`use-mobile.tsx`, `use-toast.ts`)
- `*Context.tsx`: React context providers

## Where to Add New Code

**New Page:**
- Implementation: `src/pages/{PageName}.tsx`
- Route definition: Add to `src/App.tsx` router config
- Navigation: Update `src/components/Navigation.tsx`

**New Component:**
- Reusable component: `src/components/{ComponentName}.tsx`
- UI primitive: `src/components/ui/{component-name}.tsx` (use shadcn/ui CLI)
- Page-specific: Co-locate with page in `src/pages/` or keep in `src/components/`

**New Context:**
- Implementation: `src/contexts/{Feature}Context.tsx`
- Provider: Add to `src/App.tsx` provider hierarchy
- Hook export: `export const use{Feature} = () => useContext({Feature}Context)`

**New Hook:**
- Implementation: `src/hooks/use{HookName}.ts`
- Tests: Co-locate `src/hooks/use{HookName}.test.ts` (if testing implemented)

**New Utility:**
- Pure functions: `src/utils/{category}Utils.ts`
- Shared helpers: `src/lib/utils.ts`
- Type definitions: `src/types/{category}.ts`

**New Config:**
- Application config: `src/config/{feature}.ts`
- Build config: Root directory (e.g., `vite.config.ts`)

**New Database Migration:**
- Create: `npx supabase migration new {description}`
- Location: `supabase/migrations/{timestamp}_{description}.sql`
- Apply: `npx supabase db push`

## Special Directories

**.planning/**
- Purpose: Project planning and documentation
- Source: Created by GSD workflow (this command)
- Committed: Yes (project documentation)

**dist/**
- Purpose: Vite build output
- Source: Generated by `npm run build`
- Committed: No (in `.gitignore`)

**node_modules/**
- Purpose: npm dependencies
- Source: Installed by `npm install`
- Committed: No (in `.gitignore`)

**src/components/ui/**
- Purpose: shadcn/ui component library
- Source: Generated by `npx shadcn-ui add {component}`
- Committed: Yes (customizable components)

---

*Structure analysis: 2026-01-09*
*Update when directory structure changes*
