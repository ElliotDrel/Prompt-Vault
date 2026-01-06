import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyEvent } from '../types/prompt';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteCopyEvents } from '@/hooks/useInfiniteCopyEvents';

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

  // Use shared infinite copy events hook
  const {
    events: copyHistory,
    totalCount,
    loading: isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    addCopyEvent: addCopyEventMutation,
    deleteCopyEvent: deleteCopyEventMutation,
  } = useInfiniteCopyEvents({
    queryKey: ['copyHistory', userId ?? 'anonymous'],
    queryFn: async (offset, limit) => {
      if (!storageAdapter) {
        throw new Error('Storage adapter not initialized');
      }
      return storageAdapter.copyEvents.getCopyEvents(offset, limit);
    },
    limit: 25,
    enabled: !!storageAdapter && !!userId,
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
      queryClient.invalidateQueries({ queryKey: ['copyEvents', 'copyHistory', userId ?? 'anonymous'] });
    },
  });

  // Wrapper functions for backward compatibility
  const addCopyEvent = useCallback(async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
    await addCopyEventMutation(event);
  }, [addCopyEventMutation]);

  const deleteCopyEvent = useCallback(async (id: string) => {
    await deleteCopyEventMutation(id);
  }, [deleteCopyEventMutation]);

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
