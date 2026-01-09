# Codebase Concerns

**Analysis Date:** 2026-01-09

## Tech Debt

**Relaxed TypeScript strict mode:**
- Issue: TypeScript strict checks disabled (`noImplicitAny: false`, `strictNullChecks: false`)
- Files: `tsconfig.json`
- Why: Likely for rapid prototyping during MVP development
- Impact: Potential runtime null/undefined errors, implicit any types reduce type safety
- Fix approach: Incrementally enable strict mode (start with `strictNullChecks`, then `noImplicitAny`)

**No test coverage:**
- Issue: Zero test files in codebase (no unit, integration, or E2E tests)
- Impact: No safety net for refactoring, potential regressions, difficult to verify behavior
- Fix approach: Start with critical paths (auth, prompt CRUD), add Vitest + Testing Library

**Manual formatting:**
- Issue: No Prettier config detected, inconsistent code formatting possible
- Why: Not prioritized during initial development
- Impact: Code style variations, merge conflicts, harder code review
- Fix approach: Add `.prettierrc` config, run format on codebase, add pre-commit hook

## Known Bugs

**No known bugs documented:**
- No TODO/FIXME/HACK comments found in codebase
- No open issues referenced in code
- Either: codebase is stable, or issues not tracked in code comments

## Security Considerations

**Client-side environment variables:**
- Risk: Supabase credentials exposed in client bundle (VITE_ prefix makes them public)
- Files: `.env`, `src/lib/supabaseClient.ts`
- Current mitigation: Using anon key (designed for client-side), RLS policies enforce authorization
- Recommendations: This is expected for Supabase; ensure RLS policies are comprehensive and tested

**No Content Security Policy:**
- Risk: XSS attacks possible without CSP headers
- Current mitigation: React escapes content by default, Supabase handles auth tokens securely
- Recommendations: Add CSP headers in Vercel deployment (`vercel.json` headers config)

**No rate limiting:**
- Risk: API abuse possible (unlimited requests to Supabase)
- Current mitigation: Supabase has built-in rate limiting on free tier
- Recommendations: Monitor API usage, implement client-side request throttling for bulk operations

## Performance Bottlenecks

**No virtualization for large lists:**
- Problem: Prompt cards and copy history rendered without virtualization
- Files: `src/components/Dashboard.tsx`, `src/pages/CopyHistory.tsx`
- Measurement: Potential slow render with 100+ prompts
- Cause: Simple map() rendering all items
- Improvement path: Already has `@tanstack/react-virtual` dependency; use `InfiniteScrollContainer.tsx` pattern or virtual list

**Infinite scroll for copy history:**
- Status: Already implemented using `useInfiniteCopyEvents.ts` hook
- Files: `src/hooks/useInfiniteCopyEvents.ts`, `src/components/InfiniteScrollContainer.tsx`
- Performance: Good - only loads 50 items at a time (configurable in `src/config/copyHistory.ts`)

**TanStack Query caching:**
- Status: Configured with 30s stale time (reasonable for this app)
- Files: `src/App.tsx` (QueryClient config)
- Performance: Good - reduces unnecessary refetches

## Fragile Areas

**Realtime subscription management:**
- Files: `src/contexts/PromptsContext.tsx`, `src/contexts/CopyHistoryContext.tsx`
- Why fragile: WebSocket connections can drop, re-subscription logic is complex
- Common failures: Token refresh triggers re-render, subscription cleanup races
- Safe modification: Use stable dependencies (primitive values, not objects), handle all status events
- Test coverage: None (should mock Supabase realtime events)
- Notes: CLAUDE.md documents lessons learned (use `authUserId`, silent background refresh)

**Variable detection and highlighting:**
- Files: `src/utils/promptUtils.ts`, `src/utils/variableUtils.ts`, `src/components/HighlightedTextarea.tsx`
- Why fragile: String normalization must be consistent across detection, payload building, and UI
- Common failures: Variable mismatch between detection and substitution, normalization inconsistencies
- Safe modification: Always normalize with `normalizeVariableName`, test all comparison points
- Test coverage: None (critical area for unit tests)

**Context dependency hierarchy:**
- Files: `src/App.tsx` (provider order)
- Why fragile: Contexts depend on each other (AuthProvider → StorageAdapterProvider → PromptsProvider → CopyHistoryProvider)
- Common failures: Incorrect provider order breaks app, context used before provider mounted
- Safe modification: Never reorder providers, add new providers at correct hierarchy level
- Test coverage: None (integration tests would catch ordering issues)

## Scaling Limits

**Supabase Free Tier (if applicable):**
- Current capacity: Unknown subscription tier
- Limits (free tier): 500MB database, 2GB bandwidth/month, 50,000 monthly active users
- Symptoms at limit: 429 rate limit errors, database writes fail
- Scaling path: Upgrade to Pro tier ($25/mo), optimize query efficiency

**Client-side state management:**
- Current capacity: All prompts loaded into memory at once
- Limit: ~1000 prompts before UI sluggishness
- Symptoms at limit: Slow renders, high memory usage
- Scaling path: Implement pagination or virtualization for prompt list

**Copy history pagination:**
- Status: Already implemented with infinite scroll (50 items per page)
- Files: `src/config/copyHistory.ts` (COPY_HISTORY_LIMIT = 50)
- Scaling: Good - handles thousands of events efficiently

## Dependencies at Risk

**react-hot-toast:**
- Risk: Deprecated in favor of sonner (both are in dependencies)
- Files: `package.json`, `src/App.tsx`
- Impact: Using two toast libraries increases bundle size
- Migration plan: Remove `react-hot-toast`, migrate all toasts to `sonner`

**Future React Router v7:**
- Risk: Router config uses future flags for v7 compatibility
- Files: `src/App.tsx` (router config with future flags)
- Impact: Breaking changes when upgrading to v7
- Migration plan: Flags already enabled, should be smooth upgrade when v7 releases

**No dependency vulnerabilities detected:**
- Run `npm audit` to check for known security issues in dependencies

## Missing Critical Features

**No error boundary:**
- Problem: Uncaught errors crash entire app (white screen)
- Current workaround: No error recovery, full page reload needed
- Blocks: User experience degrades on errors, no error reporting
- Implementation complexity: Low (React Error Boundary component)

**No user settings UI:**
- Problem: Time saved multiplier stored in database but no UI to change it
- Files: `user_settings` table exists, but no settings page
- Current workaround: Use default multiplier (5 minutes)
- Blocks: Users can't customize time tracking
- Implementation complexity: Medium (new page + form + mutation)

**No prompt search:**
- Problem: Can't search prompts by title or content
- Current workaround: Manual scrolling through list
- Blocks: Finding prompts difficult with large libraries
- Implementation complexity: Medium (search input + filter logic or backend search function)

**No prompt tags/categories:**
- Problem: No way to organize prompts
- Current workaround: Pin important prompts
- Blocks: Organizing large prompt libraries
- Implementation complexity: Medium (new table, migration, UI for tags)

**No export/import:**
- Problem: Can't backup or migrate prompts between accounts
- Current workaround: Manual copy-paste
- Blocks: Data portability, backup
- Implementation complexity: Medium (JSON export/import)

## Test Coverage Gaps

**Complete test absence:**
- What's not tested: Everything (0% coverage)
- Risk: Any change could break existing functionality
- Priority: High for critical paths, Medium for UI-only features
- Difficulty to test: Medium (need to set up test framework, mock Supabase)

**Critical areas needing tests (priority order):**

1. **Authentication flow** (High priority)
   - Files: `src/contexts/AuthContext.tsx`, `src/components/auth/RequireAuth.tsx`
   - Risk: Auth breaks, users locked out

2. **Prompt CRUD operations** (High priority)
   - Files: `src/contexts/PromptsContext.tsx`, `src/lib/storage/supabaseAdapter.ts`
   - Risk: Data loss, corruption

3. **Variable detection and substitution** (High priority)
   - Files: `src/utils/promptUtils.ts`, `src/utils/variableUtils.ts`
   - Risk: Incorrect prompt output, user confusion

4. **Copy history tracking** (Medium priority)
   - Files: `src/contexts/CopyHistoryContext.tsx`
   - Risk: Usage stats incorrect

5. **Realtime subscriptions** (Medium priority)
   - Files: Context files with realtime logic
   - Risk: Stale data, memory leaks

6. **Utility functions** (Low priority)
   - Files: `src/utils/*.ts`, `src/lib/utils.ts`
   - Risk: Minor bugs in helpers

## Documentation Gaps

**Comprehensive CLAUDE.md:**
- Status: Excellent documentation in `CLAUDE.md` and `AGENTS.md`
- Covers: Architecture, workflows, conventions, troubleshooting, migration patterns
- Quality: Very detailed, well-maintained

**Missing inline documentation:**
- Complex functions lack JSDoc comments
- No architecture diagrams (ASCII diagrams in CLAUDE.md are helpful)
- Component props not documented with JSDoc

**No user-facing docs:**
- README.md is minimal (just getting started)
- No user guide or feature documentation
- No API documentation (internal use only)

---

*Concerns audit: 2026-01-09*
*Update as issues are fixed or new ones discovered*
