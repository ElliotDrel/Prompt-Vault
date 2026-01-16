import { useMemo, useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';

export type SortBy = 'name' | 'lastUpdated' | 'usage';
export type SortDirection = 'asc' | 'desc';

interface UsePromptFiltersOptions {
  prompts: Prompt[];
  initialSortBy?: SortBy;
  initialSortDirection?: SortDirection;
  pinFirst?: boolean; // Whether to sort pinned items to top (default: true)
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
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

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
