import { Prompt, CopyEvent, PromptVersion, PaginatedVersions, PublicPrompt } from '@/types/prompt';

// Filter preference types for persisting user filter/sort state
export type VisibilityFilter = 'all' | 'public' | 'private';
export type AuthorFilter = 'all' | 'mine' | 'others';
export type SortBy = 'name' | 'lastUpdated' | 'createdAt' | 'usage';
export type SortDirection = 'asc' | 'desc';

export interface FilterPreferences {
  filterVisibility: VisibilityFilter;
  filterAuthor: AuthorFilter;
  sortBy: SortBy;
  sortDirection: SortDirection;
}

// Optional metadata for prompt updates (e.g., for revert tracking)
export interface UpdatePromptOptions {
  /** Version ID this update is reverting to (for version history tracking) */
  revertedFromVersionId?: string;
}

// Storage interface for prompts
export interface PromptsStorageAdapter {
  getPrompts(): Promise<Prompt[]>;
  getPublicPrompts(): Promise<PublicPrompt[]>;
  getPublicPromptById(promptId: string): Promise<PublicPrompt | null>;
  addPrompt(prompt: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt>;
  updatePrompt(id: string, prompt: Omit<Prompt, 'id' | 'updatedAt'>, options?: UpdatePromptOptions): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;
  togglePinPrompt(id: string): Promise<Prompt>;
  toggleVisibility(id: string): Promise<Prompt>;
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

// Storage interface for stats and filter preferences
export interface StatsStorageAdapter {
  getStats(): Promise<{
    totalPrompts: number;
    totalCopies: number;
    totalPromptUses: number;
    timeSavedMultiplier: number;
  }>;
  incrementCopyCount(): Promise<void>;
  getFilterPreferences(): Promise<FilterPreferences>;
  updateFilterPreferences(prefs: Partial<FilterPreferences>): Promise<void>;
}

// Storage interface for versions
export interface VersionsStorageAdapter {
  createVersion(data: {
    promptId: string;
    versionNumber: number;
    title: string;
    body: string;
    variables: string[];
    revertedFromVersionId?: string;
  }): Promise<PromptVersion>;
  getVersions(promptId: string, offset?: number, limit?: number): Promise<PaginatedVersions>;
}

// Combined storage interface
export interface StorageAdapter {
  prompts: PromptsStorageAdapter;
  copyEvents: CopyEventsStorageAdapter;
  stats: StatsStorageAdapter;
  versions: VersionsStorageAdapter;

  // Event subscription for real-time updates
  subscribe?: (callback: (type: 'prompts' | 'copyEvents' | 'stats' | 'publicPrompts', data?: unknown) => void) => () => void;

  // Check if adapter is ready
  isReady(): Promise<boolean>;

  // Get adapter type
  getType(): 'supabase';
}
