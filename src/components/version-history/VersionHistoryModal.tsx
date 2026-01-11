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

type ComparisonMode = 'previous' | 'current';

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
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('previous');
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);

  // Reset selected version when modal opens
  useEffect(() => {
    if (open) {
      setSelectedVersion(null);
    }
  }, [open]);

  const handleVersionSelect = (version: PromptVersion) => {
    setSelectedVersion(version);
  };

  const handleRevert = () => {
    if (selectedVersion && onRevert) {
      onRevert(selectedVersion);
    }
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
    // For 'previous' mode, the diff is computed in VersionListItem
    // Here we just show the version itself without diff
    return null;
  };

  const comparisonTarget = getComparisonTarget();

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
              variant="outline"
              size="sm"
              aria-pressed={comparisonMode === 'previous'}
              aria-label="Compare to previous version"
              className={comparisonMode === 'previous' ? 'bg-muted' : ''}
              onClick={() => setComparisonMode('previous')}
            >
              Compare to Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={comparisonMode === 'current'}
              aria-label="Compare to current version"
              className={comparisonMode === 'current' ? 'bg-muted' : ''}
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
            />
          </div>

          {/* Right column: Detail view */}
          <div className="overflow-y-auto max-h-[40vh] md:max-h-[60vh] pl-0 md:pl-4 md:border-l">
            {!selectedVersion ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a version to see details
              </div>
            ) : (
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

                {/* Title diff (only if comparing to current and differs) */}
                {comparisonTarget && selectedVersion.title !== comparisonTarget.title && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Title Changes</h4>
                    <div className="border rounded p-3 bg-muted/30">
                      <VersionDiff
                        oldText={selectedVersion.title}
                        newText={comparisonTarget.title}
                      />
                    </div>
                  </div>
                )}

                {/* Body diff */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    {comparisonTarget ? 'Body Changes' : 'Body Content'}
                  </h4>
                  <div className="border rounded p-3 bg-muted/30">
                    {comparisonTarget ? (
                      <VersionDiff
                        oldText={selectedVersion.body}
                        newText={comparisonTarget.body}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedVersion.body}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variable changes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    {comparisonTarget ? 'Variable Changes' : 'Variables'}
                  </h4>
                  {comparisonTarget ? (
                    <VariableChangesOrEmpty
                      oldVariables={selectedVersion.variables}
                      newVariables={comparisonTarget.variables}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.variables.length > 0 ? (
                        selectedVersion.variables.map((variable) => (
                          <span
                            key={variable}
                            className="px-2 py-1 rounded bg-muted text-sm"
                          >
                            {variable}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No variables</p>
                      )}
                    </div>
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
