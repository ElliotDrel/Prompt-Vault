import React from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, FileText, X } from 'lucide-react';
import type { Prompt } from '@/types/prompt';
import type { SortBy, SortDirection, VisibilityFilter, AuthorFilter } from '@/hooks/usePromptFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSortControl } from '@/components/FilterSortControl';

interface PromptListViewProps {
  // Data
  prompts: Prompt[];
  loading?: boolean;

  // Filter state (controlled)
  searchTerm: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSearchChange: (term: string) => void;
  onSortByChange: (by: SortBy) => void;
  onSortDirectionChange: () => void;

  // Visibility filter (Dashboard - for public/private)
  visibilityFilter?: VisibilityFilter;
  onVisibilityChange?: (v: VisibilityFilter) => void;
  showVisibilityFilter?: boolean;

  // Author filter (Library - for mine/others)
  authorFilter?: AuthorFilter;
  onAuthorChange?: (a: AuthorFilter) => void;
  showAuthorFilter?: boolean;

  // Rendering customization
  renderPromptCard: (prompt: Prompt, index: number) => React.ReactNode;

  // Empty state customization
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  // No results customization (when search has no matches)
  noResultsTitle?: string;
  noResultsDescription?: string;

  // Search input customization
  searchPlaceholder?: string;

  // Grid bottom margin (to make room for floating buttons)
  gridClassName?: string;
}

export function PromptListView({
  prompts,
  loading = false,
  searchTerm,
  sortBy,
  sortDirection,
  onSearchChange,
  onSortByChange,
  onSortDirectionChange,
  visibilityFilter,
  onVisibilityChange,
  showVisibilityFilter = false,
  authorFilter,
  onAuthorChange,
  showAuthorFilter = false,
  renderPromptCard,
  emptyIcon,
  emptyTitle = 'No prompts yet',
  emptyDescription = 'Create your first prompt to get started',
  emptyAction,
  noResultsTitle = 'No prompts found',
  noResultsDescription = 'Try adjusting your search or filters',
  searchPlaceholder = 'Search prompts...',
  gridClassName = '',
}: PromptListViewProps) {
  const hasActiveFilters = searchTerm || (visibilityFilter && visibilityFilter !== 'all') || (authorFilter && authorFilter !== 'all');
  const isEmpty = prompts.length === 0 && !hasActiveFilters;
  const noResults = prompts.length === 0 && hasActiveFilters;

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg text-muted-foreground">Loading prompts...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input - Flexible width, capped so it stays a bit smaller */}
        <div className="relative flex-1 min-w-[200px] max-w-3xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Control */}
        <FilterSortControl
          visibilityFilter={visibilityFilter}
          onVisibilityChange={onVisibilityChange}
          showVisibilityFilter={showVisibilityFilter}
          authorFilter={authorFilter}
          onAuthorChange={onAuthorChange}
          showAuthorFilter={showAuthorFilter}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={onSortByChange}
          onSortDirectionChange={onSortDirectionChange}
        />
      </div>

      {/* Empty state (no prompts at all) */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto">
            {emptyIcon || (
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            )}
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {emptyTitle}
            </h3>
            <p className="text-muted-foreground mb-6">{emptyDescription}</p>
            {emptyAction}
          </div>
        </motion.div>
      )}

      {/* No results state (search returned nothing) */}
      {noResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {noResultsTitle}
            </h3>
            <p className="text-muted-foreground mb-6">{noResultsDescription}</p>
            <Button
              variant="outline"
              onClick={() => {
                onSearchChange('');
                if (onVisibilityChange) onVisibilityChange('all');
                if (onAuthorChange) onAuthorChange('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>
      )}

      {/* Prompts grid */}
      {prompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${gridClassName}`}
        >
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {renderPromptCard(prompt, index)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
