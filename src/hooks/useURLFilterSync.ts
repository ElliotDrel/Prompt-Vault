import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Export types for consistency across the app
export type SortBy = 'name' | 'lastUpdated' | 'usage';
export type SortDirection = 'asc' | 'desc';

// Valid values for validation
const VALID_SORT_BY: SortBy[] = ['name', 'lastUpdated', 'usage'];
const VALID_SORT_DIRECTION: SortDirection[] = ['asc', 'desc'];

interface URLFilterConfig {
  searchParam?: string;      // URL param name for search (default: 'q')
  sortByParam?: string;      // URL param name for sortBy (default: 'sort')
  sortDirParam?: string;     // URL param name for sortDirection (default: 'dir')
  authorParam?: string;      // URL param name for author filter (default: 'author')
  debounceMs?: number;       // Debounce delay for URL updates (default: 300)
  defaultSortBy?: SortBy;    // Default sort field (default: 'lastUpdated')
  defaultSortDirection?: SortDirection; // Default sort direction (default: 'desc')
}

interface UseURLFilterSyncReturn {
  // State (read from URL on mount, synced to URL on change)
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  authorFilter: string | null;

  // Setters (update both state and URL)
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setAuthorFilter: (author: string | null) => void;
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

export function useURLFilterSync(config: URLFilterConfig = {}): UseURLFilterSyncReturn {
  const {
    searchParam = 'q',
    sortByParam = 'sort',
    sortDirParam = 'dir',
    authorParam = 'author',
    debounceMs = 300,
    defaultSortBy = 'lastUpdated',
    defaultSortDirection = 'desc',
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

  // Local state initialized from URL
  const [searchTerm, setSearchTermState] = useState(getInitialSearchTerm);
  const [sortBy, setSortByState] = useState<SortBy>(getInitialSortBy);
  const [sortDirection, setSortDirectionState] = useState<SortDirection>(getInitialSortDirection);
  const [authorFilter, setAuthorFilterState] = useState<string | null>(getInitialAuthorFilter);

  // Debounce timer ref for search term URL updates
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track URL updates triggered by this hook to avoid clobbering local state.
  const lastSetParamsRef = useRef<string | null>(null);

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
    }, { replace: true });
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
    const nextSortBy = isValidSortBy(sortByValue) ? sortByValue : defaultSortBy;
    const nextSortDirection = isValidSortDirection(sortDirValue) ? sortDirValue : defaultSortDirection;
    const nextAuthorFilter = searchParams.get(authorParam) ?? null;

    setSearchTermState((prev) => (prev === nextSearchTerm ? prev : nextSearchTerm));
    setSortByState((prev) => (prev === nextSortBy ? prev : nextSortBy));
    setSortDirectionState((prev) => (prev === nextSortDirection ? prev : nextSortDirection));
    setAuthorFilterState((prev) => (prev === nextAuthorFilter ? prev : nextAuthorFilter));
  }, [searchParams, searchParam, sortByParam, sortDirParam, authorParam, defaultSortBy, defaultSortDirection]);

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

  // Sort setters (immediate URL update, no debounce)
  const setSortBy = useCallback((by: SortBy) => {
    setSortByState(by);
    // Only show in URL if not default
    updateURLParams({ [sortByParam]: by !== defaultSortBy ? by : null });
  }, [sortByParam, defaultSortBy, updateURLParams]);

  const setSortDirection = useCallback((dir: SortDirection) => {
    setSortDirectionState(dir);
    // Only show in URL if not default
    updateURLParams({ [sortDirParam]: dir !== defaultSortDirection ? dir : null });
  }, [sortDirParam, defaultSortDirection, updateURLParams]);

  const toggleSortDirection = useCallback(() => {
    setSortDirectionState((prev) => {
      const newDir = prev === 'asc' ? 'desc' : 'asc';
      // Only show in URL if not default
      updateURLParams({ [sortDirParam]: newDir !== defaultSortDirection ? newDir : null });
      return newDir;
    });
  }, [sortDirParam, defaultSortDirection, updateURLParams]);

  // Author filter setter (immediate URL update)
  const setAuthorFilter = useCallback((author: string | null) => {
    setAuthorFilterState(author);
    updateURLParams({ [authorParam]: author });
  }, [authorParam, updateURLParams]);

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

    // Clear all filter params from URL
    updateURLParams({
      [searchParam]: null,
      [sortByParam]: null,
      [sortDirParam]: null,
      [authorParam]: null,
    });
  }, [searchParam, sortByParam, sortDirParam, authorParam, defaultSortBy, defaultSortDirection, updateURLParams]);

  return {
    // State
    searchTerm,
    sortBy,
    sortDirection,
    authorFilter,

    // Setters
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setAuthorFilter,
    toggleSortDirection,
    clearFilters,
  };
}
