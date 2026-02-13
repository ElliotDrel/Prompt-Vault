import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import type { PublicPrompt } from '@/types/prompt';
import { useEffect } from 'react';

interface UsePublicPromptReturn {
  prompt: PublicPrompt | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single public prompt by ID.
 *
 * Uses TanStack Query for caching with 30 second stale time.
 * Requires authentication to use (RLS policy enforces this).
 * Subscribes to realtime updates for public prompts.
 *
 * Returns null for prompts that don't exist OR aren't public (same behavior for security).
 *
 * @param promptId - The UUID of the prompt to fetch
 * @example
 * const { prompt, loading, error, refetch } = usePublicPrompt('abc-123');
 */
export function usePublicPrompt(promptId: string | undefined): UsePublicPromptReturn {
  const { adapter } = useStorageAdapterContext();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['publicPrompt', promptId],
    queryFn: async () => {
      if (!adapter) throw new Error('Storage adapter not available');
      if (!promptId) throw new Error('Prompt ID is required');
      return adapter.prompts.getPublicPromptById(promptId);
    },
    enabled: !!adapter && !!promptId,
    staleTime: 30000, // 30 seconds cache
  });

  // Subscribe to realtime updates for public prompts
  useEffect(() => {
    if (!adapter?.subscribe || !promptId) return;

    const unsubscribe = adapter.subscribe((type) => {
      if (type === 'publicPrompts') {
        // Invalidate this specific prompt query to trigger a refetch
        void queryClient.invalidateQueries({ queryKey: ['publicPrompt', promptId] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [adapter, promptId, queryClient]);

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    prompt: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
