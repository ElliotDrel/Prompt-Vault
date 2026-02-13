---
phase: variable-xml-replacement
plan: FIX
type: fix
status: complete
resolved: 2026-01-19
commit: 4e4d67d
---

<objective>
Fix VAR-001: Labeled standalone variables no longer receive XML wrapping.

Source: ISSUES.md (VAR-001)
Priority: Major (broken functionality)

**Root Cause:**
Commit 630e47a changed proximity detection from "newlines add distance" to "skip all whitespace within 50 chars." This fixed XML-wrapped variables but broke labeled standalone variables.

**Solution:**
Implement two-layer detection:
1. XML boundary detection (skip whitespace) - for `<tag>\n{var}\n</tag>` patterns
2. General proximity detection (respect whitespace) - for everything else

This handles all three cases correctly without either behavior leaking into the other.
</objective>

<context>
**Issue being fixed:**
@Planning and Task Files/1-19 - Variable XML Replacement Fix/ISSUES.md (VAR-001)

**Key files:**
- src/config/variableRules.ts (proximity detection logic)
- src/utils/promptUtils.ts (uses proximity to determine XML vs direct replacement)

**Related commits:**
- 630e47a: "Simplify variable proximity detection by skipping whitespace" (introduced regression)
- 05883e4: "Add JSDoc documentation to hasNearbyContent function"
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restore original proximity constants</name>
  <files>src/config/variableRules.ts</files>
  <action>
Replace the current `PROXIMITY_SCAN_RANGE` constant with the original proximity constants:

```typescript
/**
 * Proximity distance for general content detection.
 * Variables with non-space characters within this distance use direct replacement.
 * Intentionally restrictive (3 chars) so labeled variables remain "isolated".
 */
const PROXIMITY_DISTANCE = 3;

/**
 * Effective distance newlines count as when checking proximity.
 * Set to 3 so that even a single newline creates enough distance to isolate a variable.
 * This ensures patterns like "Input:\n\n{var}" get XML wrapping.
 */
const NEWLINE_DISTANCE = 3;

/**
 * Maximum characters to scan when looking for XML boundaries.
 * Whitespace is skipped during this scan (unlike general proximity).
 */
const XML_BOUNDARY_SCAN_RANGE = 50;
```

Remove the old `PROXIMITY_SCAN_RANGE = 50` constant.
  </action>
  <verify>
- Three new constants exist with proper JSDoc
- Old PROXIMITY_SCAN_RANGE removed
- No TypeScript errors
  </verify>
  <done>Original proximity constants restored with XML boundary scan range added</done>
</task>

<task type="auto">
  <name>Task 2: Implement isBetweenXmlBoundaries function</name>
  <files>src/config/variableRules.ts</files>
  <action>
Add a new function to detect if a variable is inside XML tags:

```typescript
/**
 * Check if variable sits between XML tag boundaries: >...{var}...<
 *
 * Algorithm:
 * 1. Scan left from variable, skipping whitespace, looking for >
 * 2. Scan right from variable, skipping whitespace, looking for <
 * 3. Validate the < is actually a tag start (not math like "x < 5")
 *
 * This handles patterns like:
 * - <tag>{var}</tag>
 * - <tag>\n  {var}\n</tag>
 * - <tag>\n\n{var}\n\n</tag>
 */
function isBetweenXmlBoundaries(text: string, startIndex: number, endIndex: number): boolean {
  // Check for > before (skipping whitespace)
  let foundClosingBracket = false;
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - XML_BOUNDARY_SCAN_RANGE); i--) {
    const char = text[i];
    if (/\s/.test(char)) continue; // Skip whitespace
    foundClosingBracket = (char === '>');
    break;
  }

  if (!foundClosingBracket) {
    return false;
  }

  // Check for < after (skipping whitespace)
  let openingBracketIndex = -1;
  for (let i = endIndex; i < Math.min(text.length, endIndex + XML_BOUNDARY_SCAN_RANGE); i++) {
    const char = text[i];
    if (/\s/.test(char)) continue; // Skip whitespace
    if (char === '<') {
      openingBracketIndex = i;
    }
    break;
  }

  if (openingBracketIndex === -1) {
    return false;
  }

  // Validate the < is actually a tag start, not math like "x < 5"
  const charAfterBracket = text[openingBracketIndex + 1];
  if (charAfterBracket === undefined) {
    return false;
  }

  // Valid tag starts: </ (closing), <letter (opening), <? (processing), <! (doctype/comment)
  const isValidTagStart =
    charAfterBracket === '/' ||
    charAfterBracket === '?' ||
    charAfterBracket === '!' ||
    /[a-zA-Z]/.test(charAfterBracket);

  return isValidTagStart;
}
```

Place this function after `formatAsXML` and before `hasNearbyNonSpaceCharacters`.
  </action>
  <verify>
- Function exists with proper JSDoc
- Scans for > before and < after
- Validates tag structure to avoid math false positives
- No TypeScript errors
  </verify>
  <done>XML boundary detection function implemented</done>
</task>

<task type="auto">
  <name>Task 3: Implement hasAdjacentContent function (restore original logic)</name>
  <files>src/config/variableRules.ts</files>
  <action>
Replace the current `hasNearbyContent` function with the original proximity logic:

```typescript
/**
 * Check for adjacent content using strict proximity rules.
 *
 * CRITICAL: This function does NOT skip whitespace uniformly.
 * Newlines add NEWLINE_DISTANCE to the running distance count.
 * This preserves "isolated" detection for patterns like:
 * - "## Input\n\n{var}" → isolated (newlines add distance)
 * - "Hello {name}!" → adjacent (no newlines)
 */
function hasAdjacentContent(text: string, index: number, direction: 'before' | 'after'): boolean {
  if (direction === 'before') {
    const searchStart = Math.max(0, index - PROXIMITY_DISTANCE);
    const beforeText = text.substring(searchStart, index);
    let distance = 0;

    for (let i = beforeText.length - 1; i >= 0; i--) {
      const char = beforeText[i];
      if (char === '\n') {
        distance += NEWLINE_DISTANCE;
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character - check if within proximity
        if (distance + (beforeText.length - 1 - i) <= PROXIMITY_DISTANCE) {
          return true;
        }
        break;
      } else {
        distance += 1;
      }

      // Early exit if we've exceeded proximity
      if (distance > PROXIMITY_DISTANCE) break;
    }
  } else {
    const searchEnd = Math.min(text.length, index + PROXIMITY_DISTANCE);
    const afterText = text.substring(index, searchEnd);
    let distance = 0;

    for (let i = 0; i < afterText.length; i++) {
      const char = afterText[i];
      if (char === '\n') {
        distance += NEWLINE_DISTANCE;
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character - check if within proximity
        if (distance + i <= PROXIMITY_DISTANCE) {
          return true;
        }
        break;
      } else {
        distance += 1;
      }

      // Early exit if we've exceeded proximity
      if (distance > PROXIMITY_DISTANCE) break;
    }
  }

  return false;
}
```

Remove the old `hasNearbyContent` function that skipped all whitespace.
  </action>
  <verify>
- Function uses PROXIMITY_DISTANCE and NEWLINE_DISTANCE
- Newlines add distance instead of being skipped
- Early exit when distance exceeds threshold
- No TypeScript errors
  </verify>
  <done>Original proximity logic restored with newline distance weighting</done>
</task>

<task type="auto">
  <name>Task 4: Update hasNearbyNonSpaceCharacters with two-layer detection</name>
  <files>src/config/variableRules.ts</files>
  <action>
Update the main detection function to use two-layer approach:

```typescript
/**
 * Determines if a variable should use direct replacement or XML wrapping.
 *
 * Decision order (explicit precedence):
 * 1. If variable is between XML tag boundaries (>...{var}...<) → direct replacement
 * 2. If variable has immediately adjacent content (within PROXIMITY_DISTANCE) → direct replacement
 * 3. Otherwise → XML wrapping
 *
 * IMPORTANT: Rule 1 skips whitespace. Rule 2 does NOT skip whitespace (newlines add distance).
 * This distinction is intentional - it allows XML-wrapped variables to work across newlines
 * while preserving "isolated" detection for labeled variables like "## Input\n\n{var}".
 *
 * @param text - The full text to search in
 * @param variableRegex - Regex matching the specific variable
 * @returns true if non-whitespace characters are found nearby (use direct replacement)
 */
export function hasNearbyNonSpaceCharacters(text: string, variableRegex: RegExp): boolean {
  const matches = Array.from(text.matchAll(new RegExp(variableRegex.source, 'g')));

  for (const match of matches) {
    if (match.index === undefined) continue;
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    // Rule 1: XML boundary detection (skips whitespace, validates tag structure)
    if (isBetweenXmlBoundaries(text, startIndex, endIndex)) {
      return true;
    }

    // Rule 2: Strict proximity detection (newlines ADD distance, not skip)
    if (hasAdjacentContent(text, startIndex, 'before') ||
        hasAdjacentContent(text, endIndex, 'after')) {
      return true;
    }
  }

  // Rule 3: No nearby content found → will use XML wrapping
  return false;
}
```

Update the JSDoc to clearly document the precedence rules.
  </action>
  <verify>
- Function checks XML boundaries first
- Falls back to proximity detection second
- JSDoc documents the explicit precedence
- No TypeScript errors
  </verify>
  <done>Two-layer detection implemented with clear precedence</done>
</task>

<task type="auto">
  <name>Task 5: Build and lint verification</name>
  <files>N/A</files>
  <action>
Run build and lint to ensure no errors:

```bash
npm run lint
npm run build
```

Fix any TypeScript or ESLint errors that arise.
  </action>
  <verify>
- `npm run lint` passes (warnings OK)
- `npm run build` succeeds
  </verify>
  <done>Code compiles and lints cleanly</done>
</task>

<task type="human">
  <name>Task 6: Manual testing - all three variable patterns</name>
  <files>N/A</files>
  <action>
Test all three variable replacement scenarios:

**Test A: XML-wrapped variable (should use direct replacement)**
1. Create prompt with body:
   ```
   <context>
   {variable}
   </context>
   ```
2. Fill in variable value: "test content"
3. Copy prompt
4. Expected: `<context>\ntest content\n</context>` (no double XML)

**Test B: Labeled standalone variable (should use XML wrapping)**
1. Create prompt with body:
   ```
   ## Input

   {All Comments}

   ---
   ```
2. Fill in variable value: "user feedback here"
3. Copy prompt
4. Expected: `## Input\n\n<AllComments>user feedback here</AllComments>\n\n---`

**Test C: Inline embedded variable (should use direct replacement)**
1. Create prompt with body: `Hello {name}! Welcome.`
2. Fill in variable value: "Alice"
3. Copy prompt
4. Expected: `Hello Alice! Welcome.` (no XML)

**Test D: Edge case - math operators (should use direct replacement)**
1. Create prompt with body: `x > {value} < 5`
2. Fill in variable value: "3"
3. Copy prompt
4. Expected: `x > 3 < 5` (direct replacement - math operators are valid nearby content)
  </action>
  <verify>
- Test A: No double XML wrapping
- Test B: Variable wrapped with XML tags
- Test C: Direct replacement, no XML
- Test D: Direct replacement (math operators count as adjacent content)
  </verify>
  <done>All four test scenarios pass</done>
</task>

</tasks>

<verification>
All verification items complete:
- [x] Original proximity constants restored (PROXIMITY_DISTANCE=3, NEWLINE_DISTANCE=3)
- [x] XML boundary detection added (isBetweenXmlBoundaries)
- [x] Proximity detection respects newlines as distance (hasAdjacentContent)
- [x] Two-layer detection with explicit precedence (hasNearbyNonSpaceCharacters)
- [x] Build and lint pass
- [x] All four manual test scenarios pass
</verification>

<success_criteria>
- VAR-001 resolved: Labeled standalone variables receive XML wrapping again
- No regression: XML-wrapped variables still work correctly
- No regression: Inline embedded variables still work correctly
- Code is well-documented with explicit precedence rules
</success_criteria>

<regression_tests>
These test cases should be verified after implementation:

| Category | Input Pattern | Expected | Validates |
|----------|---------------|----------|-----------|
| **A. XML-wrapped** | `<tag>\n{var}\n</tag>` | Direct | XML detection across newlines |
| | `<tag> {var} </tag>` | Direct | XML detection with spaces |
| | `<tag>\n\n{var}\n\n</tag>` | Direct | XML detection across multiple newlines |
| | `<div attr="x">\n{var}\n</div>` | Direct | Attributes don't break detection |
| **B. Labeled standalone** | `## Input\n\n{var}\n\n---` | XML wrap | Newlines create isolation |
| | `Summary:\n{var}` | XML wrap | Single newline creates isolation |
| | `Input:\n\n{var}` | XML wrap | Colon + newlines = isolated |
| **C. Inline embedded** | `Hello {name}!` | Direct | Adjacent punctuation detected |
| | `({name})` | Direct | Brackets detected |
| | `the {name} is` | Direct | Words on both sides |
| **D. Edge cases** | `x > {var} < 5` | Direct | Math operators are adjacent content |
| | `{var}` (alone) | XML wrap | Completely isolated |
| | `\n\n\n{var}\n\n\n` | XML wrap | Only whitespace = isolated |
</regression_tests>

<output>
After completion, create `Planning and Task Files/1-19 - Variable XML Replacement Fix/FIX-SUMMARY.md`
</output>

---

## Resolution Summary

**Status:** ✅ Complete
**Resolved:** 2026-01-19
**Commit:** `4e4d67d`

### Test Results

| Test | Pattern | Expected | Result |
|------|---------|----------|--------|
| A | XML-wrapped `<tag>\n{var}\n</tag>` | Direct replacement | ✅ Pass |
| B | Labeled standalone `## Input\n\n{var}` | XML wrapping | ✅ Pass |
| C | Inline embedded `Hello {var}!` | Direct replacement | ✅ Pass |
| D | Math operators `x > {var} < 5` | Direct replacement | ✅ Pass |

### Changes Made

1. **Restored proximity constants** (Task 1)
   - `PROXIMITY_DISTANCE = 3`
   - `NEWLINE_DISTANCE = 3`
   - `XML_BOUNDARY_SCAN_RANGE = 50`

2. **Added `isBetweenXmlBoundaries()`** (Task 2)
   - Scans for `>` before and `<` after variable
   - Skips whitespace during scan
   - Validates tag structure to avoid math operator false positives

3. **Added `hasAdjacentContent()`** (Task 3)
   - Strict proximity detection with newline distance weighting
   - Newlines add `NEWLINE_DISTANCE` instead of being skipped
   - Early exit when distance exceeds threshold

4. **Updated `hasNearbyNonSpaceCharacters()`** (Task 4)
   - Two-layer detection with explicit precedence
   - Rule 1: XML boundary detection (skips whitespace)
   - Rule 2: General proximity detection (respects whitespace)
   - Rule 3: No nearby content → XML wrapping
