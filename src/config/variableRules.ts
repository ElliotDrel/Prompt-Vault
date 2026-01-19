/**
 * Centralized configuration for variable detection and insertion rules
 * All variable-related patterns, constants, and utilities are defined here
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Character limit for prompt payload before duplication
 */
export const CHARACTER_LIMIT = 50000;

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

// ============================================================================
// REGEX PATTERNS
// ============================================================================

/**
 * Regular expression for detecting variable references in text
 * Matches patterns like {variableName} and captures the variable name
 * @example
 * const match = VARIABLE_PATTERN.exec("{userName}");
 * // match[1] === "userName"
 */
export const VARIABLE_PATTERN = /\{([^}]+)\}/g;

/**
 * Create a regex to match a specific variable reference
 * Escapes special regex characters in the variable name
 * @param variableName - The variable name to create a pattern for
 * @returns RegExp that matches {variableName} with proper escaping
 */
export function createVariableRegex(variableName: string): RegExp {
  const escaped = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\{\\s*${escaped}\\s*\\}`, 'g');
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize a variable name for matching purposes
 * Removes all whitespace and converts to lowercase for case-insensitive comparison
 * @param variableName - The variable name to normalize
 * @returns Normalized variable name
 * @example
 * normalizeVariableName("My Variable") // "myvariable"
 * normalizeVariableName("UserName") // "username"
 */
export function normalizeVariableName(variableName: string): string {
  return variableName.replace(/[\s_]+/g, '').toLowerCase();
}

/**
 * Create XML-safe variable name by removing spaces
 * Preserves casing for readability in XML tags
 * @param variableName - The variable name to convert
 * @returns XML-safe variable name
 * @example
 * toXMLVariableName("my variable") // "myvariable"
 * toXMLVariableName("User Name") // "UserName"
 */
export function toXMLVariableName(variableName: string): string {
  return variableName.replace(/\s+/g, '');
}

/**
 * Extract variable name from a match, trimming whitespace
 * @param match - The matched text from VARIABLE_PATTERN
 * @returns Trimmed variable name
 */
export function extractVariableName(match: string): string {
  return match.slice(1, -1).trim(); // Remove { } and trim
}

// ============================================================================
// MATCHING FUNCTIONS
// ============================================================================

/**
 * Check if two variable names match (case-insensitive, whitespace-insensitive)
 * @param var1 - First variable name
 * @param var2 - Second variable name
 * @returns true if variables match after normalization
 */
export function variablesMatch(var1: string, var2: string): boolean {
  return normalizeVariableName(var1) === normalizeVariableName(var2);
}

/**
 * Find a matching variable from a list of defined variables
 * @param referencedVar - The variable reference from the prompt body
 * @param definedVariables - Array of defined variable names
 * @returns The matching defined variable, or undefined if no match
 */
export function findMatchingVariable(
  referencedVar: string,
  definedVariables: string[]
): string | undefined {
  const normalizedRef = normalizeVariableName(referencedVar);
  return definedVariables.find(variable => 
    normalizeVariableName(variable) === normalizedRef
  );
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse all variable references from text
 * Extracts all {variableName} patterns and returns unique variable names
 * @param text - The text to parse
 * @returns Set of unique variable names found in the text
 */
export function parseVariableReferences(text: string): Set<string> {
  const references = new Set<string>();
  const regex = new RegExp(VARIABLE_PATTERN.source, 'g');
  let match;

  while ((match = regex.exec(text)) !== null) {
    const variableName = match[1].trim();
    if (variableName) {
      references.add(variableName);
    }
  }

  return references;
}

/**
 * Check if a specific variable is referenced in the text
 * Uses normalized matching (case-insensitive, whitespace-insensitive)
 * @param variableName - The variable name to check for
 * @param text - The text to search in
 * @returns true if the variable is referenced
 */
export function isVariableReferenced(variableName: string, text: string): boolean {
  const references = parseVariableReferences(text);
  const normalizedVariable = normalizeVariableName(variableName);

  for (const ref of references) {
    if (normalizeVariableName(ref) === normalizedVariable) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a variable as an XML tag with value
 * @param variableName - The variable name
 * @param value - The value to insert
 * @returns XML formatted string like <variableName>value</variableName>
 */
export function formatAsXML(variableName: string, value: string): string {
  const xmlName = toXMLVariableName(variableName);
  return `<${xmlName}>${value}</${xmlName}>`;
}

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


