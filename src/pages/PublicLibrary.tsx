import { useEffect } from 'react';
import { Library } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageAdapterContext } from '@/contexts/StorageAdapterContext';
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

  const { user } = useAuth();
  const { adapter } = useStorageAdapterContext();
  const { prompts, loading, error } = usePublicPrompts();

  // URL-synced search/sort state (no DB persistence - Library has no visibility filter UI)
  const urlFilters = useURLFilterSync({
    debounceMs: 300,
    persistToDb: false,
    adapter: adapter?.stats,
  });

  const {
    searchTerm,
    sortBy,
    sortDirection,
    authorFilter,
    setSearchTerm,
    setSortBy,
    toggleSortDirection,
    setAuthorFilter,
    filteredPrompts,
  } = usePromptFilters({
    prompts,
    pinFirst: false, // No pinning in public library
    controlledState: urlFilters,
    userId: user?.id, // For author filtering
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
            authorFilter={authorFilter}
            onAuthorChange={setAuthorFilter}
            showAuthorFilter={true}
            renderPromptCard={(prompt: PublicPrompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                to={`/library/prompt/${prompt.id}`}
                source="public"
                author={prompt.author}
                showPinAction={false}
                showStats={true}
                // Author names are display-only text (no click action)
                // Use Mine/Others filter chips for author filtering (Issue 10 resolved)
              />
            )}
            searchPlaceholder="Search title, content, author..."
            emptyIcon={<Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />}
            emptyTitle="No public prompts yet"
            emptyDescription="Be the first to share a prompt with the community!"
            noResultsTitle="No prompts found"
            noResultsDescription="Try adjusting your search or filters"
          />
        </div>
      </div>
    </AppLayout>
  );
}
