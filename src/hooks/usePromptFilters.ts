import { useMemo, useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';

// Re-export types from useURLFilterSync for convenience
export type { SortBy, SortDirection, VisibilityFilter } from './useURLFilterSync';
import type { SortBy, SortDirection, VisibilityFilter } from './useURLFilterSync';

// Controlled state interface for external state management (e.g., URL sync)
interface ControlledFilterState {
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  visibilityFilter?: VisibilityFilter;
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setVisibilityFilter?: (visibility: VisibilityFilter) => void;
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
  visibilityFilter: VisibilityFilter;

  // Setters
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setVisibilityFilter: (visibility: VisibilityFilter) => void;
  toggleSortDirection: () => void;

  // Computed
  filteredPrompts: Prompt[];
  hasResults: boolean;
  isEmpty: boolean; // true if prompts array was empty
  isFiltered: boolean; // true if searchTerm or visibility filter is active
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
  const [internalVisibilityFilter, setInternalVisibilityFilter] = useState<VisibilityFilter>('all');

  const internalToggleSortDirection = useCallback(() => {
    setInternalSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Use controlled state if provided, otherwise use internal state
  const searchTerm = controlledState?.searchTerm ?? internalSearchTerm;
  const sortBy = controlledState?.sortBy ?? internalSortBy;
  const sortDirection = controlledState?.sortDirection ?? internalSortDirection;
  const visibilityFilter = controlledState?.visibilityFilter ?? internalVisibilityFilter;
  const setSearchTerm = controlledState?.setSearchTerm ?? setInternalSearchTerm;
  const setSortBy = controlledState?.setSortBy ?? setInternalSortBy;
  const setSortDirection = controlledState?.setSortDirection ?? setInternalSortDirection;
  const setVisibilityFilter = controlledState?.setVisibilityFilter ?? setInternalVisibilityFilter;
  const toggleSortDirection = controlledState?.toggleSortDirection ?? internalToggleSortDirection;

  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Visibility filter (apply first)
    if (visibilityFilter && visibilityFilter !== 'all') {
      result = result.filter((p) => p.visibility === visibilityFilter);
    }

    // Search filter (case-insensitive match across title, body, author name, and author ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((prompt) => {
        const titleMatch = prompt.title.toLowerCase().includes(searchLower);
        const bodyMatch = prompt.body.toLowerCase().includes(searchLower);
        // Check author name and ID for public prompts
        const authorName = prompt.author?.displayName;
        const authorId = prompt.authorId;
        const authorMatch = (authorName && authorName.toLowerCase().includes(searchLower)) ||
                            (authorId && authorId.toLowerCase().includes(searchLower));
        return titleMatch || bodyMatch || authorMatch;
      });
    }

    // Sort the filtered prompts
    const sorted = [...result].sort((a, b) => {
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
      } else if (sortBy === 'createdAt') {
        // Note: Prompt type doesn't have createdAt field, use updatedAt as fallback
        // This will be updated when createdAt is added to the Prompt type
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        // lastUpdated (default)
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [prompts, visibilityFilter, searchTerm, sortBy, sortDirection, pinFirst]);

  const isEmpty = prompts.length === 0;
  const isFiltered = searchTerm.length > 0 || visibilityFilter !== 'all';
  const hasResults = filteredPrompts.length > 0;

  return {
    // State
    searchTerm,
    sortBy,
    sortDirection,
    visibilityFilter,

    // Setters
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setVisibilityFilter,
    toggleSortDirection,

    // Computed
    filteredPrompts,
    hasResults,
    isEmpty,
    isFiltered,
  };
}
