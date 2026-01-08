import React, { useEffect, useRef, ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InfiniteScrollContainerProps<T> {
  /** Array of items to display */
  items: T[];

  /** Total count of items in database */
  totalCount: number;

  /** Whether initial data is loading */
  loading: boolean;

  /** Whether more pages exist */
  hasNextPage: boolean;

  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;

  /** Error from pagination (if any) */
  error?: string | null;

  /** Function to fetch next page */
  fetchNextPage: () => void;

  /** Function to retry after error */
  onRetry?: () => void;

  /** Function to render each item */
  renderItem: (item: T) => ReactNode;

  /** Function to get unique key for each item */
  getItemKey: (item: T) => string;

  /** Message to show when no items exist */
  emptyMessage: string;

  /** Whether infinite scroll is active (e.g., not during search) */
  enableInfiniteScroll?: boolean;

  /** Optional class name for the items container */
  className?: string;
}

/**
 * Reusable infinite scroll container with automatic loading.
 * Handles intersection observer, loading states, error states, and empty states.
 *
 * @example
 * <InfiniteScrollContainer
 *   items={copyHistory}
 *   totalCount={totalCount}
 *   loading={loading}
 *   hasNextPage={hasNextPage}
 *   isFetchingNextPage={isFetchingNextPage}
 *   error={error}
 *   fetchNextPage={fetchNextPage}
 *   onRetry={refetch}
 *   renderItem={(event) => <CopyEventCard event={event} />}
 *   getItemKey={(event) => event.id}
 *   emptyMessage="No copy history yet."
 *   enableInfiniteScroll={!isSearching}
 * />
 */
export function InfiniteScrollContainer<T>({
  items,
  totalCount,
  loading,
  hasNextPage,
  isFetchingNextPage,
  error,
  fetchNextPage,
  onRetry,
  renderItem,
  getItemKey,
  emptyMessage,
  enableInfiniteScroll = true,
  className = 'space-y-4',
}: InfiniteScrollContainerProps<T>) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll: Auto-load more when scrolling near bottom
  useEffect(() => {
    if (!enableInfiniteScroll || error) return;

    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more pages (and no error)
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !error) {
          fetchNextPage();
        }
      },
      {
        // Trigger when sentinel is 100px from entering viewport (smoother UX)
        rootMargin: '100px',
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, enableInfiniteScroll, error]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state (initial load failed)
  if (error && items.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load items</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {error}
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Items list with infinite scroll
  return (
    <>
      <div className={className}>
        {items.map((item) => (
          <React.Fragment key={getItemKey(item)}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>

      {/* Error state - shows when pagination fails */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Failed to load more items</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {error}
              </p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Infinite scroll sentinel - triggers auto-load when visible */}
      {hasNextPage && enableInfiniteScroll && !error && (
        <div
          ref={observerTarget}
          className="flex justify-center py-8"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Item count display */}
      {enableInfiniteScroll && !error && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {totalCount} events
          </p>
        </div>
      )}
    </>
  );
}
