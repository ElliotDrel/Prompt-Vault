import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { getCurrentUserId } from '@/lib/supabaseClient';

/**
 * Factory function to create the appropriate storage adapter
 * Returns Supabase adapter for authenticated users, localStorage for anonymous users
 */
export async function createStorageAdapter(): Promise<StorageAdapter> {
  try {
    const userId = await getCurrentUserId();

    if (userId) {
      // User is authenticated, use Supabase
      const adapter = new SupabaseAdapter();
      const isReady = await adapter.isReady();

      if (isReady) {
        return adapter;
      }
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase adapter, falling back to localStorage:', error);
  }

  // Fall back to localStorage for anonymous users or if Supabase fails
  return new LocalStorageAdapter();
}

/**
 * Hook to get the storage adapter with automatic switching based on auth state
 */
export function useStorageAdapter() {
  return {
    getAdapter: createStorageAdapter,
  };
}

// Re-export types and adapters for convenience
export * from './types';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SupabaseAdapter } from './supabaseAdapter';