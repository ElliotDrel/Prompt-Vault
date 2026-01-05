import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Prompt } from '@/types/prompt';
import { createStorageAdapter, StorageAdapter } from '@/lib/storage';
import { sanitizeVariables } from '@/utils/variableUtils';
import { useAuth } from '@/contexts/AuthContext';

interface PromptsContextType {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  isBackgroundRefresh: boolean;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => Promise<Prompt>;
  updatePrompt: (id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  togglePinPrompt: (id: string) => Promise<void>;
  stats: {
    totalPrompts: number;
    totalCopies: number;
    timeSavedMinutes: number;
  };
  statsLoading: boolean;
  incrementCopyCount: () => Promise<void>;
  incrementPromptUsage: (promptId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

const defaultStats = {
  totalPrompts: 0,
  totalCopies: 0,
  timeSavedMinutes: 0,
};

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [storageAdapter, setStorageAdapter] = useState<StorageAdapter | null>(null);

  const { user, loading: authLoading } = useAuth();

  const loadPrompts = useCallback(async (adapter: StorageAdapter, silent = false) => {
    try {
      if (silent) {
        setIsBackgroundRefresh(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const promptsData = await adapter.prompts.getPrompts();
      setPrompts(
        promptsData.map((promptItem) => ({
          ...promptItem,
          variables: sanitizeVariables(promptItem.variables ?? []),
        }))
      );
    } catch (err) {
      console.error('Failed to load prompts:', err);
      setError('Failed to load prompts');
    } finally {
      setLoading(false);
      setIsBackgroundRefresh(false);
    }
  }, []);

  const loadStats = useCallback(async (adapter: StorageAdapter) => {
    try {
      setStatsLoading(true);
      const statsData = await adapter.stats.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
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

            if (type === 'prompts') {
              loadPrompts(adapter, true).catch((err) => {
                console.error('Failed to refresh prompts via subscription:', err);
              });
            } else if (type === 'copyEvents' || type === 'stats') {
              loadStats(adapter).catch((err) => {
                console.error('Failed to refresh stats via subscription:', err);
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
  }, [authLoading, user?.id, loadPrompts, loadStats]);

  useEffect(() => {
    if (!storageAdapter) {
      setPrompts([]);
      setStats(defaultStats);
      return;
    }

    loadPrompts(storageAdapter).catch((err) => {
      console.error('Failed to load prompts for adapter:', err);
    });
    loadStats(storageAdapter).catch((err) => {
      console.error('Failed to load stats for adapter:', err);
    });
  }, [storageAdapter, loadPrompts, loadStats]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      const newPrompt = await storageAdapter.prompts.addPrompt(promptData);
      const sanitizedPrompt = {
        ...newPrompt,
        variables: sanitizeVariables(newPrompt.variables ?? []),
      };
      setPrompts((prev) => [sanitizedPrompt, ...prev]);
      await loadStats(storageAdapter);
      return sanitizedPrompt;
    } catch (err) {
      console.error('Failed to add prompt:', err);
      setError('Failed to add prompt');
      throw err;
    }
  }, [storageAdapter, loadStats]);

  const updatePrompt = useCallback(async (id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      const updatedPrompt = await storageAdapter.prompts.updatePrompt(id, promptData);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };
      setPrompts((prev) => prev.map((prompt) => (prompt.id === id ? sanitizedPrompt : prompt)));
      await loadStats(storageAdapter);
      return sanitizedPrompt;
    } catch (err) {
      console.error('Failed to update prompt:', err);
      setError('Failed to update prompt');
      throw err;
    }
  }, [storageAdapter, loadStats]);

  const deletePrompt = useCallback(async (id: string) => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storageAdapter.prompts.deletePrompt(id);
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      await loadStats(storageAdapter);
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      setError('Failed to delete prompt');
      throw err;
    }
  }, [storageAdapter, loadStats]);

  const togglePinPrompt = useCallback(async (id: string) => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      const updatedPrompt = await storageAdapter.prompts.togglePinPrompt(id);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };
      setPrompts((prev) => prev.map((prompt) => (prompt.id === id ? sanitizedPrompt : prompt)));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      setError('Failed to toggle pin');
      throw err;
    }
  }, [storageAdapter]);

  const incrementPromptUsage = useCallback(async (promptId: string) => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      const updatedPrompt = await storageAdapter.prompts.incrementPromptUsage(promptId);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };
      setPrompts((prev) => prev.map((prompt) => (prompt.id === promptId ? sanitizedPrompt : prompt)));
      await loadStats(storageAdapter);
    } catch (err) {
      console.error('Failed to increment usage:', err);
      setError('Failed to increment usage');
      throw err;
    }
  }, [storageAdapter, loadStats]);

  const incrementCopyCount = useCallback(async () => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storageAdapter.stats.incrementCopyCount();
      await loadStats(storageAdapter);
    } catch (err) {
      console.error('Failed to increment copy count:', err);
      setError('Failed to increment copy count');
      throw err;
    }
  }, [storageAdapter, loadStats]);

  const refreshData = useCallback(async () => {
    if (!storageAdapter) {
      setError('Storage not initialized');
      throw new Error('Storage not initialized');
    }

    await Promise.all([
      loadPrompts(storageAdapter),
      loadStats(storageAdapter),
    ]);
  }, [storageAdapter, loadPrompts, loadStats]);

  return (
    <PromptsContext.Provider value={{
      prompts,
      loading,
      error,
      isBackgroundRefresh,
      addPrompt,
      updatePrompt,
      deletePrompt,
      togglePinPrompt,
      stats,
      statsLoading,
      incrementCopyCount,
      incrementPromptUsage,
      refreshData,
    }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
