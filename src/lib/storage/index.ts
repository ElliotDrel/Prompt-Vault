import { StorageAdapter } from './types';
import { SupabaseAdapter } from './supabaseAdapter';
import { getCurrentUserId } from '@/lib/supabaseClient';

/**
 * Factory function to create the appropriate storage adapter.
 * Returns Supabase adapter for authenticated users.
 *
 * @param userId - Optional pre-resolved userId from AuthContext.
 *   When provided, skips redundant supabase.auth.getUser() network calls.
 *   Falls back to async getCurrentUserId() if not provided (backward compat).
 */
export async function createStorageAdapter(userId?: string): Promise<StorageAdapter | null> {
  try {
    // Use provided userId (from AuthContext) to skip redundant getUser() call
    const resolvedUserId = userId ?? await getCurrentUserId();

    if (resolvedUserId) {
      // User is authenticated — adapter is a stateless wrapper around
      // Supabase client, so no additional readiness check is needed.
      return new SupabaseAdapter();
    }
  } catch (error) {
    console.warn('Failed to initialize Supabase adapter:', error);
    throw error;
  }

  return null;
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
export { SupabaseAdapter } from './supabaseAdapter';
