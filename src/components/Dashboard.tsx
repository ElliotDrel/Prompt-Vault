import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import { usePrompts } from '@/contexts/PromptsContext';
import { Prompt } from '@/types/prompt';
import { PromptCard } from './PromptCard';
import { EditorModal } from './EditorModal';
import { StatsCounter } from './StatsCounter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Dashboard() {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastUpdated'>('lastUpdated');

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by pin status first, then by selected criteria
    filtered.sort((a, b) => {
      // Pinned prompts come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by selected criteria
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [prompts, searchTerm, sortBy]);

  const handleCreatePrompt = () => {
    setEditingPrompt(undefined);
    setIsModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'updatedAt'>) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, promptData);
    } else {
      addPrompt(promptData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPrompt(undefined);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Prompt Vault</h1>
              <p className="text-muted-foreground mt-1">
                Store, manage, and copy your text prompts with ease
              </p>
            </div>
            {/* Stats moved to the right of title */}
            <StatsCounter />
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex gap-4 mb-6">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search prompts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(value: 'name' | 'lastUpdated') => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompts grid */}
        {filteredAndSortedPrompts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {prompts.length === 0 ? 'No prompts yet' : 'No prompts found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {prompts.length === 0 
                  ? 'Create your first prompt to get started with the vault'
                  : 'Try adjusting your search or create a new prompt'
                }
              </p>
              <Button
                onClick={handleCreatePrompt}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prompt
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20"
          >
            {filteredAndSortedPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PromptCard
                  prompt={prompt}
                  onClick={() => handleEditPrompt(prompt)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Floating Create Button - moved to bottom right */}
        <Button
          onClick={handleCreatePrompt}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-14 px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Prompt
        </Button>

        {/* Editor Modal */}
        <EditorModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePrompt}
          onDelete={deletePrompt}
          prompt={editingPrompt}
        />
      </div>
    </div>
  );
}