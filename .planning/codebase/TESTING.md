# Testing Patterns

**Analysis Date:** 2026-01-09

## Test Framework

**Runner:**
- Not detected (no test framework configured)
- No `jest.config.js`, `vitest.config.ts`, or similar found

**Assertion Library:**
- Not applicable (no tests found)

**Run Commands:**
```bash
# No test commands configured in package.json
```

## Test File Organization

**Location:**
- No test files detected
- Pattern: No established pattern (would likely be `*.test.ts` or `*.spec.ts`)

**Naming:**
- Not applicable (no tests found)

**Structure:**
```
No test directory structure exists
```

## Test Structure

**Suite Organization:**
Not applicable - no tests detected

**Patterns:**
- Not applicable

## Mocking

**Framework:**
- Not applicable (no test framework)

**Patterns:**
- Not applicable

**What to Mock:**
- Supabase API calls (when testing is implemented)
- Authentication state
- Context providers
- Browser APIs (localStorage, sessionStorage)

**What NOT to Mock:**
- Pure utility functions
- TypeScript types
- Simple transformations

## Fixtures and Factories

**Test Data:**
Not applicable - no test data patterns established

**Location:**
- Not applicable

## Coverage

**Requirements:**
- No coverage requirements defined
- No coverage tooling configured

**Configuration:**
- Not applicable

**View Coverage:**
Not applicable - no coverage collection

## Test Types

**Unit Tests:**
- Not implemented
- Would test: Utility functions, hooks, isolated components

**Integration Tests:**
- Not implemented
- Would test: Context + component interactions, storage adapter integration

**E2E Tests:**
- Not implemented
- Would test: Full user flows (auth, CRUD, copy operations)

## Common Patterns

**Testing Recommendations (based on architecture):**

Given the current architecture, recommended testing approach:

**Unit Testing:**
```typescript
// Test utility functions
describe('promptUtils', () => {
  describe('detectVariables', () => {
    it('should detect {{variable}} syntax', () => {
      const result = detectVariables('Hello {{name}}');
      expect(result).toEqual(['name']);
    });
  });
});
```

**Component Testing:**
```typescript
// Test components with mocked contexts
describe('PromptCard', () => {
  it('should display prompt title', () => {
    render(
      <PromptsContext.Provider value={mockPromptsContext}>
        <PromptCard prompt={mockPrompt} />
      </PromptsContext.Provider>
    );
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
  });
});
```

**Integration Testing:**
```typescript
// Test context + storage adapter integration
describe('PromptsContext', () => {
  it('should fetch prompts on mount', async () => {
    const mockAdapter = { getAllPrompts: jest.fn() };
    render(
      <StorageAdapterContext.Provider value={mockAdapter}>
        <PromptsProvider>
          <TestComponent />
        </PromptsProvider>
      </StorageAdapterContext.Provider>
    );
    await waitFor(() => {
      expect(mockAdapter.getAllPrompts).toHaveBeenCalled();
    });
  });
});
```

**Async Testing:**
```typescript
// Test async operations with loading states
it('should handle async prompt creation', async () => {
  const { getByText } = render(<PromptEditor />);

  fireEvent.click(getByText('Save'));

  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Prompt created')).toBeInTheDocument();
  });
});
```

**Error Testing:**
```typescript
// Test error handling
it('should display error on failed API call', async () => {
  const mockAdapter = {
    createPrompt: jest.fn().mockRejectedValue(new Error('API Error'))
  };

  render(<PromptEditor />);
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('API Error')).toBeInTheDocument();
  });
});
```

## Testing Gaps

**Critical Areas Needing Tests:**

1. **Authentication Flow:**
   - Magic link sign-in
   - OAuth callback handling
   - Session persistence
   - Token refresh

2. **Prompt CRUD Operations:**
   - Create/Read/Update/Delete prompts
   - Pin/unpin functionality
   - Variable detection
   - Payload building

3. **Copy History:**
   - Copy event creation
   - Infinite scroll pagination
   - Search functionality

4. **Storage Adapter:**
   - Supabase API integration
   - RLS policy enforcement
   - Error handling

5. **Realtime Subscriptions:**
   - WebSocket connection handling
   - Live update propagation
   - Subscription cleanup

6. **Utility Functions:**
   - Variable detection (`promptUtils.ts`)
   - Variable normalization (`variableUtils.ts`)
   - Color assignment (`colorUtils.ts`)

**Recommended Test Setup:**

1. Install test framework: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
2. Add Vitest config: `vitest.config.ts`
3. Create test utilities: `src/test/setup.ts` with context mocks
4. Add test scripts to `package.json`: `"test": "vitest"`
5. Start with critical path: auth, prompt CRUD, copy operations

---

*Testing analysis: 2026-01-09*
*Update when test patterns are established*
