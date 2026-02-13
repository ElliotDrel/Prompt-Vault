import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import type { PublicPrompt } from '@/types/prompt';

interface UsePublicPromptsReturn {
  prompts: PublicPrompt[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching public prompts from the library.
 *
 * Uses TanStack Query for caching with 30 second stale time.
 * Requires authentication to use (RLS policy enforces this).
 * Subscribes to realtime updates for public prompts.
 *
 * @example
 * const { prompts, loading, error, refetch } = usePublicPrompts();
 */
export function usePublicPrompts(): UsePublicPromptsReturn {
  const { adapter } = useStorageAdapterContext();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['publicPrompts'],
    queryFn: async () => {
      if (!adapter) throw new Error('Storage adapter not available');
      return adapter.prompts.getPublicPrompts();
    },
    enabled: !!adapter,
    staleTime: 30000, // 30 seconds cache
  });

  // Subscribe to realtime updates for public prompts
  useEffect(() => {
    if (!adapter?.subscribe) return;

    const unsubscribe = adapter.subscribe((type) => {
      if (type === 'publicPrompts') {
        // Invalidate the query to trigger a refetch
        void queryClient.invalidateQueries({ queryKey: ['publicPrompts'] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [adapter, queryClient]);

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    prompts: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
