import { useState } from 'react';
import { 
  ListFilter, 
  Check, 
  ArrowUpAZ, 
  ArrowDownAZ, 
  Clock, 
  BarChart2, 
  CalendarDays,
  Type,
  Layers,
  Globe,
  Lock,
  User,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
const VISIBILITY_OPTIONS: { value: VisibilityFilter; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'private', label: 'My Prompts', icon: Lock },
];

// Author filter options for Library
const AUTHOR_OPTIONS: { value: AuthorFilter; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Users },
  { value: 'mine', label: 'Mine', icon: User },
  { value: 'others', label: 'Others', icon: Globe },
];

// Sort options
const SORT_OPTIONS: { value: SortBy; label: string; icon: React.ElementType }[] = [
  { value: 'lastUpdated', label: 'Last Updated', icon: Clock },
  { value: 'name', label: 'Name', icon: Type },
  { value: 'usage', label: 'Usage Count', icon: BarChart2 },
  { value: 'createdAt', label: 'Date Created', icon: CalendarDays },
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

  // Helper to get sort direction label
  const getSortDirectionLabel = () => {
    switch (sortBy) {
      case 'name':
        return sortDirection === 'asc' ? 'A to Z' : 'Z to A';
      case 'usage':
        return sortDirection === 'desc' ? 'Highest First' : 'Lowest First';
      case 'lastUpdated':
      case 'createdAt':
      default:
        return sortDirection === 'desc' ? 'Newest First' : 'Oldest First';
    }
  };

  // Check if any non-default filters are active
  const isVisibilityActive = showVisibilityFilter && visibilityFilter && visibilityFilter !== 'all';
  const isAuthorActive = showAuthorFilter && authorFilter && authorFilter !== 'all';
  const isFilterActive = isVisibilityActive || isAuthorActive;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isFilterActive ? "default" : "outline"}
          className={cn(
            "h-10 gap-2 pl-3 pr-4",
            isFilterActive && "shadow-sm"
          )}
        >
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span className="text-sm font-medium">
              View Options
            </span>
          </div>
          {isFilterActive && (
             <Badge 
               variant="secondary" 
               className="ml-1 h-5 px-1.5 text-[10px] font-medium bg-white/20 text-white hover:bg-white/30 border-0"
             >
               Active
             </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm">View Settings</h4>
          {isFilterActive && (
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
               onClick={() => {
                 if (onVisibilityChange) onVisibilityChange('all');
                 if (onAuthorChange) onAuthorChange('all');
               }}
             >
               Reset
             </Button>
          )}
        </div>

        {/* Visibility Filter (Dashboard) */}
        {showVisibilityFilter && onVisibilityChange && visibilityFilter && (
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-muted-foreground">
              Filter By
            </label>
            <ToggleGroup 
              type="single" 
              value={visibilityFilter} 
              onValueChange={(val) => val && onVisibilityChange(val as VisibilityFilter)}
              className="justify-start w-full bg-muted p-1 rounded-md"
            >
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <ToggleGroupItem 
                    key={option.value} 
                    value={option.value}
                    className="flex-1 gap-2 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground text-muted-foreground hover:text-foreground"
                    size="sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>
        )}

        {/* Author Filter (Library) */}
        {showAuthorFilter && onAuthorChange && authorFilter && (
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-muted-foreground">
              Filter By
            </label>
            <ToggleGroup 
              type="single" 
              value={authorFilter} 
              onValueChange={(val) => val && onAuthorChange(val as AuthorFilter)}
              className="justify-start w-full bg-muted p-1 rounded-md"
            >
              {AUTHOR_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <ToggleGroupItem 
                    key={option.value} 
                    value={option.value}
                    className="flex-1 gap-2 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:text-foreground text-muted-foreground hover:text-foreground"
                    size="sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>
        )}

        {(showVisibilityFilter || showAuthorFilter) && <Separator className="my-4" />}

        {/* Sort Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Sort By
            </label>
            
            {/* Sort Direction Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSortDirectionChange}
              className="h-6 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              {sortDirection === 'desc' ? (
                <ArrowDownAZ className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpAZ className="h-3.5 w-3.5" />
              )}
              {getSortDirectionLabel()}
            </Button>
          </div>

          <div className="grid gap-1">
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.value;
              
              return (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => onSortByChange(option.value)}
                  className={cn(
                    "w-full justify-start h-auto py-2 px-3 text-sm font-normal",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={cn("h-4 w-4", isActive ? "text-accent-foreground" : "text-muted-foreground")} />
                    <span>{option.label}</span>
                  </div>
                  
                  {isActive && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
