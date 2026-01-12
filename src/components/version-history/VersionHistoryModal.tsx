import { memo, useState, useEffect, useMemo } from 'react';
import { Prompt, PromptVersion } from '@/types/prompt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VersionList } from './VersionList';
import { VersionDiff } from './VersionDiff';
import { VariableChanges } from './VariableChanges';
import { format } from 'date-fns';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { getComparisonPair, arePromptsIdentical, type ComparisonMode } from '@/utils/diffUtils';

/**
 * Wrapper for VariableChanges that shows "No variable changes" when no changes exist.
 * VariableChanges returns null when oldVariables equals newVariables.
 *
 * When showHighlighting is false, shows variables as plain text without diff styling (UAT-009).
 */
function VariableChangesOrEmpty({
  oldVariables,
  newVariables,
  showHighlighting = true,
}: {
  oldVariables: string[];
  newVariables: string[];
  showHighlighting?: boolean;
}) {
  // Compute if there are any changes
  const added = newVariables.filter((v) => !oldVariables.includes(v));
  const removed = oldVariables.filter((v) => !newVariables.includes(v));
  const hasChanges = added.length > 0 || removed.length > 0;

  if (!hasChanges) {
    return <p className="text-sm text-muted-foreground">No variable changes</p>;
  }

  // When highlighting is hidden, show plain text summary (UAT-009)
  if (!showHighlighting) {
    const allVariables = [...new Set([...oldVariables, ...newVariables])].sort();
    return (
      <div className="flex flex-wrap gap-2">
        {allVariables.map((variable) => (
          <span
            key={variable}
            className="px-2 py-1 rounded bg-muted text-sm"
          >
            {variable}
          </span>
        ))}
      </div>
    );
  }

  return <VariableChanges oldVariables={oldVariables} newVariables={newVariables} />;
}

interface VersionHistoryModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** The current prompt for comparison and context */
  prompt: Prompt;
  /** Optional callback when revert is requested (Phase 7 will implement) */
  onRevert?: (version: PromptVersion) => void;
}

// ComparisonMode imported from diffUtils

/**
 * Modal dialog displaying version history with two-column layout.
 *
 * Features:
 * - Left column: Version list with time-based grouping
 * - Right column: Selected version detail with diff visualization
 * - Comparison mode toggle: Compare to Previous vs Compare to Current
 * - Revert button for restoring previous versions (callback-based)
 */
export const VersionHistoryModal = memo(function VersionHistoryModal({
  open,
  onOpenChange,
  prompt,
  onRevert,
}: VersionHistoryModalProps) {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('current');
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [isCurrentSelected, setIsCurrentSelected] = useState(false);
  const [showDiffHighlighting, setShowDiffHighlighting] = useState(true);

  // Fetch versions to find previous version for comparison
  const { versions } = usePromptVersions({ promptId: prompt.id, enabled: open });

  // Select first version by default when modal opens (only if nothing is selected)
  useEffect(() => {
    if (open && versions.length > 0 && !selectedVersion && !isCurrentSelected) {
      setSelectedVersion(versions[0]);
    }
  }, [open, versions, selectedVersion, isCurrentSelected]);

  const handleVersionSelect = (version: PromptVersion) => {
    setSelectedVersion(version);
    setIsCurrentSelected(false);
  };

  const handleCurrentSelect = () => {
    setSelectedVersion(null);
    setIsCurrentSelected(true);
  };

  const handleRevert = () => {
    if (selectedVersion && onRevert) {
      onRevert(selectedVersion);
    }
  };

  // Find the previous version for the selected version
  const getPreviousVersion = (): PromptVersion | null => {
    if (!selectedVersion || versions.length === 0) return null;
    const idx = versions.findIndex(v => v.id === selectedVersion.id);
    if (idx === -1 || idx >= versions.length - 1) return null;
    return versions[idx + 1]; // Versions are sorted newest first
  };

  // Get comparison target based on mode
  const getComparisonTarget = () => {
    if (comparisonMode === 'current') {
      return {
        title: prompt.title,
        body: prompt.body,
        variables: prompt.variables,
      };
    }
    // For 'previous' mode, compare to the previous version
    const prevVersion = getPreviousVersion();
    if (prevVersion) {
      return {
        title: prevVersion.title,
        body: prevVersion.body,
        variables: prevVersion.variables,
      };
    }
    return null;
  };

  const comparisonTarget = getComparisonTarget();
  const previousVersion = getPreviousVersion();

  // Create a map from version ID to version number for revert tracking display
  const versionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const version of versions) {
      map.set(version.id, version.versionNumber);
    }
    return map;
  }, [versions]);

  // Lookup reverted-from version number for the selected version
  const revertedToVersionNumber = selectedVersion?.revertedFromVersionId
    ? versionNumberMap.get(selectedVersion.revertedFromVersionId)
    : undefined;

  // Check if selected version is Version 1 (first version) - disable "Compare to Previous" (UAT-002)
  const isFirstVersion = selectedVersion?.versionNumber === 1;

  // Check if selected version content matches current prompt - hide revert button (UAT-003)
  const selectedVersionMatchesCurrent = selectedVersion
    ? arePromptsIdentical(selectedVersion, prompt)
    : false;

  // Get revert info for Current tab (UAT-007)
  // Show if latest version has revertedFromVersionId and Current matches latest version
  const latestVersion = versions.length > 0 ? versions[0] : null;
  const currentMatchesLatest = latestVersion
    ? arePromptsIdentical(prompt, latestVersion)
    : false;
  const currentRevertedFromVersionNumber =
    currentMatchesLatest && latestVersion?.revertedFromVersionId
      ? versionNumberMap.get(latestVersion.revertedFromVersionId)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {prompt.title}
          </DialogDescription>

          {/* Comparison mode toggle and diff highlighting toggle - right-aligned (UAT-008) */}
          <div className="flex gap-2 pt-2 flex-wrap justify-end">
            <Button
              variant={comparisonMode === 'previous' ? 'default' : 'outline'}
              size="sm"
              aria-pressed={comparisonMode === 'previous'}
              aria-label="Compare to previous version"
              onClick={() => setComparisonMode('previous')}
              disabled={isFirstVersion && !isCurrentSelected}
              title={isFirstVersion && !isCurrentSelected ? 'No previous version to compare' : undefined}
            >
              Compare to Previous
            </Button>
            <Button
              variant={comparisonMode === 'current' ? 'default' : 'outline'}
              size="sm"
              aria-pressed={comparisonMode === 'current'}
              aria-label="Compare to current version"
              onClick={() => setComparisonMode('current')}
            >
              Compare to Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={showDiffHighlighting}
              aria-label={showDiffHighlighting ? 'Hide diff highlighting' : 'Show diff highlighting'}
              onClick={() => setShowDiffHighlighting(!showDiffHighlighting)}
            >
              {showDiffHighlighting ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Diff
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Diff
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Two-column layout: Detail (2/3) | History List (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Left column: Detail view (2/3 width) */}
          <div className="order-1 md:order-1 overflow-y-auto max-h-[40vh] md:max-h-[60vh] pr-0 md:pr-4 md:col-span-2">
            {/* Nothing selected state */}
            {!selectedVersion && !isCurrentSelected && (
              <div className="text-center py-8 text-muted-foreground">
                Select a version to see details
              </div>
            )}

            {/* Current prompt selected */}
            {isCurrentSelected && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Current Version
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(prompt.updatedAt), 'PPpp')}
                    </p>
                    {/* Revert tracking info for Current tab (UAT-007) */}
                    {currentRevertedFromVersionNumber !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Current state was restored from Version {currentRevertedFromVersionNumber}
                      </p>
                    )}
                  </div>
                  <div className="inline-flex items-center justify-center h-10 rounded-md px-4 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 -mr-1">
                    Live
                  </div>
                </div>

                {/* Comparison context label for Current version */}
                {comparisonMode === 'previous' && versions.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Showing differences from Version {versions[0].versionNumber} to current
                  </p>
                ) : comparisonMode === 'previous' && versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No previous versions to compare
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This is the current state of your prompt
                  </p>
                )}

                {/* Title */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Title</h4>
                  <div className="border rounded p-3 bg-muted/30">
                    {comparisonMode === 'previous' && versions.length > 0 ? (
                      <VersionDiff
                        oldText={versions[0].title}
                        newText={prompt.title}
                        showHighlighting={showDiffHighlighting}
                      />
                    ) : (
                      <div className="text-sm">{prompt.title}</div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Body</h4>
                  <div className="border rounded p-3 bg-muted/30">
                    {comparisonMode === 'previous' && versions.length > 0 ? (
                      <VersionDiff
                        oldText={versions[0].body}
                        newText={prompt.body}
                        showHighlighting={showDiffHighlighting}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">{prompt.body}</div>
                    )}
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Variables</h4>
                  {comparisonMode === 'previous' && versions.length > 0 ? (
                    <VariableChangesOrEmpty
                      oldVariables={versions[0].variables}
                      newVariables={prompt.variables}
                      showHighlighting={showDiffHighlighting}
                    />
                  ) : prompt.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {prompt.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 rounded bg-muted text-sm"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No variables</p>
                  )}
                </div>
              </div>
            )}

            {/* Historical version selected */}
            {selectedVersion && (
              <div className="space-y-4">
                {/* Version header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Version {selectedVersion.versionNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedVersion.createdAt), 'PPpp')}
                    </p>
                    {/* Revert tracking info */}
                    {revertedToVersionNumber !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        This version was created by reverting to Version {revertedToVersionNumber}
                      </p>
                    )}
                  </div>
                  {/* Revert button - hidden when version matches current (UAT-003) */}
                  {!selectedVersionMatchesCurrent && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={!onRevert}
                      onClick={handleRevert}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revert
                    </Button>
                  )}
                </div>

                {/* Comparison context label */}
                {comparisonTarget && (
                  <p className="text-sm text-muted-foreground">
                    {comparisonMode === 'current'
                      ? 'Showing differences from this version to current prompt'
                      : `Showing differences from Version ${previousVersion?.versionNumber} to this version`}
                  </p>
                )}
                {!comparisonTarget && comparisonMode === 'previous' && (
                  <p className="text-sm text-muted-foreground italic">
                    This is the initial version - no previous version to compare
                  </p>
                )}

                {/* Title */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Title</h4>
                  <div className="border rounded p-3 bg-muted/30">
                    {comparisonTarget ? (() => {
                      const { old: oldTitle, new: newTitle } = getComparisonPair(selectedVersion.title, comparisonTarget.title, comparisonMode);
                      return <VersionDiff oldText={oldTitle} newText={newTitle} showHighlighting={showDiffHighlighting} />;
                    })() : (
                      <div className="text-sm">
                        {selectedVersion.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Body</h4>
                  <div className="border rounded p-3 bg-muted/30">
                    {comparisonTarget ? (() => {
                      const { old: oldBody, new: newBody } = getComparisonPair(selectedVersion.body, comparisonTarget.body, comparisonMode);
                      return <VersionDiff oldText={oldBody} newText={newBody} showHighlighting={showDiffHighlighting} />;
                    })() : (
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedVersion.body}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Variables</h4>
                  {comparisonTarget ? (() => {
                    const { old: oldVars, new: newVars } = getComparisonPair(selectedVersion.variables, comparisonTarget.variables, comparisonMode);
                    return <VariableChangesOrEmpty oldVariables={oldVars} newVariables={newVars} showHighlighting={showDiffHighlighting} />;
                  })() : selectedVersion.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 rounded bg-muted text-sm"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No variables</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Version list (1/3 width) */}
          <div className="order-2 md:order-2 overflow-y-auto max-h-[40vh] md:max-h-[60vh] pl-0 md:pl-4 md:border-l md:col-span-1">
            <VersionList
              promptId={prompt.id}
              currentPrompt={prompt}
              comparisonMode={comparisonMode}
              onVersionSelect={handleVersionSelect}
              onCurrentSelect={handleCurrentSelect}
              isCurrentSelected={isCurrentSelected}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
