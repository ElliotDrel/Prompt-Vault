import React, { createContext, useContext, useEffect, useState } from 'react';
import { Prompt } from '@/types/prompt';
import { samplePrompts } from '@/data/samplePrompts';

interface PromptsContextType {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  updatePrompt: (id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  deletePrompt: (id: string) => void;
  togglePinPrompt: (id: string) => void;
  stats: {
    totalPrompts: number;
    totalCopies: number;
    timeSavedMinutes: number;
  };
  incrementCopyCount: () => void;
  incrementPromptUsage: (promptId: string) => void;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

const STORAGE_KEY = 'prompts';
const STATS_KEY = 'promptStats';

function generateId(): string {
  return crypto.randomUUID();
}

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalCopies: 0,
    timeSavedMinutes: 0,
  });

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

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem(STATS_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Failed to load stats from localStorage:', error);
    }
  }, []);

  // Save prompts to localStorage whenever prompts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
      setStats(prev => ({ ...prev, totalPrompts: prompts.length }));
    } catch (error) {
      console.error('Failed to save prompts to localStorage:', error);
    }
  }, [prompts]);

  // Save stats to localStorage whenever stats change
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save stats to localStorage:', error);
    }
  }, [stats]);

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

  const incrementCopyCount = () => {
    setStats(prev => ({
      ...prev,
      totalCopies: prev.totalCopies + 1,
      timeSavedMinutes: prev.timeSavedMinutes + 5,
    }));
  };

  const togglePinPrompt = (id: string) => {
    setPrompts(prev =>
      prev.map(prompt =>
        prompt.id === id
          ? { ...prompt, isPinned: !prompt.isPinned, updatedAt: new Date().toISOString() }
          : prompt
      )
    );
  };

  const incrementPromptUsage = (promptId: string) => {
    setPrompts(prev =>
      prev.map(prompt =>
        prompt.id === promptId
          ? { 
              ...prompt, 
              timesUsed: (prompt.timesUsed || 0) + 1,
              timeSavedMinutes: (prompt.timeSavedMinutes || 0) + 5,
              updatedAt: new Date().toISOString()
            }
          : prompt
      )
    );
  };

  return (
    <PromptsContext.Provider value={{ 
      prompts, 
      addPrompt, 
      updatePrompt, 
      deletePrompt, 
      togglePinPrompt,
      stats, 
      incrementCopyCount,
      incrementPromptUsage
    }}>
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