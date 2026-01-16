import { useMemo } from 'react';
import { Library, X } from 'lucide-react';
import { usePublicPrompts } from '@/hooks/usePublicPrompts';
import { usePromptFilters } from '@/hooks/usePromptFilters';
import { useURLFilterSync } from '@/hooks/useURLFilterSync';
import { PromptCard } from '@/components/PromptCard';
import { PromptListView } from '@/components/PromptListView';
import { Button } from '@/components/ui/button';
import type { PublicPrompt } from '@/types/prompt';

export default function PublicLibrary() {
  const { prompts, loading, error } = usePublicPrompts();

  // URL-synced search/sort/author state
  const urlFilters = useURLFilterSync({ debounceMs: 300 });
  const { authorFilter, setAuthorFilter } = urlFilters;

  // Pre-filter by author before passing to usePromptFilters
  const authorFilteredPrompts = useMemo(() => {
    if (!authorFilter) return prompts;
    return prompts.filter(p => p.authorId === authorFilter);
  }, [prompts, authorFilter]);

  const {
    searchTerm,
    sortBy,
    sortDirection,
    setSearchTerm,
    setSortBy,
    toggleSortDirection,
    filteredPrompts,
  } = usePromptFilters({
    prompts: authorFilteredPrompts,
    pinFirst: false, // No pinning in public library
    controlledState: urlFilters,
  });

  // Clear author filter handler
  const clearAuthorFilter = () => {
    setAuthorFilter(null);
  };

  // Get author display name for filter badge
  const getAuthorDisplayName = () => {
    if (!authorFilter) return '';
    const prompt = prompts.find(p => p.authorId === authorFilter);
    return prompt?.author?.displayName || 'Unknown Author';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-destructive">Error loading library: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Public Library</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Discover and save prompts shared by the community
            </p>
          </div>
        </div>

        {/* Author filter badge */}
        {authorFilter && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by author:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAuthorFilter}
              className="flex items-center gap-1"
            >
              {getAuthorDisplayName()}
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Prompt list */}
        <PromptListView
          prompts={filteredPrompts}
          loading={loading}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSearchChange={setSearchTerm}
          onSortByChange={setSortBy}
          onSortDirectionChange={toggleSortDirection}
          renderPromptCard={(prompt: PublicPrompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              to={`/library/prompt/${prompt.id}`}
              source="public"
              author={prompt.author}
              showPinAction={false}
              showStats={true}
              onAuthorClick={() => setAuthorFilter(prompt.authorId)}
            />
          )}
          emptyIcon={<Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />}
          emptyTitle="No public prompts yet"
          emptyDescription="Be the first to share a prompt with the community!"
          noResultsTitle="No prompts found"
          noResultsDescription={
            authorFilter
              ? 'This author has no prompts matching your search'
              : 'Try adjusting your search'
          }
        />
      </div>
    </div>
  );
}
