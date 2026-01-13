import { memo, useMemo } from 'react';
import { Prompt, PromptVersion } from '@/types/prompt';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { groupVersionsByPeriod } from '@/utils/versionUtils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VersionListItem } from './VersionListItem';

interface VersionListProps {
  /**
   * The prompt ID to fetch versions for
   */
  promptId: string;

  /**
   * The current prompt state for "Compare to Current" mode
   */
  currentPrompt: Prompt;

  /**
   * Whether to compare against previous version or current prompt state
   */
  comparisonMode: 'previous' | 'current';

  /**
   * The currently selected version ID (for visual indication)
   */
  selectedVersionId?: string;

  /**
   * Callback when a version is selected for detailed view
   */
  onVersionSelect: (version: PromptVersion) => void;
}

/**
 * Loading skeleton for version list
 */
function VersionListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no versions exist
 */
function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No version history yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        Version history will appear after your first edit
      </p>
    </div>
  );
}

/**
 * Error state with retry button
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-destructive mb-2">Failed to load version history</p>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/**
 * Displays a list of prompt versions grouped by time period using an accordion.
 *
 * Features:
 * - Time-based grouping (Today, Yesterday, Last 7 Days, monthly)
 * - Auto-expanded recent sections (Today, Yesterday)
 * - Loading, empty, and error states
 * - Load More pagination
 * - Version count display
 */
export const VersionList = memo(function VersionList({
  promptId,
  currentPrompt,
  comparisonMode,
  selectedVersionId,
  onVersionSelect,
}: VersionListProps) {
  const {
    versions,
    totalCount,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePromptVersions({ promptId });

  // Group versions by time period
  const groupedVersions = useMemo(
    () => groupVersionsByPeriod(versions),
    [versions]
  );

  // Get ordered period keys (preserves insertion order from groupVersionsByPeriod)
  const periods = useMemo(() => Object.keys(groupedVersions), [groupedVersions]);

  // Create a map from version ID to its previous version for efficient lookup
  // Versions are sorted newest first, so previous version is at index + 1
  const previousVersionMap = useMemo(() => {
    const map = new Map<string, PromptVersion | undefined>();
    for (let i = 0; i < versions.length; i++) {
      map.set(versions[i].id, versions[i + 1]);
    }
    return map;
  }, [versions]);

  // Create a map from version ID to version number for revert tracking display
  const versionNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const version of versions) {
      map.set(version.id, version.versionNumber);
    }
    return map;
  }, [versions]);

  // Get the latest version ID for marking it as "Current"
  const latestVersionId = versions.length > 0 ? versions[0].id : null;

  // Handle loading state
  if (loading) {
    return <VersionListSkeleton />;
  }

  // Handle error state
  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  // Handle empty state
  if (versions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Version count */}
      <div className="text-sm text-muted-foreground mb-3">
        {totalCount} version{totalCount !== 1 ? 's' : ''} total
      </div>

      {/* Accordion with time-grouped versions - all periods expanded by default */}
      <Accordion
        type="multiple"
        defaultValue={periods}
        className="space-y-2"
      >
        {periods.map((period) => {
          const periodVersions = groupedVersions[period];
          const count = periodVersions.length;

          return (
            <AccordionItem key={period} value={period} className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  {period}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
                    {count}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {periodVersions.map((version) => (
                    <VersionListItem
                      key={version.id}
                      version={version}
                      previousVersion={previousVersionMap.get(version.id)}
                      currentPrompt={currentPrompt}
                      comparisonMode={comparisonMode}
                      versionNumberMap={versionNumberMap}
                      isLatest={version.id === latestVersionId}
                      isSelected={version.id === selectedVersionId}
                      onSelect={onVersionSelect}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Load More button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more versions'}
          </Button>
        </div>
      )}
    </div>
  );
});
