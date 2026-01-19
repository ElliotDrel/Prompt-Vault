import { useEffect } from 'react';
import { Library } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { usePublicPrompts } from '@/hooks/usePublicPrompts';
import { usePromptFilters } from '@/hooks/usePromptFilters';
import { useURLFilterSync } from '@/hooks/useURLFilterSync';
import { PromptCard } from '@/components/PromptCard';
import { PromptListView } from '@/components/PromptListView';
import type { PublicPrompt } from '@/types/prompt';

export default function PublicLibrary() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Public Library - Prompt Vault';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const { prompts, loading, error } = usePublicPrompts();

  // URL-synced search/sort state
  const urlFilters = useURLFilterSync({ debounceMs: 300 });

  const {
    searchTerm,
    sortBy,
    sortDirection,
    setSearchTerm,
    setSortBy,
    toggleSortDirection,
    filteredPrompts,
  } = usePromptFilters({
    prompts,
    pinFirst: false, // No pinning in public library
    controlledState: urlFilters,
  });

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-destructive">Error loading library: {error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Public Library</h1>
              <p className="text-muted-foreground mt-1">
                Discover and save prompts shared by the community
              </p>
            </div>
          </div>

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
                onAuthorClick={() => {
                  // Insert author name into search bar
                  const authorName = prompt.author?.displayName || prompt.authorId;
                  setSearchTerm(authorName);
                }}
              />
            )}
            searchPlaceholder="Search title, content, author..."
            emptyIcon={<Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />}
            emptyTitle="No public prompts yet"
            emptyDescription="Be the first to share a prompt with the community!"
            noResultsTitle="No prompts found"
            noResultsDescription="Try adjusting your search"
          />
        </div>
      </div>
    </AppLayout>
  );
}
