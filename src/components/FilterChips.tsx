import { Button } from '@/components/ui/button';
import { Globe, Lock, User, Users } from 'lucide-react';
import type { VisibilityFilter, AuthorFilter } from '@/lib/storage/types';

interface FilterChipsProps {
  // Visibility filter
  visibilityFilter: VisibilityFilter;
  onVisibilityChange: (v: VisibilityFilter) => void;

  // Author filter (optional - only shown when provided)
  authorFilter?: AuthorFilter;
  onAuthorChange?: (a: AuthorFilter) => void;
  showAuthorFilter?: boolean;
}

// Chip button helper component
function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      size="sm"
      className="rounded-full"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function FilterChips({
  visibilityFilter,
  onVisibilityChange,
  authorFilter,
  onAuthorChange,
  showAuthorFilter = false,
}: FilterChipsProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Visibility filter chips */}
      <div className="flex items-center gap-1.5">
        <ChipButton
          selected={visibilityFilter === 'all'}
          onClick={() => onVisibilityChange('all')}
        >
          All
        </ChipButton>
        <ChipButton
          selected={visibilityFilter === 'public'}
          onClick={() => onVisibilityChange('public')}
        >
          <Globe className="w-3.5 h-3.5 mr-1" />
          Public
        </ChipButton>
        <ChipButton
          selected={visibilityFilter === 'private'}
          onClick={() => onVisibilityChange('private')}
        >
          <Lock className="w-3.5 h-3.5 mr-1" />
          Private
        </ChipButton>
      </div>

      {/* Author filter chips (optional) */}
      {showAuthorFilter && onAuthorChange && authorFilter !== undefined && (
        <>
          {/* Visual separator */}
          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <ChipButton
              selected={authorFilter === 'all'}
              onClick={() => onAuthorChange('all')}
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Everyone
            </ChipButton>
            <ChipButton
              selected={authorFilter === 'mine'}
              onClick={() => onAuthorChange('mine')}
            >
              <User className="w-3.5 h-3.5 mr-1" />
              Mine
            </ChipButton>
            <ChipButton
              selected={authorFilter === 'others'}
              onClick={() => onAuthorChange('others')}
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Others
            </ChipButton>
          </div>
        </>
      )}
    </div>
  );
}
