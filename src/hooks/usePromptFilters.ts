import { useMemo, useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';

// Re-export types from useURLFilterSync for convenience
export type { SortBy, SortDirection, VisibilityFilter, AuthorFilter } from './useURLFilterSync';
import type { SortBy, SortDirection, VisibilityFilter, AuthorFilter } from './useURLFilterSync';

// Controlled state interface for external state management (e.g., URL sync)
interface ControlledFilterState {
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  visibilityFilter?: VisibilityFilter;
  authorFilter?: AuthorFilter | string | null;
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setVisibilityFilter?: (visibility: VisibilityFilter) => void;
  setAuthorFilter?: (author: AuthorFilter) => void;
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
  // Current user ID (required for author filtering)
  userId?: string;
}

interface UsePromptFiltersReturn {
  // State
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  visibilityFilter: VisibilityFilter;
  authorFilter: AuthorFilter;

  // Setters
  setSearchTerm: (term: string) => void;
  setSortBy: (by: SortBy) => void;
  setSortDirection: (dir: SortDirection) => void;
  setVisibilityFilter: (visibility: VisibilityFilter) => void;
  setAuthorFilter: (author: AuthorFilter) => void;
  toggleSortDirection: () => void;

  // Computed
  filteredPrompts: Prompt[];
  hasResults: boolean;
  isEmpty: boolean; // true if prompts array was empty
  isFiltered: boolean; // true if searchTerm, visibility filter, or author filter is active
}

export function usePromptFilters(options: UsePromptFiltersOptions): UsePromptFiltersReturn {
  const {
    prompts,
    initialSortBy = 'lastUpdated',
    initialSortDirection = 'desc',
    pinFirst = true,
    controlledState,
    userId,
  } = options;

  // Internal state for uncontrolled mode
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalSortBy, setInternalSortBy] = useState<SortBy>(initialSortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(initialSortDirection);
  const [internalVisibilityFilter, setInternalVisibilityFilter] = useState<VisibilityFilter>('all');
  const [internalAuthorFilter, setInternalAuthorFilter] = useState<AuthorFilter>('all');

  const internalToggleSortDirection = useCallback(() => {
    setInternalSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Use controlled state if provided, otherwise use internal state
  const searchTerm = controlledState?.searchTerm ?? internalSearchTerm;
  const sortBy = controlledState?.sortBy ?? internalSortBy;
  const sortDirection = controlledState?.sortDirection ?? internalSortDirection;
  const visibilityFilter = controlledState?.visibilityFilter ?? internalVisibilityFilter;
  // Normalize authorFilter: useURLFilterSync returns string | null, we need AuthorFilter
  // Fall back to internalAuthorFilter when in uncontrolled mode
  const rawAuthorFilter = controlledState?.authorFilter ?? internalAuthorFilter;
  const authorFilter: AuthorFilter = (rawAuthorFilter === 'mine' || rawAuthorFilter === 'others') ? rawAuthorFilter : 'all';
  const setSearchTerm = controlledState?.setSearchTerm ?? setInternalSearchTerm;
  const setSortBy = controlledState?.setSortBy ?? setInternalSortBy;
  const setSortDirection = controlledState?.setSortDirection ?? setInternalSortDirection;
  const setVisibilityFilter = controlledState?.setVisibilityFilter ?? setInternalVisibilityFilter;
  const setAuthorFilter = controlledState?.setAuthorFilter ?? setInternalAuthorFilter;
  const toggleSortDirection = controlledState?.toggleSortDirection ?? internalToggleSortDirection;

  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Visibility filter (apply first)
    if (visibilityFilter && visibilityFilter !== 'all') {
      result = result.filter((p) => p.visibility === visibilityFilter);
    }

    // Author filter (requires userId to work)
    if (authorFilter && authorFilter !== 'all' && userId) {
      if (authorFilter === 'mine') {
        // Show only prompts authored by current user
        result = result.filter((p) => p.authorId === userId || p.author?.userId === userId);
      } else if (authorFilter === 'others') {
        // Show only prompts authored by other users
        result = result.filter((p) => p.authorId !== userId && p.author?.userId !== userId);
      }
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
  }, [prompts, visibilityFilter, authorFilter, userId, searchTerm, sortBy, sortDirection, pinFirst]);

  const isEmpty = prompts.length === 0;
  const isFiltered = searchTerm.length > 0 || visibilityFilter !== 'all' || authorFilter !== 'all';
  const hasResults = filteredPrompts.length > 0;

  return {
    // State
    searchTerm,
    sortBy,
    sortDirection,
    visibilityFilter,
    authorFilter,

    // Setters
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setVisibilityFilter,
    setAuthorFilter,
    toggleSortDirection,

    // Computed
    filteredPrompts,
    hasResults,
    isEmpty,
    isFiltered,
  };
}
