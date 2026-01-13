import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { PromptVersion, Prompt } from '@/types/prompt';
import { computeDiff, getComparisonPair, type ComparisonMode } from '@/utils/diffUtils';
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
  comparisonMode: ComparisonMode;

  /**
   * Map from version ID to version number for revert tracking display
   */
  versionNumberMap: Map<string, number>;

  /**
   * Whether this is the latest (current) version
   */
  isLatest?: boolean;

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
 * Returns counts of added and removed words, plus whether texts differ.
 */
function computeWordChangeCounts(oldText: string, newText: string): { added: number; removed: number; textsDiffer: boolean } {
  // Check if texts are different at all
  const textsDiffer = oldText !== newText;

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

  return { added, removed, textsDiffer };
}

/**
 * Renders a summary line showing word additions and removals.
 * Shows "Formatting changed" for whitespace-only changes.
 * Returns null if no changes at all.
 */
function BodyChangeSummary({ added, removed, textsDiffer }: { added: number; removed: number; textsDiffer: boolean }) {
  // No word changes but text differs = whitespace/formatting only
  if (added === 0 && removed === 0) {
    if (textsDiffer) {
      return (
        <span className="text-sm text-muted-foreground italic">
          Formatting changed
        </span>
      );
    }
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground flex items-center gap-2">
      {added > 0 && (
        <span className="text-green-600 dark:text-green-400">
          +{added} word{added === 1 ? '' : 's'}
        </span>
      )}
      {removed > 0 && (
        <span className="text-red-600 dark:text-red-400">
          -{removed} word{removed === 1 ? '' : 's'}
        </span>
      )}
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
  versionNumberMap,
  isLatest,
  onSelect,
}: VersionListItemProps) {
  // Determine comparison target based on mode
  const comparisonTarget = comparisonMode === 'current'
    ? { title: currentPrompt.title, body: currentPrompt.body, variables: currentPrompt.variables }
    : previousVersion
      ? { title: previousVersion.title, body: previousVersion.body, variables: previousVersion.variables }
      : null;

  // Lookup reverted-from version number if this version was created by a revert
  const revertedToVersionNumber = version.revertedFromVersionId
    ? versionNumberMap.get(version.revertedFromVersionId)
    : undefined;

  // Compute changes if we have a comparison target
  const titleChanged = comparisonTarget ? version.title !== comparisonTarget.title : false;
  const bodyChanges = comparisonTarget
    ? (() => {
        const { old: oldBody, new: newBody } = getComparisonPair(version.body, comparisonTarget.body, comparisonMode);
        return computeWordChangeCounts(oldBody, newBody);
      })()
    : { added: 0, removed: 0, textsDiffer: false };

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(version.createdAt), { addSuffix: true });

  return (
    <button
      type="button"
      className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={() => onSelect(version)}
    >
      {/* Header: Version number, current badge, revert indicator, and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Version {version.versionNumber}</span>
          {isLatest && (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded">
              Current
            </span>
          )}
          {revertedToVersionNumber !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              <RotateCcw className="h-3 w-3" />
              Reverted to V{revertedToVersionNumber}
            </span>
          )}
        </div>
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
          <BodyChangeSummary added={bodyChanges.added} removed={bodyChanges.removed} textsDiffer={bodyChanges.textsDiffer} />
        </div>

        {/* Variable changes */}
        {comparisonTarget && (() => {
          const { old: oldVars, new: newVars } = getComparisonPair(version.variables, comparisonTarget.variables, comparisonMode);
          return <VariableChanges oldVariables={oldVars} newVariables={newVars} />;
        })()}

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
