<!-- de9e7406-c111-4c58-a4f6-326cb5bbd9d6 485c5faa-6a9e-424b-b5cd-084e4d030b4b -->
# Variable Highlighting Implementation Plan

## What We're Building

A live syntax highlighting system for the prompt editor that visually indicates variable references using color-coding. When users type `{variableName}` in the prompt body, the text will be highlighted with a unique color that matches the corresponding variable chip above the input area. This creates a clear visual connection between variable definitions and their usage.

## How It Will Work

### User Experience Flow

1. User opens the EditorModal to create/edit a prompt
2. As they type in the prompt body, any `{variableName}` references are immediately highlighted
3. Each defined variable gets assigned a unique, vibrant color
4. The variable chip (pill) and its text references share the same color
5. Variables that are defined but NOT used in the prompt remain grey
6. All highlighting updates in real-time as the user types

### Technical Architecture

**Overlay-Based Highlighting Approach:**

- Keep the existing `<Textarea>` component for user input
- Add a synchronized background `<div>` that renders highlighted text
- The textarea will have a transparent background, allowing highlights to show through
- Both elements must maintain perfect alignment (font, padding, scrolling, line-height)

**Color Assignment System:**

- Create a predefined palette of 10-12 distinct, vibrant colors (HSL format for light/dark mode compatibility)
- Assign colors deterministically based on variable array order
- Recalculate assignments when variables are added/removed
- Track which variables are mentioned in the prompt body

## Implementation Steps

### Phase 1: Color Management System

**File: `src/utils/colorUtils.ts` (NEW FILE)**

Create a utility module for color assignment and management:

- Define a color palette of distinct colors using HSL values that work in both light/dark modes
- Example colors: vibrant blue, purple, pink, orange, green, teal, red, yellow, indigo, emerald
- Function: `assignVariableColors(variables: string[], promptBody: string)` 
  - Returns a Map of variable names to color values
  - Variables mentioned in prompt get assigned colors from the palette
  - Variables NOT mentioned get grey color
- Function: `parseVariableReferences(text: string)` 
  - Extract all `{variableName}` patterns from text
  - Return set of referenced variable names
- Function: `isVariableMentioned(variable: string, promptBody: string)`
  - Check if a specific variable appears in the prompt body

**Why this approach:** Separating color logic into a dedicated utility ensures consistency across components, makes testing easier, and follows single-responsibility principle. Using HSL colors ensures compatibility with the existing design system and dark mode.

### Phase 2: Highlighted Textarea Component

**File: `src/components/HighlightedTextarea.tsx` (NEW FILE)**

Create a specialized textarea component with highlighting capabilities:

```typescript
interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  placeholder?: string;
  rows?: number;
  className?: string;
}
```

Component structure:

- Wrapper `<div>` with `relative` positioning
- Background `<div>` (highlight layer) with `absolute` positioning
  - Parse `value` to find `{variableName}` patterns
  - Apply `<mark>` or `<span>` elements with background colors
  - Must match textarea's exact font, padding, line-height, and scroll position
- Foreground `<textarea>` with transparent/minimal background
  - Handle user input
  - Sync scroll events with highlight layer
  - Forward all standard textarea props

Styling requirements:

- Both layers use identical: `font-family`, `font-size`, `line-height`, `padding`, `border`
- Textarea has `bg-transparent` and `relative z-10`
- Highlight layer has `pointer-events-none` to allow textarea interaction
- Use `whitespace-pre-wrap` and `word-wrap: break-word` for proper text wrapping
- Synchronized scrolling via `onScroll` event handler

**Why this approach:** This overlay technique maintains native textarea functionality (cursor, selection, accessibility) while adding visual enhancements. It's more reliable than contentEditable approaches and doesn't require external dependencies like CodeMirror. The component is reusable and can be extracted for use elsewhere in the app if needed.

### Phase 3: Update EditorModal

**File: `src/components/EditorModal.tsx`**

Integrate the new highlighting system:

**Step 3.1:** Import new utilities and component

```typescript
import { HighlightedTextarea } from './HighlightedTextarea';
import { assignVariableColors } from '@/utils/colorUtils';
```

**Step 3.2:** Add state for color management

```typescript
const [variableColors, setVariableColors] = useState<Map<string, string>>(new Map());
```

**Step 3.3:** Add effect to update colors when variables or body changes

```typescript
useEffect(() => {
  const colors = assignVariableColors(variables, body);
  setVariableColors(colors);
}, [variables, body]);
```

**Step 3.4:** Replace `<Textarea>` component (lines 221-228) with `<HighlightedTextarea>`

```typescript
<HighlightedTextarea
  id="body"
  placeholder="Your prompt text with {variables} in curly braces"
  value={body}
  onChange={(value) => setBody(value)}
  variables={variables}
  rows={8}
  className="text-sm resize-none"
/>
```

**Step 3.5:** Update variable chip rendering (lines 250-263)

Currently variable chips use `bg-secondary` (grey). Modify to use dynamic colors:

```typescript
{variables.map(variable => {
  const color = variableColors.get(variable) || 'bg-secondary';
  const isGrey = color === 'bg-secondary';
  
  return (
    <div
      key={variable}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${color}`}
      style={!isGrey ? { backgroundColor: color, color: '#fff' } : {}}
    >
      <span>{variable}</span>
      <button
        onClick={() => removeVariable(variable)}
        className="text-current hover:text-white ml-1"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
})}
```

**Why these changes:** The EditorModal is the orchestrator that manages the variable and prompt state. By adding color management here, we ensure colors stay synchronized as users add/remove variables or modify the prompt text. The live updates happen automatically through React's state management.

### Phase 4: Styling & Polish

**File: `src/index.css` (if needed)**

Add any necessary CSS for the highlighted textarea:

- Ensure highlight marks have proper contrast in both light/dark modes
- Add smooth transitions for color changes (optional)
- Ensure text selection still works properly over highlights

**Testing considerations:**

- Verify alignment stays perfect with long text and line wrapping
- Test with all 12+ color variations
- Confirm dark mode compatibility
- Ensure performance with large prompts (1000+ characters)
- Test edge cases: empty variables `{}`, nested braces `{{}}`, special characters

**Why this matters:** The highlighting must feel native and performant. Any misalignment or lag will break the user experience. Proper CSS ensures the feature works seamlessly across themes and viewport sizes.

### Phase 5: Advanced Features (LAST - After All Core Features Work)

**File: `src/components/EditorModal.tsx` or new dialog component**

Add detection for undefined variables:

1. Modify `HighlightedTextarea` or `EditorModal` to detect `{undefinedVariable}` patterns

   - Parse prompt body for all `{...}` patterns  
   - Compare against `variables` array
   - Track undefined variable names

2. Show confirmation dialog when undefined variables detected:

   - Use existing `AlertDialog` component from shadcn/ui
   - Message: "Found undefined variable '{varName}'. Would you like to add it to your variables?"
   - "Add Variable" button → adds to variables array
   - "Ignore" button → dismiss dialog, don't highlight

3. Consider UX flow:

   - Show dialog on blur or with slight delay (don't interrupt typing)
   - Allow adding multiple undefined variables at once
   - Provide "Don't ask again" option (store in local state)

**Why implement last:** This feature depends on the core highlighting working perfectly. It adds complexity around when/how to show dialogs without annoying users. Get the foundation solid first, then add this enhancement.

## Technical Decisions & Rationale

### Why Overlay vs ContentEditable?

- **Overlay:** Maintains native textarea behavior, better accessibility, easier to implement
- **ContentEditable:** Complex state management, cursor positioning issues, accessibility challenges
- **Decision:** Overlay approach for reliability and maintainability

### Why Client-Side Color Assignment?

- Colors are purely presentational
- No need to persist to database
- Faster user experience (no API calls)
- Consistent within editing session

### Why HSL Color Format?

- Matches existing design system (see `src/index.css` lines 10-98)
- Easy to adjust lightness for dark mode
- Better semantic control over colors

### Why Real-Time Updates?

- User requested live highlighting (Question 5, Option A)
- Modern React handles frequent re-renders efficiently
- Immediate feedback improves UX and helps users catch mistakes

### Why Separate Component?

- Reusability: Could use HighlightedTextarea elsewhere
- Testability: Easier to unit test in isolation  
- Maintainability: Clear separation of concerns
- Single Responsibility: One component = one job

## Long-Term Stability Considerations

1. **Performance:** Parsing and color assignment on every keystroke could slow down with very large prompts. Implemented with O(n) complexity and simple regex - should handle up to 10,000 characters smoothly.

2. **Accessibility:** The overlay approach maintains ARIA attributes and screen reader compatibility from native textarea.

3. **Dark Mode:** Using HSL colors allows easy lightness adjustment. Each color in palette will have light/dark variants.

4. **Scalability:** Color palette supports 12 variables by default. If users need more, the system cycles through colors (variable 13 gets color 1, etc.).

5. **Browser Compatibility:** Uses standard CSS and DOM APIs. Works in all modern browsers (Chrome, Firefox, Safari, Edge).

6. **Code Maintainability:** Clear separation between utilities (colorUtils), UI components (HighlightedTextarea), and business logic (EditorModal) makes future changes easier.

## Files Summary

**New Files:**

- `src/utils/colorUtils.ts` - Color assignment and variable parsing logic
- `src/components/HighlightedTextarea.tsx` - Reusable highlighted textarea component

**Modified Files:**

- `src/components/EditorModal.tsx` - Integration of highlighting system and variable chip colors
- `src/index.css` - (Optional) Additional styling for highlights

**No Changes Needed:**

- `src/types/prompt.ts` - No data model changes required
- `src/utils/promptUtils.ts` - Existing prompt logic unchanged

### To-dos

- [ ] Create colorUtils.ts with color palette, variable color assignment, and parsing functions
- [ ] Build HighlightedTextarea component with overlay-based highlighting and scroll synchronization
- [ ] Update EditorModal to use HighlightedTextarea and apply dynamic colors to variable chips
- [ ] Add CSS refinements for dark mode, text selection, and visual polish
- [ ] Add detection and dialog for undefined variables in curly brackets