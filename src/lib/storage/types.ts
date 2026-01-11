import { Prompt, CopyEvent, PromptVersion, PaginatedVersions } from '@/types/prompt';

// Storage interface for prompts
export interface PromptsStorageAdapter {
  getPrompts(): Promise<Prompt[]>;
  addPrompt(prompt: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt>;
  updatePrompt(id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;
  togglePinPrompt(id: string): Promise<Prompt>;
  incrementPromptUsage(id: string): Promise<Prompt>;
}

// Pagination result for copy events
export interface PaginatedCopyEvents {
  events: CopyEvent[];
  hasMore: boolean;
  totalCount: number;
}

// Storage interface for copy events
export interface CopyEventsStorageAdapter {
  getCopyEvents(offset?: number, limit?: number): Promise<PaginatedCopyEvents>;
  getCopyEventsByPromptId(promptId: string, offset?: number, limit?: number): Promise<PaginatedCopyEvents>;
  searchCopyEvents(query: string): Promise<CopyEvent[]>;
  addCopyEvent(event: Omit<CopyEvent, 'id' | 'timestamp'>): Promise<CopyEvent>;
  deleteCopyEvent(id: string): Promise<void>;
  clearHistory(): Promise<void>;
}

// Storage interface for stats
export interface StatsStorageAdapter {
  getStats(): Promise<{
    totalPrompts: number;
    totalCopies: number;
    totalPromptUses: number;
    timeSavedMultiplier: number;
  }>;
  incrementCopyCount(): Promise<void>;
}

// Storage interface for versions
export interface VersionsStorageAdapter {
  createVersion(data: {
    promptId: string;
    versionNumber: number;
    title: string;
    body: string;
    variables: string[];
  }): Promise<PromptVersion>;
  getVersions(promptId: string, offset?: number, limit?: number): Promise<PaginatedVersions>;
  consolidateVersions(promptId: string): Promise<number>;
}

// Combined storage interface
export interface StorageAdapter {
  prompts: PromptsStorageAdapter;
  copyEvents: CopyEventsStorageAdapter;
  stats: StatsStorageAdapter;
  versions: VersionsStorageAdapter;

  // Event subscription for real-time updates
  subscribe?: (callback: (type: 'prompts' | 'copyEvents' | 'stats', data?: unknown) => void) => () => void;

  // Check if adapter is ready
  isReady(): Promise<boolean>;

  // Get adapter type
  getType(): 'supabase';
}
