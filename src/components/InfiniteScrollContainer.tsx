import React, { useEffect, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

  /** Function to fetch next page */
  fetchNextPage: () => void;

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
 * Handles intersection observer, loading states, and empty states.
 *
 * @example
 * <InfiniteScrollContainer
 *   items={copyHistory}
 *   totalCount={totalCount}
 *   loading={loading}
 *   hasNextPage={hasNextPage}
 *   isFetchingNextPage={isFetchingNextPage}
 *   fetchNextPage={fetchNextPage}
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
  fetchNextPage,
  renderItem,
  getItemKey,
  emptyMessage,
  enableInfiniteScroll = true,
  className = 'space-y-4',
}: InfiniteScrollContainerProps<T>) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll: Auto-load more when scrolling near bottom
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more pages
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, enableInfiniteScroll]);

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

      {/* Infinite scroll sentinel - triggers auto-load when visible */}
      {hasNextPage && enableInfiniteScroll && (
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
      {enableInfiniteScroll && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {totalCount} events
          </p>
        </div>
      )}
    </>
  );
}
