import { useState, useRef, useEffect } from 'react';
import { Filter, ArrowUpAZ, ArrowDownAZ, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SortBy, SortDirection, VisibilityFilter, AuthorFilter } from '@/hooks/usePromptFilters';

// Constants
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'usage', label: 'Usage Count' },
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date Created' },
];

const VISIBILITY_OPTIONS: { value: VisibilityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const AUTHOR_OPTIONS: { value: AuthorFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'mine', label: 'Mine' },
  { value: 'others', label: 'Others' },
];

interface FilterSortControlProps {
  // Visibility filter (Dashboard)
  visibilityFilter?: VisibilityFilter;
  onVisibilityChange?: (v: VisibilityFilter) => void;
  showVisibilityFilter?: boolean;

  // Author filter (Library)
  authorFilter?: AuthorFilter;
  onAuthorChange?: (a: AuthorFilter) => void;
  showAuthorFilter?: boolean;

  // Sorting (always shown)
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSortByChange: (by: SortBy) => void;
  onSortDirectionChange: () => void;
}

export function FilterSortControl({
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
}: FilterSortControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const DirIcon = sortDirection === 'asc' ? ArrowUpAZ : ArrowDownAZ;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Get current filter label
  const getFilterLabel = () => {
    if (showVisibilityFilter && visibilityFilter) {
      return VISIBILITY_OPTIONS.find(o => o.value === visibilityFilter)?.label ?? 'All';
    }
    if (showAuthorFilter && authorFilter) {
      return AUTHOR_OPTIONS.find(o => o.value === authorFilter)?.label ?? 'All';
    }
    return 'All';
  };

  // Get current sort label
  const getSortLabel = () => {
    return SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Last Updated';
  };

  // Get filter options based on mode
  const filterOptions = showVisibilityFilter ? VISIBILITY_OPTIONS : AUTHOR_OPTIONS;
  const currentFilter = showVisibilityFilter ? visibilityFilter : authorFilter;
  const onFilterChange = showVisibilityFilter
    ? (v: string) => onVisibilityChange?.(v as VisibilityFilter)
    : (v: string) => onAuthorChange?.(v as AuthorFilter);

  const showFilter = showVisibilityFilter || showAuthorFilter;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger bar */}
      <div className="flex items-center rounded-md border bg-card shadow-sm">
        <button
          type="button"
          className="flex items-center h-9 hover:bg-muted/50 transition-colors rounded-l-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {showFilter && (
            <span className="flex items-center gap-2 px-3 border-r">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{getFilterLabel()}</span>
            </span>
          )}
          <span className="px-3 text-sm border-r">
            {getSortLabel()}
          </span>
        </button>

        {/* Direction toggle - outside dropdown trigger for direct access */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none rounded-r-md hover:bg-muted/50"
          onClick={onSortDirectionChange}
          title={sortDirection === 'asc' ? 'Switch to Descending' : 'Switch to Ascending'}
        >
          <DirIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Dropdown - pure CSS positioning, no JS calculations */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md"
          role="menu"
        >
          <div className="flex">
            {/* Filter Column - only if filter is enabled */}
            {showFilter && (
              <div className="flex-1 p-2 border-r">
                <div className="px-2 py-1.5 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Filter
                  </span>
                </div>
                <div className="space-y-0.5">
                  {filterOptions.map(({ value, label }) => (
                    <Button
                      key={value}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start h-8 px-2 font-normal',
                        currentFilter === value && 'bg-primary/10 text-primary hover:bg-primary/15'
                      )}
                      onClick={() => onFilterChange(value)}
                    >
                      {label}
                      {currentFilter === value && <Check className="ml-auto h-3.5 w-3.5" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Column */}
            <div className={cn('flex-1 p-2', !showFilter && 'border-l-0')}>
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sort
                </span>
                <button
                  type="button"
                  onClick={onSortDirectionChange}
                  className="p-1.5 -m-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  title={sortDirection === 'asc' ? 'Switch to Descending' : 'Switch to Ascending'}
                >
                  <DirIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start h-8 px-2 font-normal',
                      sortBy === value && 'bg-primary/10 text-primary hover:bg-primary/15'
                    )}
                    onClick={() => onSortByChange(value)}
                  >
                    {label}
                    {sortBy === value && <Check className="ml-auto h-3.5 w-3.5" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
