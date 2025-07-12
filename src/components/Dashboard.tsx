import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { usePrompts } from '@/contexts/PromptsContext';
import { Prompt } from '@/types/prompt';
import { PromptCard } from './PromptCard';
import { EditorModal } from './EditorModal';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { prompts, addPrompt, updatePrompt } = usePrompts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();

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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prompt Vault</h1>
            <p className="text-muted-foreground mt-1">
              Store, manage, and copy your text prompts with ease
            </p>
          </div>
          
          {/* Floating action button */}
          <Button
            onClick={handleCreatePrompt}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-14 w-14 p-0"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Prompts grid */}
        {prompts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                No prompts yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first prompt to get started with the vault
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {prompts.map((prompt, index) => (
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

        {/* Editor Modal */}
        <EditorModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePrompt}
          prompt={editingPrompt}
        />
      </div>
    </div>
  );
}