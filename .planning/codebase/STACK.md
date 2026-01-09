# Technology Stack

**Analysis Date:** 2026-01-09

## Languages

**Primary:**
- TypeScript 5.5 - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- JavaScript - Build configuration (`eslint.config.js`, `postcss.config.js`, `vite.config.ts`)

## Runtime

**Environment:**
- Browser runtime (React SPA)
- Node.js 18+ (development tooling)

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3 - UI library
- React Router 6.26 - Client-side routing with data router API
- Vite 7.1 - Build tool and dev server

**UI Framework:**
- shadcn/ui - Component library (Radix UI primitives + Tailwind)
- Tailwind CSS 3.4 - Utility-first CSS framework
- Framer Motion 12.23 - Animation library

**State Management:**
- React Context API - Global state (`AuthContext`, `PromptsContext`, `CopyHistoryContext`)
- TanStack Query 5.56 - Server state management and caching

**Build/Dev:**
- TypeScript 5.5 - Type checking and compilation
- ESLint 9.9 - Linting with react-hooks plugin
- Vite 7.1 - Fast bundling and HMR
- Husky 9.0 - Git hooks

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.58 - Backend API and authentication (`src/lib/supabaseClient.ts`)
- `@tanstack/react-query` 5.56 - Data fetching and caching (`src/App.tsx`)
- `react-router-dom` 6.26 - Routing (`src/App.tsx`)
- `zod` 3.23 - Schema validation (`package.json` - used for type safety)

**UI Components:**
- `@radix-ui/*` packages - Accessible component primitives (20+ packages)
- `lucide-react` 0.462 - Icon library
- `class-variance-authority` 0.7 - Component variant management
- `clsx` 2.1 / `tailwind-merge` 2.5 - Conditional className utilities

**Utilities:**
- `react-hook-form` 7.53 - Form state management with `@hookform/resolvers` 3.9
- `date-fns` 3.6 - Date formatting
- `react-hot-toast` 2.5 + `sonner` 1.5 - Toast notifications

**Analytics:**
- `@vercel/analytics` 1.6 - Production analytics (`src/App.tsx`)

## Configuration

**Environment:**
- `.env` files for environment variables
- `.env.example` documents required variables
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (validated in `src/lib/supabaseClient.ts`)

**Build:**
- `vite.config.ts` - Vite configuration (port 2902, path aliases)
- `tsconfig.json` - TypeScript compiler options (with `@/*` path alias)
- `tsconfig.app.json` - App-specific TS config
- `tsconfig.node.json` - Node tooling TS config
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - ESLint rules
- `postcss.config.js` - PostCSS configuration

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js)
- Browser with modern JavaScript support
- No Docker required (remote-only Supabase development)

**Production:**
- Vercel (primary deployment target - `vercel.json` present)
- Static file hosting (Vite builds to `dist/`)
- Modern browser with ES modules support

---

*Stack analysis: 2026-01-09*
*Update after major dependency changes*
