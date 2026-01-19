# Issues: Variable XML Replacement Regression

**Discovered:** 2026-01-19
**Source:** PR #34 (commit 630e47a "Simplify variable proximity detection by skipping whitespace")
**Reporter:** User via code review

## Resolved Issues

### VAR-001: Labeled standalone variables no longer receive XML wrapping ✅

**Discovered:** 2026-01-19
**Resolved:** 2026-01-19
**Severity:** Major (Broken functionality)
**Feature:** Variable replacement / XML wrapping logic
**Resolution:** Commit `4e4d67d` - Implemented two-layer proximity detection

**Description:**
After commit 630e47a simplified the variable proximity detection logic, labeled standalone variables like `## Input\n\n{All Comments}\n\n---` no longer receive XML wrapping. The variable is now directly replaced with its value instead of being wrapped as `<AllComments>value</AllComments>`.

**Expected:**
- Variables separated from content by blank lines should be considered "isolated"
- Isolated variables should be wrapped with XML tags: `<VariableName>value</VariableName>`
- Pattern `## Input\n\n{All Comments}\n\n---` should produce `## Input\n\n<AllComments>value</AllComments>\n\n---`

**Actual:**
- Variables are now directly replaced regardless of blank line separation
- Pattern `## Input\n\n{All Comments}\n\n---` produces `## Input\n\nvalue\n\n---`
- XML semantic structure is lost

**Repro:**
1. Create a prompt with body:
   ```
   ## Input

   {All Comments}

   ---
   ```
2. Add "All Comments" as a variable
3. Fill in a value and copy the prompt
4. Observe: value is directly inserted, not wrapped in `<AllComments>` tags

**Root Cause Analysis:**

The change in commit 630e47a fundamentally altered the definition of "nearby content":

| Aspect | Before (Working) | After (Regression) |
|--------|------------------|-------------------|
| Scan range | `PROXIMITY_DISTANCE = 3` | `PROXIMITY_SCAN_RANGE = 50` |
| Whitespace handling | Newlines add `+3` distance | All whitespace skipped |
| Effect | `\n\n` = 6 distance (exceeds 3) | `\n\n` skipped, finds "Input" |

**Before (Original Logic):**
```
Text: ## Input\n\n{All Comments}
       ↑
Looking before {All Comments}:
- Position -1: \n (adds +3 distance = 3)
- Position -2: \n (adds +3 distance = 6)
- Distance 6 > PROXIMITY_DISTANCE (3)
- "Input" is never reached
- Result: hasNearbyNonSpaceCharacters → false → XML wrapping ✓
```

**After (New Logic):**
```
Text: ## Input\n\n{All Comments}
       ↑
Looking before {All Comments}:
- Position -1: \n (skip - whitespace)
- Position -2: \n (skip - whitespace)
- Position -3: t (found non-whitespace!)
- "Input" is within 50 chars
- Result: hasNearbyNonSpaceCharacters → true → direct replacement ✗
```

**Why The Change Was Made:**
The original code had a bug with multi-line XML patterns like:
```xml
<context>
{variable}
</context>
```
The newline-as-distance approach incorrectly treated this as "isolated" and double-wrapped with XML.

**Why The Fix Broke Other Cases:**
The fix was too broad. By changing to "skip ALL whitespace within 50 chars," it also changed behavior for labeled/standalone variables where the blank line separation was intentional semantic structure.

**Recommended Fix:**
Implement two-layer detection:
1. **XML boundary detection** (skip whitespace): Check for `>` before and `<` after
2. **General proximity detection** (respect whitespace): Restore original `PROXIMITY_DISTANCE = 3` with `NEWLINE_DISTANCE = 3`

This separates the concerns:
- XML-wrapped variables (`<tag>\n{var}\n</tag>`) → direct replacement
- Labeled standalone variables (`## Input\n\n{var}`) → XML wrapping
- Inline embedded variables (`Hello {name}!`) → direct replacement

---

## Related Context

### Original Bug (Fixed by 630e47a)
Multi-line XML patterns were incorrectly getting double-wrapped:
```
Input:  <context>\n{var}\n</context>
Before: <context>\n<var>value</var>\n</context>  ← double XML (bug)
After:  <context>\nvalue\n</context>             ← direct replacement (correct)
```

### Regression Introduced (This Issue)
Labeled standalone patterns lost their XML wrapping:
```
Input:  ## Input\n\n{var}\n\n---
Before: ## Input\n\n<var>value</var>\n\n---      ← XML wrapped (correct)
After:  ## Input\n\nvalue\n\n---                 ← direct replacement (regression)
```

### Solution Requirements
The fix must handle all three cases correctly:

| Category | Input Pattern | Expected Output | Detection |
|----------|---------------|-----------------|-----------|
| XML-wrapped | `<tag>\n{var}\n</tag>` | Direct replacement | XML boundary detection |
| Labeled standalone | `## Input\n\n{var}` | XML wrapping | Proximity with newline distance |
| Inline embedded | `Hello {name}!` | Direct replacement | Immediate adjacency |

---

## Affected Files

- `src/config/variableRules.ts` - Contains `hasNearbyNonSpaceCharacters()` and proximity constants
- `src/utils/promptUtils.ts` - Uses proximity detection to determine XML vs direct replacement

---

*Issue tracking for Variable XML Replacement Fix*
*Discovered: 2026-01-19*
