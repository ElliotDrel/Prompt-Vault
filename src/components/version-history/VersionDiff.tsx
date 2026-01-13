import { memo } from 'react';
import { computeDiff } from '@/utils/diffUtils';

/**
 * Makes whitespace visible in diff output by replacing newlines with visible symbols.
 * Only applies to change spans (added/removed), not unchanged text.
 * Shows ↵ symbol before each newline to make the change obvious.
 */
function renderWithVisibleWhitespace(text: string, isChange: boolean): React.ReactNode {
  if (!isChange) {
    // Unchanged text - render as-is
    return text;
  }

  // For changes, make newlines visible with ↵ symbol
  const parts = text.split('\n');
  if (parts.length === 1) {
    return text; // No newlines, render as-is
  }

  // Render each line with visible newline symbols
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          <span className="opacity-90">↵</span>
          {'\n'}
        </>
      )}
    </span>
  ));
}

interface VersionDiffProps {
  /** Original text (previous version) */
  oldText: string;
  /** Modified text (current version) */
  newText: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show diff highlighting (default: true) */
  showHighlighting?: boolean;
}

/**
 * Renders word-level diff between two text strings with inline highlighting.
 *
 * Visual indicators:
 * - Unchanged text: default text color
 * - Added text: green background
 * - Removed text: red background with strikethrough
 *
 * Uses word-level diffing for better prose readability.
 * Preserves whitespace and formatting in output.
 *
 * @example
 * <VersionDiff
 *   oldText="Hello world"
 *   newText="Hello everyone"
 * />
 * // Renders: "Hello" (unchanged), "world" (red strikethrough), "everyone" (green)
 */
export const VersionDiff = memo(function VersionDiff({
  oldText,
  newText,
  className,
  showHighlighting = true,
}: VersionDiffProps) {
  // Handle edge cases: null/undefined inputs
  const safeOldText = oldText ?? '';
  const safeNewText = newText ?? '';

  // When highlighting is off, just show the new text without diff markup
  if (!showHighlighting) {
    return (
      <div className={`whitespace-pre-wrap text-sm ${className ?? ''}`}>
        {safeNewText}
      </div>
    );
  }

  // Identical strings - no diff to show
  if (safeOldText === safeNewText) {
    return (
      <div className={`whitespace-pre-wrap text-sm ${className ?? ''}`}>
        {safeNewText}
      </div>
    );
  }

  const changes = computeDiff(safeOldText, safeNewText);

  return (
    <div className={`whitespace-pre-wrap text-sm ${className ?? ''}`}>
      {changes.map((change, index) => {
        if (change.added) {
          return (
            <span
              key={index}
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {renderWithVisibleWhitespace(change.value, true)}
            </span>
          );
        }

        if (change.removed) {
          return (
            <span
              key={index}
              className="bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300"
            >
              {renderWithVisibleWhitespace(change.value, true)}
            </span>
          );
        }

        // Unchanged text
        return <span key={index}>{renderWithVisibleWhitespace(change.value, false)}</span>;
      })}
    </div>
  );
});
