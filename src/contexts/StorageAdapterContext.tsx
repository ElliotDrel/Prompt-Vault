import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createStorageAdapter, StorageAdapter } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

type StorageAdapterContextValue = {
  adapter: StorageAdapter | null;
  loading: boolean;
  error: string | null;
};

const StorageAdapterContext = createContext<StorageAdapterContextValue | undefined>(undefined);

export function StorageAdapterProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [adapter, setAdapter] = useState<StorageAdapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      setLoading(true);
      return () => {
        isMounted = false;
      };
    }

    if (!userId) {
      setAdapter(null);
      setError(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    setError(null);
    setAdapter(null);

    createStorageAdapter()
      .then((nextAdapter) => {
        if (!isMounted) {
          return;
        }
        if (!nextAdapter) {
          setError('Failed to initialize storage');
          setAdapter(null);
          return;
        }
        setAdapter(nextAdapter);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }
        console.error('Failed to initialize storage adapter:', err);
        setError('Failed to initialize storage');
        setAdapter(null);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, userId]);

  const value = useMemo(
    () => ({
      adapter,
      loading,
      error,
    }),
    [adapter, loading, error]
  );

  return (
    <StorageAdapterContext.Provider value={value}>
      {children}
    </StorageAdapterContext.Provider>
  );
}

export function useStorageAdapterContext() {
  const context = useContext(StorageAdapterContext);
  if (context === undefined) {
    throw new Error('useStorageAdapterContext must be used within a StorageAdapterProvider');
  }
  return context;
}
