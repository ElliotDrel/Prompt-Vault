import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PromptVersion, Prompt } from '@/types/prompt';
import { computeDiff } from '@/utils/diffUtils';
import { VariableChanges } from './VariableChanges';

interface VersionListItemProps {
  /**
   * The version to display
   */
  version: PromptVersion;

  /**
   * The previous version for computing diff (undefined for oldest version)
   */
  previousVersion?: PromptVersion;

  /**
   * The current prompt state for "Compare to Current" mode
   */
  currentPrompt: Prompt;

  /**
   * Whether to compare against previous version or current prompt state
   */
  comparisonMode: 'previous' | 'current';

  /**
   * Callback when this version is selected for detailed view
   */
  onSelect: (version: PromptVersion) => void;
}

/**
 * Counts words in a string by splitting on whitespace.
 * Filters out empty strings from the split result.
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(s => s.length > 0).length;
}

/**
 * Computes word count changes between two texts.
 * Returns counts of added and removed words.
 */
function computeWordChangeCounts(oldText: string, newText: string): { added: number; removed: number } {
  const changes = computeDiff(oldText, newText);

  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const wordCount = countWords(change.value);
    if (change.added) {
      added += wordCount;
    } else if (change.removed) {
      removed += wordCount;
    }
  }

  return { added, removed };
}

/**
 * Renders a summary line showing word additions and removals.
 * Returns null if no changes.
 */
function BodyChangeSummary({ added, removed }: { added: number; removed: number }) {
  if (added === 0 && removed === 0) {
    return null;
  }

  const parts: string[] = [];
  if (added > 0) {
    parts.push(`+${added} word${added === 1 ? '' : 's'}`);
  }
  if (removed > 0) {
    parts.push(`-${removed} word${removed === 1 ? '' : 's'}`);
  }

  return (
    <span className="text-sm text-muted-foreground">
      Body: {parts.join(', ')}
    </span>
  );
}

/**
 * Displays a single version item in the version history list.
 *
 * Shows version number, relative timestamp, and a summary of changes
 * (title indicator, word count changes, variable changes).
 *
 * The entire item is clickable to trigger onSelect for detailed view.
 */
export const VersionListItem = memo(function VersionListItem({
  version,
  previousVersion,
  currentPrompt,
  comparisonMode,
  onSelect,
}: VersionListItemProps) {
  // Determine comparison target based on mode
  const comparisonTarget = comparisonMode === 'current'
    ? { title: currentPrompt.title, body: currentPrompt.body, variables: currentPrompt.variables }
    : previousVersion
      ? { title: previousVersion.title, body: previousVersion.body, variables: previousVersion.variables }
      : null;

  // Compute changes if we have a comparison target
  const titleChanged = comparisonTarget ? version.title !== comparisonTarget.title : false;
  const bodyChanges = comparisonTarget
    ? computeWordChangeCounts(comparisonTarget.body, version.body)
    : { added: 0, removed: 0 };

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(version.createdAt), { addSuffix: true });

  return (
    <button
      type="button"
      className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={() => onSelect(version)}
    >
      {/* Header: Version number and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Version {version.versionNumber}</span>
        <span className="text-sm text-muted-foreground">{relativeTime}</span>
      </div>

      {/* Summary section */}
      <div className="space-y-1">
        {/* Title change indicator */}
        {titleChanged && (
          <span className="text-sm text-muted-foreground">
            Title changed
          </span>
        )}

        {/* Body word changes */}
        <div>
          <BodyChangeSummary added={bodyChanges.added} removed={bodyChanges.removed} />
        </div>

        {/* Variable changes */}
        {comparisonTarget && (
          <VariableChanges
            oldVariables={comparisonTarget.variables}
            newVariables={version.variables}
          />
        )}

        {/* No comparison target message for oldest version in 'previous' mode */}
        {!comparisonTarget && comparisonMode === 'previous' && (
          <span className="text-sm text-muted-foreground italic">
            Initial version
          </span>
        )}
      </div>
    </button>
  );
});
