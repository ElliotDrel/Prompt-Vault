import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CopyEvent } from '../types/prompt';
import { createStorageAdapter, StorageAdapter } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface CopyHistoryContextType {
  copyHistory: CopyEvent[];
  loading: boolean;
  error: string | null;
  addCopyEvent: (event: Omit<CopyEvent, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteCopyEvent: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
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
  const [copyHistory, setCopyHistory] = useState<CopyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageAdapter, setStorageAdapter] = useState<StorageAdapter | null>(null);

  const { user, loading: authLoading } = useAuth();

  const loadCopyHistory = useCallback(async (adapter: StorageAdapter) => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await adapter.copyEvents.getCopyEvents();
      setCopyHistory(historyData);
    } catch (err) {
      console.error('Failed to load copy history:', err);
      setError('Failed to load copy history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initAdapter = async () => {
      try {
        const adapter = await createStorageAdapter();
        if (!isMounted) {
          return;
        }

        setStorageAdapter(adapter);

        if (adapter.subscribe) {
          unsubscribe = adapter.subscribe((type) => {
            if (!isMounted) {
              return;
            }

            if (type === 'copyEvents') {
              loadCopyHistory(adapter).catch((err) => {
                console.error('Failed to refresh copy history via subscription:', err);
              });
            }
          });
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Failed to initialize storage adapter:', err);
        setError('Failed to initialize storage');
      }
    };

    initAdapter();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authLoading, user, loadCopyHistory]);

  useEffect(() => {
    if (!storageAdapter) {
      setCopyHistory([]);
      return;
    }

    loadCopyHistory(storageAdapter).catch((err) => {
      console.error('Failed to load copy history for adapter:', err);
    });
  }, [storageAdapter, loadCopyHistory]);

  const addCopyEvent = useCallback(async (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      return;
    }

    try {
      setError(null);
      const newEvent = await storageAdapter.copyEvents.addCopyEvent(event);
      setCopyHistory((prev) => [newEvent, ...prev]);
    } catch (err) {
      console.error('Failed to add copy event:', err);
      setError('Failed to add copy event');
      throw err;
    }
  }, [storageAdapter]);

  const clearHistory = useCallback(async () => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      return;
    }

    try {
      setError(null);
      await storageAdapter.copyEvents.clearHistory();
      setCopyHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history');
      throw err;
    }
  }, [storageAdapter]);

  const deleteCopyEvent = useCallback(async (id: string) => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      return;
    }

    try {
      setError(null);
      await storageAdapter.copyEvents.deleteCopyEvent(id);
      setCopyHistory((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error('Failed to delete copy event:', err);
      setError('Failed to delete copy event');
      throw err;
    }
  }, [storageAdapter]);

  const refreshHistory = useCallback(async () => {
    if (!storageAdapter) {
      return;
    }

    await loadCopyHistory(storageAdapter);
  }, [storageAdapter, loadCopyHistory]);

  return (
    <CopyHistoryContext.Provider value={{
      copyHistory,
      loading,
      error,
      addCopyEvent,
      clearHistory,
      deleteCopyEvent,
      refreshHistory,
    }}>
      {children}
    </CopyHistoryContext.Provider>
  );
};
