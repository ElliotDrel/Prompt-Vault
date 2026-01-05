# Prompt Detail Page Routing Implementation Plan
**Created:** 2025-01-04
**Status:** Ready for Implementation

---

## 🎯 Project Goal

Replace the modal-based prompt editing flow with dedicated page routes, enabling direct URL access to prompts at `/dashboard/{promptId}` and `/dashboard/new` while maintaining all existing functionality and authentication requirements.

---

## 📋 Requirements

### User Experience
- **Edit Route (`/dashboard/:promptId`)**: Full-page editor for existing prompts
- **Create Route (`/dashboard/new`)**: Full-page editor for new prompts
- **After Save (Edit)**: Stay on the detail page
- **After Save (Create)**: Navigate to `/dashboard/{newId}`
- **After Delete**: Navigate back to `/dashboard`
- **Ownership**: Only the authenticated prompt owner can access their prompts

### Technical Requirements
- Routes protected by `RequireAuth` component
- Invalid prompt IDs show "not found" state (also covers unauthorized access via RLS)
- Browser back button triggers unsaved changes warning
- Preserve all existing editor functionality (variable highlighting, dialogs, pin/unpin)

---

## 🏗️ Architecture Changes

### Route Structure
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/dashboard` | Dashboard | Protected | Prompt list with search/sort |
| `/dashboard/new` | PromptDetail | Protected | Create new prompt |
| `/dashboard/:promptId` | PromptDetail | Protected | Edit existing prompt |

### Component Flow
- **Dashboard** → Click "Create Prompt" → Navigate to `/dashboard/new`
- **Dashboard** → Click PromptCard → Navigate to `/dashboard/{id}`
- **PromptDetail** → Save (create mode) → Navigate to `/dashboard/{newId}`
- **PromptDetail** → Save (edit mode) → Stay on page
- **PromptDetail** → Delete → Navigate to `/dashboard`

---

## 📁 Files to Create

### `src/pages/PromptDetail.tsx`
New page component that serves both create and edit modes:
- Extract `promptId` from URL params using `useParams()`
- Determine mode: `promptId === 'new'` → create mode, otherwise edit mode
- For edit: find prompt from context's `prompts` array
- Handle loading state while prompts fetch
- Handle "not found" state (invalid ID or unauthorized)
- Render `Navigation` component and `PromptEditor`

### `src/components/PromptEditor.tsx`
Refactored from `EditorModal.tsx` for full-page use:
- Remove modal wrapper (AnimatePresence backdrop, `isOpen` prop)
- Convert to inline page component with back button/breadcrumb
- Keep all form state: title, body, variables, colors, validation
- Keep all dialogs: unsaved changes, undefined variables, delete confirmation
- Keep all features: variable highlighting via `HighlightedTextarea`, pin/unpin
- Add React Router's `useBlocker` for browser back button protection
- Modify save behavior per requirements (stay vs navigate)

---

## 📝 Files to Modify

### `src/App.tsx`
Add new protected routes before the catch-all:
- `/dashboard/new` route (must come before `:promptId` to avoid "new" being treated as ID)
- `/dashboard/:promptId` route
- Both wrapped in `<RequireAuth>`
- Import new `PromptDetail` page component

### `src/contexts/PromptsContext.tsx`
Modify `addPrompt` return type:
- Change from `Promise<void>` to `Promise<Prompt>`
- Return the `sanitizedPrompt` after adding to state
- Enables navigation to new prompt's page after creation

### `src/components/Dashboard.tsx`
Remove modal state and update to navigation:
- Remove state: `isModalOpen`, `editingPrompt`
- Remove handlers: `handleEditPrompt`, `handleCloseModal`, `handleSavePrompt`
- Remove import and usage of `EditorModal`
- Update "Create Prompt" buttons to call `navigate('/dashboard/new')`
- Update `PromptCard` onClick to call `navigate(`/dashboard/${prompt.id}`)`

### `src/components/Navigation.tsx`
Update active state highlighting:
- Modify `isActive()` to highlight Dashboard for all `/dashboard/*` routes
- Pattern: `location.pathname.startsWith('/dashboard')` for `/dashboard` path

---

## 🔄 Implementation Phases

### Phase 1: Create Editor Component
1. Create `src/components/PromptEditor.tsx` by extracting logic from `EditorModal.tsx`
2. Remove modal-specific code (backdrop, AnimatePresence for modal)
3. Add back button that calls `navigate('/dashboard')`
4. Keep all form state management, dialogs, and validation logic
5. Test component in isolation

### Phase 2: Create Page Component
1. Create `src/pages/PromptDetail.tsx`
2. Implement mode detection (`promptId === 'new'`)
3. Implement prompt lookup from context for edit mode
4. Add loading and "not found" states
5. Wire up `PromptEditor` with appropriate props

### Phase 3: Update Routes
1. Add new routes to `src/App.tsx`
2. Ensure route order: `/dashboard/new` before `/dashboard/:promptId`
3. Verify routes are protected by `RequireAuth`

### Phase 4: Update Context
1. Modify `addPrompt` in `PromptsContext.tsx` to return created `Prompt`
2. Update `PromptsContextType` interface accordingly
3. Verify existing consumers handle the change

### Phase 5: Update Dashboard
1. Remove modal state and component from `Dashboard.tsx`
2. Update create button to use navigation
3. Update `PromptCard` click to use navigation
4. Update `Navigation.tsx` active state logic

### Phase 6: Browser Navigation
1. Implement `useBlocker` in `PromptEditor` for unsaved changes
2. Test browser back button triggers warning dialog

### Phase 7: Cleanup
1. Remove `EditorModal.tsx` after verifying all functionality migrated
2. Run linter and build to verify no issues

---

## ✅ Testing Checklist

### Routing Tests
- [ ] `/dashboard/new` renders create form (no pre-filled data)
- [ ] `/dashboard/{validId}` renders edit form with prompt data
- [ ] `/dashboard/{invalidId}` shows "not found" state
- [ ] Direct URL access respects authentication (redirects to `/auth`)

### Create Flow Tests
- [ ] Creating prompt saves successfully
- [ ] After create, URL changes to `/dashboard/{newId}`
- [ ] New prompt appears in dashboard list

### Edit Flow Tests
- [ ] Editing prompt saves successfully
- [ ] After save, stays on same page (URL unchanged)
- [ ] Changes reflect in prompt data

### Delete Flow Tests
- [ ] Delete confirmation dialog appears
- [ ] After delete, navigates to `/dashboard`
- [ ] Deleted prompt removed from list

### Unsaved Changes Tests
- [ ] Back button with changes shows warning dialog
- [ ] "Discard" navigates away without saving
- [ ] "Save" saves changes then navigates (or stays)
- [ ] Browser back button triggers warning

### Feature Preservation Tests
- [ ] Variable highlighting works correctly
- [ ] Undefined variables dialog appears when applicable
- [ ] Pin/unpin functionality works
- [ ] Copy functionality works (if on detail page)
- [ ] Variable color assignment persists

### Authorization Tests
- [ ] Cannot access another user's prompt (shows "not found")
- [ ] Unauthenticated access redirects to `/auth`

---

## 🚨 Risk Mitigation

### Low Risk
- Creating new page and editor components (isolated, no existing code affected)
- Adding new routes (additive change)
- Updating Navigation active state (cosmetic)

### Medium Risk
- Removing modal state from Dashboard (must verify all functionality moved)
- Modifying `addPrompt` return type (must check all consumers)
- Extracting EditorModal logic (must preserve all features)

### Rollback Plan
If issues arise:
1. Restore `EditorModal` import and usage in Dashboard
2. Restore modal state (`isModalOpen`, `editingPrompt`)
3. Revert `addPrompt` return type to `Promise<void>`
4. Remove new routes from App.tsx
5. Delete new files (`PromptDetail.tsx`, `PromptEditor.tsx`)

---

## 📊 Success Criteria

### Functional
- Public dashboard shows prompt list at `/dashboard`
- Create flow works end-to-end at `/dashboard/new`
- Edit flow works end-to-end at `/dashboard/{id}`
- Delete navigates back to dashboard
- All existing editor features work (variables, dialogs, pin)

### Quality
- No TypeScript errors
- No ESLint warnings
- Passes `npm run lint`
- Passes `npm run build`
- No console errors in browser

### User Experience
- Direct URL sharing works (user can bookmark/share prompt URLs)
- Navigation intuitive (back button, breadcrumb)
- Unsaved changes protected
- Loading states clear
- Error states informative

---

## 📌 Key Decisions from Discussion

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Create flow | `/dashboard/new` route | Consistent page-based approach |
| After save (edit) | Stay on page | User preference |
| After save (create) | Navigate to new ID | Enable continued editing |
| After delete | Navigate to dashboard | Natural flow back to list |
| Prompt lookup | Use context's `prompts` array | No direct adapter calls from components |

---

## 🔗 Related Files Reference

### Core Files
- **`src/App.tsx`** - Route configuration
- **`src/components/Dashboard.tsx`** - Prompt list, modal state to remove
- **`src/components/EditorModal.tsx`** - Source of editor logic to extract
- **`src/contexts/PromptsContext.tsx`** - `addPrompt` return type change
- **`src/components/auth/RequireAuth.tsx`** - Route protection (no changes)

### Supporting Files
- **`src/components/PromptCard.tsx`** - Click handler update
- **`src/components/Navigation.tsx`** - Active state update
- **`src/components/HighlightedTextarea.tsx`** - Reused in PromptEditor
- **`src/types/prompt.ts`** - Prompt interface (no changes)

---

## ✨ Future Enhancements (Not in Scope)

- Shareable public prompt URLs (read-only view for non-owners)
- Prompt versioning with history at `/dashboard/{id}/history`
- Duplicate prompt action
- Keyboard shortcuts for save/cancel
- Auto-save drafts

---

**Status:** Ready for implementation
