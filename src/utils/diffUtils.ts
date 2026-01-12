import { diffWords, type Change } from 'diff';

export type ComparisonMode = 'previous' | 'current';

/**
 * Compares two prompts for content equality.
 * Only compares content fields (title, body, variables), not metadata.
 *
 * @param prompt1 - First prompt content
 * @param prompt2 - Second prompt content
 * @returns true if title, body, and variables are all identical
 */
export function arePromptsIdentical(
  prompt1: { title: string; body: string; variables: string[] },
  prompt2: { title: string; body: string; variables: string[] }
): boolean {
  if (prompt1.title !== prompt2.title) return false;
  if (prompt1.body !== prompt2.body) return false;

  // Compare variables arrays
  if (prompt1.variables.length !== prompt2.variables.length) return false;
  for (let i = 0; i < prompt1.variables.length; i++) {
    if (prompt1.variables[i] !== prompt2.variables[i]) return false;
  }

  return true;
}

/**
 * Returns the correct old/new values for diff comparison based on mode.
 *
 * Diff direction semantics:
 * - 'previous' mode: Shows what changed FROM previous TO this version
 *   → old = previousVersion, new = version
 * - 'current' mode: Shows what changed FROM this version TO current
 *   → old = version, new = currentPrompt
 *
 * This ensures "added" (green) always means content that exists in the
 * more recent state, and "removed" (red) means content from the older state.
 *
 * @param version - The historical version being displayed
 * @param comparisonTarget - Either previousVersion or currentPrompt depending on mode
 * @param comparisonMode - 'previous' or 'current'
 * @returns Object with old and new values in correct order for diffing
 */
export function getComparisonPair<T>(
  version: T,
  comparisonTarget: T,
  comparisonMode: ComparisonMode
): { old: T; new: T } {
  if (comparisonMode === 'current') {
    // version -> current (old to new)
    return { old: version, new: comparisonTarget };
  }
  // previous -> version (old to new)
  return { old: comparisonTarget, new: version };
}

/**
 * Computes word-level diff between two text strings.
 *
 * Returns an array of change objects where:
 * - Objects with neither `added` nor `removed` represent unchanged text
 * - Objects with `added: true` represent text added in newText
 * - Objects with `removed: true` represent text deleted from oldText
 *
 * Uses word-level diffing for better readability with prose content.
 * Whitespace is ignored when computing the diff but preserved in output.
 *
 * @param oldText - Original text (previous version)
 * @param newText - Modified text (current version)
 * @returns Array of change objects with value, added, removed properties
 *
 * @example
 * const changes = computeDiff("Hello world", "Hello everyone");
 * // Returns: [
 * //   { value: "Hello " },
 * //   { value: "world", removed: true },
 * //   { value: "everyone", added: true }
 * // ]
 */
export function computeDiff(oldText: string, newText: string): Change[] {
  return diffWords(oldText, newText);
}
