import { diffWords, type Change } from 'diff';

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
