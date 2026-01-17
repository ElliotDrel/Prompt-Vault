import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrompts } from '@/contexts/PromptsContext';
import { usePromptFilters } from '@/hooks/usePromptFilters';
import { useURLFilterSync } from '@/hooks/useURLFilterSync';
import { PromptCard } from './PromptCard';
import { PromptListView } from './PromptListView';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { prompts, loading, isBackgroundRefresh } = usePrompts();
  const navigate = useNavigate();

  // URL-synced filter state
  const urlFilters = useURLFilterSync({ debounceMs: 300 });

  const {
    searchTerm,
    sortBy,
    sortDirection,
    setSearchTerm,
    setSortBy,
    toggleSortDirection,
    filteredPrompts,
    isEmpty,
  } = usePromptFilters({
    prompts,
    pinFirst: true,
    controlledState: urlFilters,
  });

  const handleCreatePrompt = () => {
    navigate('/dashboard/prompt/new');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Prompts</h1>
            <p className="text-muted-foreground mt-1">
              Store, manage, and copy your text prompts with ease
            </p>
          </div>
        </div>

        {/* Prompt List with search/sort/grid */}
        <PromptListView
          prompts={filteredPrompts}
          loading={loading && !isBackgroundRefresh}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSearchChange={setSearchTerm}
          onSortByChange={setSortBy}
          onSortDirectionChange={toggleSortDirection}
          renderPromptCard={(prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              to={`/dashboard/prompt/${prompt.id}`}
            />
          )}
          emptyTitle="No prompts yet"
          emptyDescription="Create your first prompt to get started with the vault"
          emptyAction={
            <Button
              onClick={handleCreatePrompt}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Prompt
            </Button>
          }
          noResultsTitle="No prompts found"
          noResultsDescription={
            isEmpty
              ? 'Create your first prompt to get started'
              : 'Try adjusting your search or create a new prompt'
          }
          gridClassName="mb-20"
        />

        {/* Floating Create Button - moved to bottom right */}
        <Button
          onClick={handleCreatePrompt}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-14 px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Prompt
        </Button>

      </div>
    </div>
  );
}
