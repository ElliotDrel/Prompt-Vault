import { useMemo, useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';

// Re-export types from useURLFilterSync for convenience
export type { SortBy, SortDirection } from './useURLFilterSync';
import type { SortBy, SortDirection } from './useURLFilterSync';

// Controlled state interface for external state management (e.g., URL sync)
interface ControlledFilterState {
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  toggleSortDirection: () => void;
}

interface UsePromptFiltersOptions {
  prompts: Prompt[];
  // Uncontrolled mode options (used when controlledState is not provided)
  initialSortBy?: SortBy;
  initialSortDirection?: SortDirection;
  pinFirst?: boolean; // Whether to sort pinned items to top (default: true)
  // Controlled mode: pass external state (e.g., from useURLFilterSync)
  controlledState?: ControlledFilterState;
}

interface UsePromptFiltersReturn {
  // State
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;

  // Setters
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  toggleSortDirection: () => void;

  // Computed
  filteredPrompts: Prompt[];
  hasResults: boolean;
  isEmpty: boolean; // true if prompts array was empty
  isFiltered: boolean; // true if searchTerm is active
}

export function usePromptFilters(options: UsePromptFiltersOptions): UsePromptFiltersReturn {
  const {
    prompts,
    initialSortBy = 'lastUpdated',
    initialSortDirection = 'desc',
    pinFirst = true,
    controlledState,
  } = options;

  // Internal state for uncontrolled mode
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalSortBy, setInternalSortBy] = useState<SortBy>(initialSortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(initialSortDirection);

  const internalToggleSortDirection = useCallback(() => {
    setInternalSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Use controlled state if provided, otherwise use internal state
  const searchTerm = controlledState?.searchTerm ?? internalSearchTerm;
  const sortBy = controlledState?.sortBy ?? internalSortBy;
  const sortDirection = controlledState?.sortDirection ?? internalSortDirection;
  const setSearchTerm = controlledState?.setSearchTerm ?? setInternalSearchTerm;
  const setSortBy = controlledState?.setSortBy ?? setInternalSortBy;
  const setSortDirection = controlledState?.setSortDirection ?? setInternalSortDirection;
  const toggleSortDirection = controlledState?.toggleSortDirection ?? internalToggleSortDirection;

  const filteredPrompts = useMemo(() => {
    // Filter by search term (case-insensitive title match)
    const filtered = prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered prompts
    const sorted = [...filtered].sort((a, b) => {
      // Pinned items first (if pinFirst is enabled)
      if (pinFirst) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      // Then sort by selected criteria
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'usage') {
        comparison = (a.timesUsed ?? 0) - (b.timesUsed ?? 0);
      } else {
        // lastUpdated
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [prompts, searchTerm, sortBy, sortDirection, pinFirst]);

  const isEmpty = prompts.length === 0;
  const isFiltered = searchTerm.length > 0;
  const hasResults = filteredPrompts.length > 0;

  return {
    // State
    searchTerm,
    sortBy,
    sortDirection,

    // Setters
    setSearchTerm,
    setSortBy,
    setSortDirection,
    toggleSortDirection,

    // Computed
    filteredPrompts,
    hasResults,
    isEmpty,
    isFiltered,
  };
}
