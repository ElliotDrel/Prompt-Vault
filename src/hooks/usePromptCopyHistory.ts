import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteCopyEvents } from './useInfiniteCopyEvents';

interface UsePromptCopyHistoryOptions {
  promptId: string;
  limit?: number;
}

/**
 * Hook for fetching paginated copy events for a specific prompt.
 * Uses the shared useInfiniteCopyEvents hook with prompt-specific configuration.
 */
export function usePromptCopyHistory({ promptId, limit = 10 }: UsePromptCopyHistoryOptions) {
  const { user } = useAuth();
  const { adapter: storageAdapter } = useStorageAdapterContext();
  const userId = user?.id;

  const {
    events,
    totalCount,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    addCopyEvent,
    deleteCopyEvent,
  } = useInfiniteCopyEvents({
    queryKey: ['promptCopyHistory', userId ?? 'anonymous', promptId],
    queryFn: async (offset, limit) => {
      if (!storageAdapter) {
        throw new Error('Storage adapter not initialized');
      }
      return storageAdapter.copyEvents.getCopyEventsByPromptId(promptId, offset, limit);
    },
    limit,
    enabled: !!storageAdapter && !!userId && !!promptId,
  });

  return {
    promptHistory: events,
    totalCount,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    addCopyEvent,
    deleteCopyEvent,
  };
}
