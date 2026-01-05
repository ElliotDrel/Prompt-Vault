import { Prompt, CopyEvent } from '@/types/prompt';
import { PromptsStorageAdapter, CopyEventsStorageAdapter, StatsStorageAdapter, StorageAdapter } from './types';
import { samplePrompts } from '@/data/samplePrompts';

const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  COPY_EVENTS: 'copyHistory',
  STATS: 'promptStats',
  USER_SETTINGS: 'userSettings',
} as const;

interface UserSettings {
  timeSavedMultiplier: number;
}

function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultSettings: UserSettings = { timeSavedMultiplier: 5 };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch {
    return { timeSavedMultiplier: 5 };
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

function withPromptDefaults(prompt: Prompt): Prompt {
  return {
    ...prompt,
    isPinned: prompt.isPinned ?? false,
    timesUsed: prompt.timesUsed ?? 0,
  };
}

function hydrateSamplePrompts(): Prompt[] {
  return samplePrompts.map((prompt) => ({
    ...prompt,
    isPinned: prompt.isPinned ?? false,
    timesUsed: prompt.timesUsed ?? 0,
  }));
}

class LocalStoragePromptsAdapter implements PromptsStorageAdapter {
  async getPrompts(): Promise<Prompt[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      if (stored) {
        const parsed: Prompt[] = JSON.parse(stored);
        return parsed.map(withPromptDefaults);
      }

      const initial = hydrateSamplePrompts();
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(initial));
      return initial;
    } catch (error) {
      console.error('Failed to load prompts from localStorage:', error);
      return hydrateSamplePrompts();
    }
  }

  async addPrompt(promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const newPrompt: Prompt = withPromptDefaults({
      ...promptData,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    });

    const updatedPrompts = [newPrompt, ...prompts];
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
    return newPrompt;
  }

  async updatePrompt(id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const existingPrompt = prompts.find((prompt) => prompt.id === id);

    if (!existingPrompt) {
      throw new Error('Prompt not found');
    }

    const updatedPrompt: Prompt = withPromptDefaults({
      ...existingPrompt,
      ...promptData,
      id,
      updatedAt: new Date().toISOString(),
    });

    const updatedPrompts = prompts.map((prompt) =>
      prompt.id === id ? updatedPrompt : prompt,
    );

    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts();
    const updatedPrompts = prompts.filter((prompt) => prompt.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
  }

  async togglePinPrompt(id: string): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const prompt = prompts.find((p) => p.id === id);

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const updatedPrompt: Prompt = {
      ...prompt,
      isPinned: !prompt.isPinned,
      updatedAt: new Date().toISOString(),
    };

    const updatedPrompts = prompts.map((p) =>
      p.id === id ? withPromptDefaults(updatedPrompt) : p,
    );

    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
    return withPromptDefaults(updatedPrompt);
  }

  async incrementPromptUsage(id: string): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const prompt = prompts.find((p) => p.id === id);

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    const updatedPrompt: Prompt = {
      ...prompt,
      timesUsed: (prompt.timesUsed ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };

    const updatedPrompts = prompts.map((p) =>
      p.id === id ? withPromptDefaults(updatedPrompt) : p,
    );

    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
    return withPromptDefaults(updatedPrompt);
  }
}

class LocalStorageCopyEventsAdapter implements CopyEventsStorageAdapter {
  async getCopyEvents(): Promise<CopyEvent[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COPY_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load copy events from localStorage:', error);
      return [];
    }
  }

  async addCopyEvent(eventData: Omit<CopyEvent, 'id' | 'timestamp'>): Promise<CopyEvent> {
    const events = await this.getCopyEvents();
    const newEvent: CopyEvent = {
      ...eventData,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };

    const updatedEvents = [newEvent, ...events];
    localStorage.setItem(STORAGE_KEYS.COPY_EVENTS, JSON.stringify(updatedEvents));
    return newEvent;
  }

  async deleteCopyEvent(id: string): Promise<void> {
    const events = await this.getCopyEvents();
    const updatedEvents = events.filter((event) => event.id !== id);
    localStorage.setItem(STORAGE_KEYS.COPY_EVENTS, JSON.stringify(updatedEvents));
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.COPY_EVENTS);
  }
}

class LocalStorageStatsAdapter implements StatsStorageAdapter {
  async getStats(): Promise<{ totalPrompts: number; totalCopies: number; totalPromptUses: number; timeSavedMultiplier: number }> {
    try {
      const prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]') as Prompt[];
      const copyEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.COPY_EVENTS) || '[]') as CopyEvent[];
      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      const baseStats = storedStats ? JSON.parse(storedStats) : { totalCopies: 0 };
      const settings = getUserSettings();

      const totalPromptUses = prompts.reduce((sum, p) => sum + (p.timesUsed ?? 0), 0);

      return {
        totalPrompts: prompts.length,
        totalCopies: Math.max(baseStats.totalCopies, copyEvents.length),
        totalPromptUses,
        timeSavedMultiplier: settings.timeSavedMultiplier,
      };
    } catch (error) {
      console.error('Failed to load stats from localStorage:', error);
      return {
        totalPrompts: 0,
        totalCopies: 0,
        totalPromptUses: 0,
        timeSavedMultiplier: 5,
      };
    }
  }

  async incrementCopyCount(): Promise<void> {
    const currentStats = await this.getStats();
    const updatedStats = {
      totalCopies: currentStats.totalCopies + 1,
    };
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  public prompts: PromptsStorageAdapter;
  public copyEvents: CopyEventsStorageAdapter;
  public stats: StatsStorageAdapter;

  constructor() {
    this.prompts = new LocalStoragePromptsAdapter();
    this.copyEvents = new LocalStorageCopyEventsAdapter();
    this.stats = new LocalStorageStatsAdapter();
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  getType(): 'localStorage' | 'supabase' {
    return 'localStorage';
  }

  subscribe(_callback: (type: 'prompts' | 'copyEvents' | 'stats', data?: unknown) => void): () => void {
    return () => {};
  }
}
