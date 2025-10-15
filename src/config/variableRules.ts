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
 * Proximity distance for determining XML vs direct replacement
 * Variables with non-space characters within this distance use direct replacement
 * Variables isolated by this distance use XML format
 */
export const PROXIMITY_DISTANCE = 3;

/**
 * Effective distance newlines count as when checking proximity
 */
export const NEWLINE_DISTANCE = 3;

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
  return new RegExp(`\\{${escaped}\\}`, 'g');
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
  return variableName.replace(/\s+/g, '').toLowerCase();
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
 * Check if there are non-space characters within proximity distance
 * Used to determine whether to use XML format or direct replacement
 * @param text - The full text to search in
 * @param variableRegex - Regex matching the specific variable
 * @returns true if non-space characters are within proximity distance
 */
export function hasNearbyNonSpaceCharacters(text: string, variableRegex: RegExp): boolean {
  const matches = Array.from(text.matchAll(new RegExp(variableRegex.source, 'g')));
  
  for (const match of matches) {
    if (match.index === undefined) continue;
    
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    
    // Check before the variable
    if (checkProximity(text, startIndex, 'before')) {
      return true;
    }
    
    // Check after the variable
    if (checkProximity(text, endIndex, 'after')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Helper function to check proximity in a specific direction
 * @param text - The full text
 * @param index - The starting index
 * @param direction - 'before' or 'after'
 * @returns true if non-space character found within proximity
 */
function checkProximity(text: string, index: number, direction: 'before' | 'after'): boolean {
  if (direction === 'before') {
    const beforeText = text.substring(Math.max(0, index - PROXIMITY_DISTANCE), index);
    let distance = 0;
    
    for (let i = beforeText.length - 1; i >= 0; i--) {
      const char = beforeText[i];
      if (char === '\n') {
        distance += NEWLINE_DISTANCE;
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character
        if (distance + (beforeText.length - 1 - i) <= PROXIMITY_DISTANCE) {
          return true;
        }
        break;
      } else {
        distance += 1;
      }
    }
  } else {
    const afterText = text.substring(index, Math.min(text.length, index + PROXIMITY_DISTANCE));
    let distance = 0;
    
    for (let i = 0; i < afterText.length; i++) {
      const char = afterText[i];
      if (char === '\n') {
        distance += NEWLINE_DISTANCE;
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character
        if (distance + i <= PROXIMITY_DISTANCE) {
          return true;
        }
        break;
      } else {
        distance += 1;
      }
    }
  }
  
  return false;
}

