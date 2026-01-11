import { memo } from 'react';
import { computeDiff } from '@/utils/diffUtils';

interface VersionDiffProps {
  /** Original text (previous version) */
  oldText: string;
  /** Modified text (current version) */
  newText: string;
  /** Optional additional CSS classes */
  className?: string;
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
}: VersionDiffProps) {
  // Handle edge cases: null/undefined inputs
  const safeOldText = oldText ?? '';
  const safeNewText = newText ?? '';

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
              {change.value}
            </span>
          );
        }

        if (change.removed) {
          return (
            <span
              key={index}
              className="bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300"
            >
              {change.value}
            </span>
          );
        }

        // Unchanged text
        return <span key={index}>{change.value}</span>;
      })}
    </div>
  );
});
