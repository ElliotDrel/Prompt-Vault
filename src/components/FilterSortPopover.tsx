import { useState } from 'react';
import { Filter, Check, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { VisibilityFilter, AuthorFilter } from '@/lib/storage/types';
import type { SortBy, SortDirection } from '@/hooks/useURLFilterSync';

interface FilterSortPopoverProps {
  // Visibility filter (Dashboard only - for public/private filtering)
  visibilityFilter?: VisibilityFilter;
  onVisibilityChange?: (v: VisibilityFilter) => void;
  showVisibilityFilter?: boolean;

  // Author filter (Library only - for mine/others filtering)
  authorFilter?: AuthorFilter;
  onAuthorChange?: (a: AuthorFilter) => void;
  showAuthorFilter?: boolean;

  // Sort options (both pages)
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSortByChange: (by: SortBy) => void;
  onSortDirectionChange: () => void;
}

// Visibility filter options for Dashboard
const VISIBILITY_OPTIONS: { value: VisibilityFilter; label: string }[] = [
  { value: 'all', label: 'All Prompts' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'My Prompts' }, // "Private" renamed to "My Prompts"
];

// Author filter options for Library
const AUTHOR_OPTIONS: { value: AuthorFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'mine', label: 'My Prompts' },
  { value: 'others', label: 'Others' },
];

// Sort options
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'name', label: 'Name' },
  { value: 'usage', label: 'Usage' },
  { value: 'createdAt', label: 'Created' },
];

export function FilterSortPopover({
  visibilityFilter,
  onVisibilityChange,
  showVisibilityFilter = false,
  authorFilter,
  onAuthorChange,
  showAuthorFilter = false,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
}: FilterSortPopoverProps) {
  const [open, setOpen] = useState(false);

  // Determine active filter labels for the trigger button
  const activeFilters: string[] = [];

  if (showVisibilityFilter && visibilityFilter && visibilityFilter !== 'all') {
    const option = VISIBILITY_OPTIONS.find((o) => o.value === visibilityFilter);
    if (option) activeFilters.push(option.label);
  }

  if (showAuthorFilter && authorFilter && authorFilter !== 'all') {
    const option = AUTHOR_OPTIONS.find((o) => o.value === authorFilter);
    if (option) activeFilters.push(option.label);
  }

  // Get current sort label
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Last Updated';

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters ? (
            <span className="flex items-center gap-1">
              {activeFilters.join(', ')}
            </span>
          ) : (
            <span>Filter & Sort</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 space-y-4">
          {/* Visibility Filter Section (Dashboard) */}
          {showVisibilityFilter && onVisibilityChange && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Show
              </h4>
              <div className="space-y-1">
                {VISIBILITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onVisibilityChange(option.value);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                      visibilityFilter === option.value
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{option.label}</span>
                    {visibilityFilter === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Author Filter Section (Library) */}
          {showAuthorFilter && onAuthorChange && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Show
              </h4>
              <div className="space-y-1">
                {AUTHOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onAuthorChange(option.value);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                      authorFilter === option.value
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{option.label}</span>
                    {authorFilter === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Sort by
            </h4>
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      onSortDirectionChange();
                    } else {
                      onSortByChange(option.value);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
                    sortBy === option.value
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Direction Toggle */}
          <div className="pt-2 border-t">
            <button
              onClick={onSortDirectionChange}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Order: {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
              </span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
