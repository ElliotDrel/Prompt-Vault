import { useQuery } from '@tanstack/react-query';
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
 *
 * @example
 * const { prompts, loading, error, refetch } = usePublicPrompts();
 */
export function usePublicPrompts(): UsePublicPromptsReturn {
  const { adapter } = useStorageAdapterContext();

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
