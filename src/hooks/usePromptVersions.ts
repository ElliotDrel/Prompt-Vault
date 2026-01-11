import { useInfiniteQuery } from '@tanstack/react-query';
import { PromptVersion } from '@/types/prompt';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import { useAuth } from '@/contexts/AuthContext';
import { PaginatedVersions } from '@/types/prompt';

interface UsePromptVersionsOptions {
  /**
   * The prompt ID to fetch versions for
   */
  promptId: string;

  /**
   * Number of versions per page
   */
  limit?: number;

  /**
   * Whether the query should be enabled
   */
  enabled?: boolean;
}

/**
 * Hook for fetching paginated prompt versions using TanStack Query.
 *
 * Versions are immutable and do not change, so no mutations or realtime
 * subscriptions are needed. Manual refetch is available for user-initiated
 * refresh actions.
 *
 * @example
 * const { versions, loading, fetchNextPage, hasNextPage } = usePromptVersions({
 *   promptId: '123',
 *   limit: 20
 * });
 */
export function usePromptVersions({
  promptId,
  limit = 20,
  enabled = true,
}: UsePromptVersionsOptions) {
  const { user } = useAuth();
  const { adapter: storageAdapter } = useStorageAdapterContext();
  const userId = user?.id;

  // Build query key with userId and promptId for proper cache isolation
  const queryKey = ['promptVersions', userId, promptId];

  // Infinite query for paginated versions
  const {
    data,
    error: queryError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }): Promise<PaginatedVersions> => {
      if (!storageAdapter) {
        throw new Error('Storage adapter not initialized');
      }
      return storageAdapter.versions.getVersions(promptId, pageParam, limit);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length * limit;
    },
    enabled: enabled && !!storageAdapter && !!userId && !!promptId,
    initialPageParam: 0,
  });

  // Flatten pages into single array
  const versions: PromptVersion[] = data?.pages.flatMap(page => page.versions) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const error = queryError ? String(queryError) : null;

  return {
    versions,
    totalCount,
    loading: isLoading,
    error,
    fetchNextPage: () => fetchNextPage(),
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    refetch: () => refetch(),
  };
}
