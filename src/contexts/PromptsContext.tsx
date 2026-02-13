import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Prompt } from '@/types/prompt';
import { StorageAdapter, UpdatePromptOptions } from '@/lib/storage';
import { sanitizeVariables } from '@/utils/variableUtils';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';

interface PromptsContextType {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  isBackgroundRefresh: boolean;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => Promise<Prompt>;
  updatePrompt: (id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>, options?: UpdatePromptOptions) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  togglePinPrompt: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  stats: {
    totalPrompts: number;
    totalCopies: number;
    totalPromptUses: number;
    timeSavedMultiplier: number;
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
  totalPromptUses: 0,
  timeSavedMultiplier: 5,
};

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const { adapter: storageAdapter, loading: adapterLoading, error: adapterError } = useStorageAdapterContext();

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

  const getAdapter = useCallback((): StorageAdapter => {
    if (!storageAdapter) {
      const err = new Error('Storage not initialized');
      setError(err.message);
      throw err;
    }
    return storageAdapter;
  }, [storageAdapter]);

  useEffect(() => {
    if (adapterError) {
      setError(adapterError);
    }
  }, [adapterError]);

  useEffect(() => {
    if (adapterLoading || !storageAdapter?.subscribe) {
      return;
    }

    let isMounted = true;
    const unsubscribe = storageAdapter.subscribe((type) => {
      if (!isMounted) {
        return;
      }

      if (type === 'prompts') {
        loadPrompts(storageAdapter, true).catch((err) => {
          console.error('Failed to refresh prompts via subscription:', err);
        });
        // Also refresh stats because prompt_stats view depends on prompts table
        loadStats(storageAdapter).catch((err) => {
          console.error('Failed to refresh stats via subscription:', err);
        });
      } else if (type === 'copyEvents' || type === 'stats') {
        loadStats(storageAdapter).catch((err) => {
          console.error('Failed to refresh stats via subscription:', err);
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [adapterLoading, storageAdapter, loadPrompts, loadStats]);

  useEffect(() => {
    if (!storageAdapter) {
      setPrompts([]);
      setStats(defaultStats);
      return;
    }
    if (adapterLoading) {
      return;
    }

    loadPrompts(storageAdapter).catch((err) => {
      console.error('Failed to load prompts for adapter:', err);
    });
    loadStats(storageAdapter).catch((err) => {
      console.error('Failed to load stats for adapter:', err);
    });
  }, [adapterLoading, storageAdapter, loadPrompts, loadStats]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> => {
    const adapter = getAdapter();

    try {
      setError(null);
      const newPrompt = await adapter.prompts.addPrompt(promptData);
      const sanitizedPrompt = {
        ...newPrompt,
        variables: sanitizeVariables(newPrompt.variables ?? []),
      };
      setPrompts((prev) => [sanitizedPrompt, ...prev]);
      await loadStats(adapter);
      return sanitizedPrompt;
    } catch (err) {
      console.error('Failed to add prompt:', err);
      setError('Failed to add prompt');
      throw err;
    }
  }, [getAdapter, loadStats]);

  const updatePrompt = useCallback(async (id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>, options?: UpdatePromptOptions): Promise<Prompt> => {
    const adapter = getAdapter();

    try {
      setError(null);
      const updatedPrompt = await adapter.prompts.updatePrompt(id, promptData, options);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };
      setPrompts((prev) => prev.map((prompt) => (prompt.id === id ? sanitizedPrompt : prompt)));
      await loadStats(adapter);
      return sanitizedPrompt;
    } catch (err) {
      console.error('Failed to update prompt:', err);
      setError('Failed to update prompt');
      throw err;
    }
  }, [getAdapter, loadStats]);

  const deletePrompt = useCallback(async (id: string) => {
    const adapter = getAdapter();

    try {
      setError(null);
      await adapter.prompts.deletePrompt(id);
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      await loadStats(adapter);
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      setError('Failed to delete prompt');
      throw err;
    }
  }, [getAdapter, loadStats]);

  const togglePinPrompt = useCallback(async (id: string) => {
    const adapter = getAdapter();

    try {
      setError(null);
      const updatedPrompt = await adapter.prompts.togglePinPrompt(id);
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
  }, [getAdapter]);

  const toggleVisibility = useCallback(async (id: string) => {
    const adapter = getAdapter();

    // Store previous state for rollback on error
    let previousPrompts: Prompt[] | null = null;

    try {
      setError(null);

      // Optimistic update for instant feedback
      setPrompts((prev) => {
        previousPrompts = prev;
        return prev.map((p) =>
          p.id === id
            ? { ...p, visibility: p.visibility === 'public' ? 'private' : 'public' }
            : p
        );
      });

      const updatedPrompt = await adapter.prompts.toggleVisibility(id);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };

      // Sync with server response
      setPrompts((prev) => prev.map((p) =>
        p.id === id ? sanitizedPrompt : p
      ));

      // Invalidate public prompts query so Library page reflects the change
      await queryClient.invalidateQueries({ queryKey: ['publicPrompts'] });
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      setError('Failed to toggle visibility');

      // Rollback optimistic update on error
      if (previousPrompts !== null) {
        setPrompts(previousPrompts);
      }

      throw err;
    }
  }, [getAdapter, queryClient]);

  const incrementPromptUsage = useCallback(async (promptId: string) => {
    const adapter = getAdapter();

    // Store previous state for rollback on error
    let previousPrompts: Prompt[] | null = null;
    let previousStats: typeof stats | null = null;
    let shouldUpdateStats = false;

    try {
      setError(null);

      // Optimistic update: Immediately update UI state before database call
      setPrompts((prev) => {
        const hasPrompt = prev.some((prompt) => prompt.id === promptId);
        if (!hasPrompt) {
          return prev;
        }

        shouldUpdateStats = true;
        previousPrompts = prev; // Store for rollback
        return prev.map((prompt) =>
          prompt.id === promptId
            ? { ...prompt, timesUsed: (prompt.timesUsed ?? 0) + 1 }
            : prompt
        );
      });

      if (shouldUpdateStats) {
        setStats((prev) => {
          previousStats = prev; // Store for rollback
          return {
            ...prev,
            totalPromptUses: (prev.totalPromptUses ?? 0) + 1,
          };
        });
      }

      // Background: Confirm with database
      const updatedPrompt = await adapter.prompts.incrementPromptUsage(promptId);
      const sanitizedPrompt = {
        ...updatedPrompt,
        variables: sanitizeVariables(updatedPrompt.variables ?? []),
      };

      // Replace optimistic update with server-confirmed data
      setPrompts((prev) => prev.map((prompt) => (prompt.id === promptId ? sanitizedPrompt : prompt)));
      // Stats are refreshed by the realtime subscription in PromptsProvider (prompts/copyEvents events call loadStats).
    } catch (err) {
      console.error('Failed to increment usage:', err);
      setError('Failed to increment usage');

      // Rollback optimistic updates on error
      if (previousPrompts !== null) {
        setPrompts(previousPrompts);
      }
      if (previousStats !== null) {
        setStats(previousStats);
      }

      throw err;
    }
  }, [getAdapter]);

  const incrementCopyCount = useCallback(async () => {
    const adapter = getAdapter();

    try {
      setError(null);
      await adapter.stats.incrementCopyCount();
      await loadStats(adapter);
    } catch (err) {
      console.error('Failed to increment copy count:', err);
      setError('Failed to increment copy count');
      throw err;
    }
  }, [getAdapter, loadStats]);

  const refreshData = useCallback(async () => {
    const adapter = getAdapter();

    await Promise.all([
      loadPrompts(adapter),
      loadStats(adapter),
    ]);
  }, [getAdapter, loadPrompts, loadStats]);

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
      toggleVisibility,
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
