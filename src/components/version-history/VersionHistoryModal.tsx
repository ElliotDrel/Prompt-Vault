import { memo, useState, useEffect } from 'react';
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
import { RotateCcw } from 'lucide-react';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { getComparisonPair, type ComparisonMode } from '@/utils/diffUtils';

/**
 * Wrapper for VariableChanges that shows "No variable changes" when no changes exist.
 * VariableChanges returns null when oldVariables equals newVariables.
 */
function VariableChangesOrEmpty({
  oldVariables,
  newVariables,
}: {
  oldVariables: string[];
  newVariables: string[];
}) {
  // Compute if there are any changes
  const hasAdditions = newVariables.some((v) => !oldVariables.includes(v));
  const hasRemovals = oldVariables.some((v) => !newVariables.includes(v));

  if (!hasAdditions && !hasRemovals) {
    return <p className="text-sm text-muted-foreground">No variable changes</p>;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {prompt.title}
          </DialogDescription>

          {/* Comparison mode toggle */}
          <div className="flex gap-2 pt-2">
            <Button
              variant={comparisonMode === 'previous' ? 'default' : 'outline'}
              size="sm"
              aria-pressed={comparisonMode === 'previous'}
              aria-label="Compare to previous version"
              onClick={() => setComparisonMode('previous')}
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
          </div>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Left column: Version list */}
          <div className="overflow-y-auto max-h-[40vh] md:max-h-[60vh] pr-2">
            <VersionList
              promptId={prompt.id}
              currentPrompt={prompt}
              comparisonMode={comparisonMode}
              onVersionSelect={handleVersionSelect}
              onCurrentSelect={handleCurrentSelect}
              isCurrentSelected={isCurrentSelected}
            />
          </div>

          {/* Right column: Detail view */}
          <div className="overflow-y-auto max-h-[40vh] md:max-h-[60vh] pl-0 md:pl-4 md:border-l">
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
                  </div>
                  <div className="inline-flex items-center justify-center h-10 rounded-md px-4 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 -mr-1">
                    Live
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  This is the current state of your prompt
                </p>

                {/* Title */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Title</h4>
                  <div className="border rounded p-3 bg-muted/30 text-sm">
                    {prompt.title}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Body</h4>
                  <div className="border rounded p-3 bg-muted/30 whitespace-pre-wrap text-sm">
                    {prompt.body}
                  </div>
                </div>

                {/* Variables */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Variables</h4>
                  {prompt.variables.length > 0 ? (
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
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={!onRevert}
                    onClick={handleRevert}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Revert
                  </Button>
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
                      return <VersionDiff oldText={oldTitle} newText={newTitle} />;
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
                      return <VersionDiff oldText={oldBody} newText={newBody} />;
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
                    return <VariableChangesOrEmpty oldVariables={oldVars} newVariables={newVars} />;
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
        </div>
      </DialogContent>
    </Dialog>
  );
});
