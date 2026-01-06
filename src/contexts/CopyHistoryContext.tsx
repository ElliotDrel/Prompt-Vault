import React, { createContext, useContext, useEffect, ReactNode, useCallback, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { CopyEvent } from '../types/prompt';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import { useAuth } from '@/contexts/AuthContext';
import { PaginatedCopyEvents } from '@/lib/storage/types';

interface CopyHistoryContextType {
  copyHistory: CopyEvent[];
  loading: boolean;
  error: string | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  totalCount: number;
  refetch: () => void;
  searchCopyEvents: (query: string) => Promise<void>;
  searchResults: CopyEvent[] | null;
  isSearching: boolean;
  clearSearch: () => void;
  addCopyEvent: (event: Omit<CopyEvent, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteCopyEvent: (id: string) => Promise<void>;
}

const CopyHistoryContext = createContext<CopyHistoryContextType | undefined>(undefined);

export const useCopyHistory = () => {
  const context = useContext(CopyHistoryContext);
  if (context === undefined) {
    throw new Error('useCopyHistory must be used within a CopyHistoryProvider');
  }
  return context;
};

interface CopyHistoryProviderProps {
  children: ReactNode;
}

export const CopyHistoryProvider: React.FC<CopyHistoryProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { adapter: storageAdapter } = useStorageAdapterContext();
  const userId = user?.id;

  // Search state
  const [searchResults, setSearchResults] = useState<CopyEvent[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Infinite query for paginated copy history
  const {
    data,
    error: queryError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['copyHistory', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!storageAdapter) {
        throw new Error('Storage adapter not initialized');
      }
      return storageAdapter.copyEvents.getCopyEvents(pageParam, 25);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      // Calculate next offset as sum of all loaded events
      const loadedCount = allPages.reduce((sum, page) => sum + page.events.length, 0);
      return loadedCount;
    },
    enabled: !!storageAdapter && !!userId,
    initialPageParam: 0,
  });

  // Flatten pages into single array for backward compatibility
  const copyHistory = data?.pages.flatMap(page => page.events) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const error = queryError ? String(queryError) : null;

  // Mutation for adding copy event
  const addMutation = useMutation({
    mutationFn: async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      return storageAdapter.copyEvents.addCopyEvent(event);
    },
    onSuccess: (newEvent) => {
      // Optimistically prepend to first page
      queryClient.setQueryData<InfiniteData<PaginatedCopyEvents>>(['copyHistory', userId], (old) => {
        if (!old?.pages) return old;

        const newPages = [...old.pages];
        if (newPages[0]) {
          newPages[0] = {
            ...newPages[0],
            events: [newEvent, ...newPages[0].events],
            totalCount: newPages[0].totalCount + 1,
          };
        }
        return { ...old, pages: newPages };
      });
    },
  });

  // Mutation for deleting copy event
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      return storageAdapter.copyEvents.deleteCopyEvent(id);
    },
    onSuccess: (_, deletedId) => {
      // Remove from all pages
      queryClient.setQueryData<InfiniteData<PaginatedCopyEvents>>(['copyHistory', userId], (old) => {
        if (!old?.pages) return old;

        const newPages = old.pages.map((page) => ({
          ...page,
          events: page.events.filter((event) => event.id !== deletedId),
          totalCount: page.totalCount - 1,
        }));
        return { ...old, pages: newPages };
      });
    },
  });

  // Mutation for clearing history
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!storageAdapter) {
        throw new Error('Storage not initialized');
      }
      return storageAdapter.copyEvents.clearHistory();
    },
    onSuccess: () => {
      // Invalidate and reset query
      queryClient.invalidateQueries({ queryKey: ['copyHistory', userId] });
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
      refetch();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [storageAdapter, userId, refetch]);

  // Wrapper functions for backward compatibility
  const addCopyEvent = useCallback(async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
    await addMutation.mutateAsync(event);
  }, [addMutation]);

  const deleteCopyEvent = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const clearHistory = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  // Search function
  const searchCopyEvents = useCallback(async (query: string) => {
    if (!storageAdapter) {
      return;
    }

    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await storageAdapter.copyEvents.searchCopyEvents(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search copy events:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [storageAdapter]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);

  return (
    <CopyHistoryContext.Provider value={{
      copyHistory,
      loading: isLoading,
      error,
      fetchNextPage: () => fetchNextPage(),
      hasNextPage: hasNextPage ?? false,
      isFetchingNextPage,
      totalCount,
      refetch: () => refetch(),
      searchCopyEvents,
      searchResults,
      isSearching,
      clearSearch,
      addCopyEvent,
      clearHistory,
      deleteCopyEvent,
    }}>
      {children}
    </CopyHistoryContext.Provider>
  );
};
