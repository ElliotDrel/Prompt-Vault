import React, { createContext, useContext, useEffect, useState } from 'react';
import { Prompt } from '@/types/prompt';
import { samplePrompts } from '@/data/samplePrompts';

interface PromptsContextType {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  updatePrompt: (id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  deletePrompt: (id: string) => void;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

const STORAGE_KEY = 'prompts';

function generateId(): string {
  return crypto.randomUUID();
}

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Load prompts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPrompts = JSON.parse(stored);
        setPrompts(parsedPrompts);
      } else {
        // If no stored prompts, initialize with sample prompts
        setPrompts(samplePrompts);
      }
    } catch (error) {
      console.error('Failed to load prompts from localStorage:', error);
      // Fallback to sample prompts if localStorage fails
      setPrompts(samplePrompts);
    }
  }, []);

  // Save prompts to localStorage whenever prompts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (error) {
      console.error('Failed to save prompts to localStorage:', error);
    }
  }, [prompts]);

  const addPrompt = (promptData: Omit<Prompt, 'id' | 'updatedAt'>) => {
    const newPrompt: Prompt = {
      ...promptData,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const updatePrompt = (id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>) => {
    setPrompts(prev =>
      prev.map(prompt =>
        prompt.id === id
          ? { ...promptData, id, updatedAt: new Date().toISOString() }
          : prompt
      )
    );
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
  };

  return (
    <PromptsContext.Provider value={{ prompts, addPrompt, updatePrompt, deletePrompt }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}