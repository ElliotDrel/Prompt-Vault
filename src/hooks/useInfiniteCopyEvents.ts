import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { CopyEvent } from '@/types/prompt';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import { useAuth } from '@/contexts/AuthContext';
import { PaginatedCopyEvents } from '@/lib/storage/types';
import { useEffect } from 'react';

interface UseInfiniteCopyEventsOptions {
  /**
   * Query key suffix to make queries unique
   * e.g., 'all', ['prompt', promptId], ['search', query]
   */
  queryKey: (string | number)[];

  /**
   * Function to fetch paginated copy events
   */
  queryFn: (offset: number, limit: number) => Promise<PaginatedCopyEvents>;

  /**
   * Number of events per page
   */
  limit?: number;

  /**
   * Whether the query should be enabled
   */
  enabled?: boolean;
}

/**
 * Generic hook for infinite scroll pagination of copy events.
 * Handles fetching, mutations, optimistic updates, and realtime sync.
 *
 * @example
 * // All events
 * useInfiniteCopyEvents({
 *   queryKey: ['copyHistory', userId],
 *   queryFn: (offset, limit) => adapter.copyEvents.getCopyEvents(offset, limit),
 *   limit: 25
 * })
 *
 * @example
 * // Per-prompt events
 * useInfiniteCopyEvents({
 *   queryKey: ['promptCopyHistory', userId, promptId],
 *   queryFn: (offset, limit) => adapter.copyEvents.getCopyEventsByPromptId(promptId, offset, limit),
 *   limit: 10
 * })
 */
export function useInfiniteCopyEvents({
  queryKey,
  queryFn,
  limit = 25,
  enabled = true,
}: UseInfiniteCopyEventsOptions) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { adapter: storageAdapter } = useStorageAdapterContext();
  const userId = user?.id;

  // Build full query key
  const fullQueryKey = ['copyEvents', ...queryKey];

  // Infinite query for paginated copy events
  const {
    data,
    error: queryError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: fullQueryKey,
    queryFn: async ({ pageParam = 0 }) => {
      if (!storageAdapter) {
        throw new Error('Storage adapter not initialized');
      }
      return queryFn(pageParam, limit);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length * limit;
    },
    enabled: enabled && !!storageAdapter && !!userId,
    initialPageParam: 0,
  });

  // Flatten pages into single array
  const events = data?.pages.flatMap(page => page.events) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const error = queryError ? String(queryError) : null;

  // Mutation for adding copy event
  const addMutation = useMutation({
    mutationFn: async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      return storageAdapter.copyEvents.addCopyEvent(event);
    },
    onSuccess: (newEvent) => {
      // Optimistically prepend to first page
      queryClient.setQueryData<InfiniteData<PaginatedCopyEvents>>(fullQueryKey, (old) => {
        if (!old?.pages) return old;

        const totalCount = Math.max((old.pages[0]?.totalCount ?? 0) + 1, 0);
        const newPages = old.pages.map((page) => ({
          ...page,
          events: [...page.events],
          totalCount,
        }));

        if (newPages.length > 0) {
          newPages[0].events.unshift(newEvent);
        }

        for (let i = 0; i < newPages.length; i += 1) {
          if (newPages[i].events.length <= limit) {
            continue;
          }

          const overflow = newPages[i].events.pop();
          if (!overflow) {
            continue;
          }

          if (newPages[i + 1]) {
            newPages[i + 1].events.unshift(overflow);
          }
        }

        if (newPages.length > 0) {
          const totalLoaded = newPages.reduce((sum, page) => sum + page.events.length, 0);
          newPages[newPages.length - 1] = {
            ...newPages[newPages.length - 1],
            hasMore: totalLoaded < totalCount,
          };
        }

        return { ...old, pages: newPages };
      });
    },
    onError: () => {
      // If addition fails, refetch to ensure UI stays in sync with server
      queryClient.invalidateQueries({ queryKey: fullQueryKey });
    },
  });

  // Mutation for deleting copy event
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      return storageAdapter.copyEvents.deleteCopyEvent(id);
    },
    onSuccess: (_, deletedId) => {
      // Remove from all pages
      queryClient.setQueryData<InfiniteData<PaginatedCopyEvents>>(fullQueryKey, (old) => {
        if (!old?.pages) return old;

        const totalCount = Math.max((old.pages[0]?.totalCount ?? 0) - 1, 0);
        const newPages = old.pages.map((page) => ({
          ...page,
          events: page.events.filter((event) => event.id !== deletedId),
          totalCount,
        }));

        for (let i = 0; i < newPages.length - 1; i += 1) {
          while (newPages[i].events.length < limit && newPages[i + 1].events.length > 0) {
            const shifted = newPages[i + 1].events.shift();
            if (!shifted) {
              break;
            }
            newPages[i].events.push(shifted);
          }
        }

        if (newPages.length > 0) {
          const totalLoaded = newPages.reduce((sum, page) => sum + page.events.length, 0);
          newPages[newPages.length - 1] = {
            ...newPages[newPages.length - 1],
            hasMore: totalLoaded < totalCount,
          };
        }

        return { ...old, pages: newPages };
      });
    },
    onError: () => {
      // If deletion fails, refetch to ensure UI stays in sync with server
      queryClient.invalidateQueries({ queryKey: fullQueryKey });
    },
  });

  // Handle realtime updates
  useEffect(() => {
    if (!storageAdapter?.subscribe || !userId) {
      return;
    }

    let isMounted = true;
    const unsubscribe = storageAdapter.subscribe((type, eventData) => {
      if (!isMounted || type !== 'copyEvents') {
        return;
      }

      // For realtime updates, use silent background refetch
      void refetch().catch((err) => {
        console.error('Failed to refetch copy events via subscription:', err);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [storageAdapter, userId, refetch]);

  return {
    events,
    totalCount,
    loading: isLoading,
    error,
    fetchNextPage: () => fetchNextPage(),
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    refetch: () => refetch(),
    addCopyEvent: async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => addMutation.mutateAsync(event),
    deleteCopyEvent: async (id: string) => deleteMutation.mutateAsync(id),
  };
}
