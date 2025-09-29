import { Prompt, CopyEvent } from '@/types/prompt';

// Storage interface for prompts
export interface PromptsStorageAdapter {
  getPrompts(): Promise<Prompt[]>;
  addPrompt(prompt: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt>;
  updatePrompt(id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;
  togglePinPrompt(id: string): Promise<Prompt>;
  incrementPromptUsage(id: string): Promise<Prompt>;
}

// Storage interface for copy events
export interface CopyEventsStorageAdapter {
  getCopyEvents(): Promise<CopyEvent[]>;
  addCopyEvent(event: Omit<CopyEvent, 'id' | 'timestamp'>): Promise<CopyEvent>;
  deleteCopyEvent(id: string): Promise<void>;
  clearHistory(): Promise<void>;
}

// Storage interface for stats
export interface StatsStorageAdapter {
  getStats(): Promise<{
    totalPrompts: number;
    totalCopies: number;
    timeSavedMinutes: number;
  }>;
  incrementCopyCount(): Promise<void>;
}

// Combined storage interface
export interface StorageAdapter {
  prompts: PromptsStorageAdapter;
  copyEvents: CopyEventsStorageAdapter;
  stats: StatsStorageAdapter;

  // Event subscription for real-time updates
  subscribe?: (callback: (type: 'prompts' | 'copyEvents' | 'stats', data?: unknown) => void) => () => void;

  // Check if adapter is ready
  isReady(): Promise<boolean>;

  // Get adapter type
  getType(): 'localStorage' | 'supabase';
}