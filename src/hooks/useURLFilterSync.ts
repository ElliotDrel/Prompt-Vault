import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VisibilityFilter, AuthorFilter, FilterPreferences, StatsStorageAdapter } from '@/lib/storage/types';

// Re-export types from storage for convenience
export type { VisibilityFilter, AuthorFilter } from '@/lib/storage/types';

// Export types for consistency across the app
export type SortBy = 'name' | 'lastUpdated' | 'createdAt' | 'usage';
export type SortDirection = 'asc' | 'desc';

// Valid values for validation
const VALID_SORT_BY: SortBy[] = ['name', 'lastUpdated', 'createdAt', 'usage'];
const VALID_SORT_DIRECTION: SortDirection[] = ['asc', 'desc'];
const VALID_VISIBILITY_FILTER: VisibilityFilter[] = ['all', 'public', 'private'];
const VALID_AUTHOR_FILTER: AuthorFilter[] = ['all', 'mine', 'others'];

interface URLFilterConfig {
  searchParam?: string;      // URL param name for search (default: 'q')
  sortByParam?: string;      // URL param name for sortBy (default: 'sort')
  sortDirParam?: string;     // URL param name for sortDirection (default: 'dir')
  authorParam?: string;      // URL param name for author filter (default: 'author')
  visibilityParam?: string;  // URL param name for visibility filter (default: 'visibility')
  debounceMs?: number;       // Debounce delay for URL updates (default: 300)
  defaultSortBy?: SortBy;    // Default sort field (default: 'lastUpdated')
  defaultSortDirection?: SortDirection; // Default sort direction (default: 'desc')
  // Persistence options
  persistToDb?: boolean;     // Enable DB persistence (default: false)
  adapter?: StatsStorageAdapter; // Adapter for DB persistence
}

interface UseURLFilterSyncReturn {
  // State (read from URL on mount, synced to URL on change)
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  authorFilter: string | null;
  visibilityFilter: VisibilityFilter;

  // Setters (update both state and URL)
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setAuthorFilter: (author: string | null) => void;
  setVisibilityFilter: (visibility: VisibilityFilter) => void;
  toggleSortDirection: () => void;
  clearFilters: () => void;
}

// Validation helpers
function isValidSortBy(value: string | null): value is SortBy {
  return value !== null && VALID_SORT_BY.includes(value as SortBy);
}

function isValidSortDirection(value: string | null): value is SortDirection {
  return value !== null && VALID_SORT_DIRECTION.includes(value as SortDirection);
}

function isValidVisibilityFilter(value: string | null): value is VisibilityFilter {
  return value !== null && VALID_VISIBILITY_FILTER.includes(value as VisibilityFilter);
}

function isValidAuthorFilter(value: string | null): value is AuthorFilter {
  return value !== null && VALID_AUTHOR_FILTER.includes(value as AuthorFilter);
}

// Simple debounce helper
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function useURLFilterSync(config: URLFilterConfig = {}): UseURLFilterSyncReturn {
  const {
    searchParam = 'q',
    sortByParam = 'sort',
    sortDirParam = 'dir',
    authorParam = 'author',
    visibilityParam = 'visibility',
    debounceMs = 300,
    defaultSortBy = 'lastUpdated',
    defaultSortDirection = 'desc',
    persistToDb = false,
    adapter,
  } = config;

  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state directly from URL params to avoid flash
  // This runs once during initial render, not in useEffect
  const getInitialSearchTerm = () => searchParams.get(searchParam) ?? '';
  const getInitialSortBy = (): SortBy => {
    const value = searchParams.get(sortByParam);
    return isValidSortBy(value) ? value : defaultSortBy;
  };
  const getInitialSortDirection = (): SortDirection => {
    const value = searchParams.get(sortDirParam);
    return isValidSortDirection(value) ? value : defaultSortDirection;
  };
  const getInitialAuthorFilter = () => searchParams.get(authorParam) ?? null;
  const getInitialVisibilityFilter = (): VisibilityFilter => {
    const value = searchParams.get(visibilityParam);
    return isValidVisibilityFilter(value) ? value : 'all';
  };

  // Local state initialized from URL
  const [searchTerm, setSearchTermState] = useState(getInitialSearchTerm);
  const [sortBy, setSortByState] = useState<SortBy>(getInitialSortBy);
  const [sortDirection, setSortDirectionState] = useState<SortDirection>(getInitialSortDirection);
  const [authorFilter, setAuthorFilterState] = useState<string | null>(getInitialAuthorFilter);
  const [visibilityFilter, setVisibilityFilterState] = useState<VisibilityFilter>(getInitialVisibilityFilter);

  // Debounce timer ref for search term URL updates
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track URL updates triggered by this hook to avoid clobbering local state.
  const lastSetParamsRef = useRef<string | null>(null);
  // Track if DB preferences have been loaded
  const dbPrefsLoadedRef = useRef(false);

  // Debounced persistence to DB
  const debouncedPersist = useMemo(() =>
    debounce((prefs: Partial<FilterPreferences>) => {
      if (persistToDb && adapter) {
        adapter.updateFilterPreferences(prefs).catch((err) => {
          console.error('Failed to persist filter preferences:', err);
        });
      }
    }, 500),
    [persistToDb, adapter]
  );

  // Load initial values from DB when available (only if URL doesn't have explicit values)
  useEffect(() => {
    if (!persistToDb || !adapter || dbPrefsLoadedRef.current) return;
    dbPrefsLoadedRef.current = true;

    adapter.getFilterPreferences().then((prefs) => {
      // Only apply DB values if URL doesn't have explicit values for these fields
      if (!searchParams.has(visibilityParam) && prefs.filterVisibility !== 'all') {
        setVisibilityFilterState(prefs.filterVisibility);
      }
      if (!searchParams.has(sortByParam) && prefs.sortBy !== defaultSortBy) {
        setSortByState(prefs.sortBy as SortBy);
      }
      if (!searchParams.has(sortDirParam) && prefs.sortDirection !== defaultSortDirection) {
        setSortDirectionState(prefs.sortDirection);
      }
    }).catch((err) => {
      console.error('Failed to load filter preferences:', err);
    });
  }, [persistToDb, adapter, searchParams, visibilityParam, sortByParam, sortDirParam, defaultSortBy, defaultSortDirection]);

  // Helper to update URL params (removes empty values)
  const updateURLParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }

      lastSetParamsRef.current = newParams.toString();
      return newParams;
    }, { replace: true, preventScrollReset: true });
  }, [setSearchParams]);

  // Sync state when URL changes externally (e.g., back/forward navigation).
  useEffect(() => {
    const currentParams = searchParams.toString();
    if (lastSetParamsRef.current === currentParams) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const nextSearchTerm = searchParams.get(searchParam) ?? '';
    const sortByValue = searchParams.get(sortByParam);
    const sortDirValue = searchParams.get(sortDirParam);
    const visibilityValue = searchParams.get(visibilityParam);
    const nextSortBy = isValidSortBy(sortByValue) ? sortByValue : defaultSortBy;
    const nextSortDirection = isValidSortDirection(sortDirValue) ? sortDirValue : defaultSortDirection;
    const nextAuthorFilter = searchParams.get(authorParam) ?? null;
    const nextVisibilityFilter = isValidVisibilityFilter(visibilityValue) ? visibilityValue : 'all';

    setSearchTermState((prev) => (prev === nextSearchTerm ? prev : nextSearchTerm));
    setSortByState((prev) => (prev === nextSortBy ? prev : nextSortBy));
    setSortDirectionState((prev) => (prev === nextSortDirection ? prev : nextSortDirection));
    setAuthorFilterState((prev) => (prev === nextAuthorFilter ? prev : nextAuthorFilter));
    setVisibilityFilterState((prev) => (prev === nextVisibilityFilter ? prev : nextVisibilityFilter));
  }, [searchParams, searchParam, sortByParam, sortDirParam, authorParam, visibilityParam, defaultSortBy, defaultSortDirection]);

  // Search term setter with debounced URL update
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce URL update
    debounceTimerRef.current = setTimeout(() => {
      updateURLParams({ [searchParam]: term || null });
    }, debounceMs);
  }, [searchParam, debounceMs, updateURLParams]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sort setters (immediate URL update, persist to DB)
  const setSortBy = useCallback((by: SortBy) => {
    setSortByState(by);
    // Only show in URL if not default
    updateURLParams({ [sortByParam]: by !== defaultSortBy ? by : null });
    debouncedPersist({ sortBy: by });
  }, [sortByParam, defaultSortBy, updateURLParams, debouncedPersist]);

  const setSortDirection = useCallback((dir: SortDirection) => {
    setSortDirectionState(dir);
    // Only show in URL if not default
    updateURLParams({ [sortDirParam]: dir !== defaultSortDirection ? dir : null });
    debouncedPersist({ sortDirection: dir });
  }, [sortDirParam, defaultSortDirection, updateURLParams, debouncedPersist]);

  const toggleSortDirection = useCallback(() => {
    setSortDirectionState((prev) => {
      const newDir = prev === 'asc' ? 'desc' : 'asc';
      // Only show in URL if not default
      updateURLParams({ [sortDirParam]: newDir !== defaultSortDirection ? newDir : null });
      debouncedPersist({ sortDirection: newDir });
      return newDir;
    });
  }, [sortDirParam, defaultSortDirection, updateURLParams, debouncedPersist]);

  // Author filter setter (immediate URL update)
  const setAuthorFilter = useCallback((author: string | null) => {
    setAuthorFilterState(author);
    updateURLParams({ [authorParam]: author });
    // Note: author filter not persisted to DB currently (author filter is context-specific)
  }, [authorParam, updateURLParams]);

  // Visibility filter setter (immediate URL update, persist to DB)
  const setVisibilityFilter = useCallback((visibility: VisibilityFilter) => {
    setVisibilityFilterState(visibility);
    // Only show in URL if not default
    updateURLParams({ [visibilityParam]: visibility !== 'all' ? visibility : null });
    debouncedPersist({ filterVisibility: visibility });
  }, [visibilityParam, updateURLParams, debouncedPersist]);

  // Clear all filters and reset URL
  const clearFilters = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset local state
    setSearchTermState('');
    setSortByState(defaultSortBy);
    setSortDirectionState(defaultSortDirection);
    setAuthorFilterState(null);
    setVisibilityFilterState('all');

    // Clear all filter params from URL
    updateURLParams({
      [searchParam]: null,
      [sortByParam]: null,
      [sortDirParam]: null,
      [authorParam]: null,
      [visibilityParam]: null,
    });

    // Persist reset to DB
    debouncedPersist({
      filterVisibility: 'all',
      sortBy: defaultSortBy,
      sortDirection: defaultSortDirection,
    });
  }, [searchParam, sortByParam, sortDirParam, authorParam, visibilityParam, defaultSortBy, defaultSortDirection, updateURLParams, debouncedPersist]);

  return {
    // State
    searchTerm,
    sortBy,
    sortDirection,
    authorFilter,
    visibilityFilter,

    // Setters
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setAuthorFilter,
    setVisibilityFilter,
    toggleSortDirection,
    clearFilters,
  };
}
