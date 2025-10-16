import { Prompt, CopyEvent } from '@/types/prompt';
import { PromptsStorageAdapter, CopyEventsStorageAdapter, StatsStorageAdapter, StorageAdapter } from './types';
import { supabase, getCurrentUserId } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

type PromptRow = {
  id: string;
  title: string;
  body: string;
  variables: unknown;
  updated_at: string;
  is_pinned: boolean | null;
  times_used: number | null;
  time_saved_minutes: number | null;
};

type CopyEventRow = {
  id: string;
  prompt_id: string | null;
  prompt_title: string;
  variable_values: Record<string, string> | null;
  copied_text: string;
  created_at: string;
};

const mapPromptRow = (row: PromptRow): Prompt => ({
  id: row.id,
  title: row.title,
  body: row.body,
  variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
  updatedAt: row.updated_at,
  isPinned: row.is_pinned ?? false,
  timesUsed: row.times_used ?? 0,
  timeSavedMinutes: row.time_saved_minutes ?? 0,
});

const mapCopyEventRow = (row: CopyEventRow): CopyEvent => ({
  id: row.id,
  promptId: row.prompt_id ?? '',
  promptTitle: row.prompt_title,
  variableValues: row.variable_values ?? {},
  copiedText: row.copied_text,
  timestamp: row.created_at,
});

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

async function fetchPromptRowById(userId: string, promptId: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch prompt: ${error.message}`);
  }

  return data as PromptRow;
}

class SupabasePromptsAdapter implements PromptsStorageAdapter {
  async getPrompts(): Promise<Prompt[]> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    return (data as PromptRow[]).map(mapPromptRow);
  }

  async addPrompt(promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> {
    const userId = await requireUserId();

    const insertPayload = {
      user_id: userId,
      title: promptData.title,
      body: promptData.body,
      variables: promptData.variables ?? [],
      is_pinned: promptData.isPinned ?? false,
      times_used: promptData.timesUsed ?? 0,
      time_saved_minutes: promptData.timeSavedMinutes ?? 0,
    };

    const { data, error } = await supabase
      .from('prompts')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add prompt: ${error.message}`);
    }

    return mapPromptRow(data as PromptRow);
  }

  async updatePrompt(id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>): Promise<Prompt> {
    const userId = await requireUserId();

    const updates: Record<string, unknown> = {
      title: promptData.title,
      body: promptData.body,
      variables: promptData.variables ?? [],
    };

    if (typeof promptData.isPinned === 'boolean') {
      updates.is_pinned = promptData.isPinned;
    }
    if (typeof promptData.timesUsed === 'number') {
      updates.times_used = promptData.timesUsed;
    }
    if (typeof promptData.timeSavedMinutes === 'number') {
      updates.time_saved_minutes = promptData.timeSavedMinutes;
    }

    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    return mapPromptRow(data as PromptRow);
  }

  async deletePrompt(id: string): Promise<void> {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }
  }

  async togglePinPrompt(id: string): Promise<Prompt> {
    const userId = await requireUserId();
    const currentPrompt = await fetchPromptRowById(userId, id);

    const { data, error } = await supabase
      .from('prompts')
      .update({ is_pinned: !currentPrompt.is_pinned })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle pin: ${error.message}`);
    }

    return mapPromptRow(data as PromptRow);
  }

  async incrementPromptUsage(id: string): Promise<Prompt> {
    const userId = await requireUserId();
    const currentPrompt = await fetchPromptRowById(userId, id);

    const updatedUsage = {
      times_used: (currentPrompt.times_used ?? 0) + 1,
      time_saved_minutes: (currentPrompt.time_saved_minutes ?? 0) + 5,
    };

    const { data, error } = await supabase
      .from('prompts')
      .update(updatedUsage)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }

    return mapPromptRow(data as PromptRow);
  }
}

class SupabaseCopyEventsAdapter implements CopyEventsStorageAdapter {
  async getCopyEvents(): Promise<CopyEvent[]> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('copy_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch copy events: ${error.message}`);
    }

    return (data as CopyEventRow[]).map(mapCopyEventRow);
  }

  async addCopyEvent(eventData: Omit<CopyEvent, 'id' | 'timestamp'>): Promise<CopyEvent> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('copy_events')
      .insert({
        user_id: userId,
        prompt_id: eventData.promptId || null,
        prompt_title: eventData.promptTitle,
        variable_values: eventData.variableValues ?? {},
        copied_text: eventData.copiedText,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add copy event: ${error.message}`);
    }

    return mapCopyEventRow(data as CopyEventRow);
  }

  async deleteCopyEvent(id: string): Promise<void> {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('copy_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete copy event: ${error.message}`);
    }
  }

  async clearHistory(): Promise<void> {
    const userId = await requireUserId();

    const { error } = await supabase
      .from('copy_events')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to clear history: ${error.message}`);
    }
  }
}

class SupabaseStatsAdapter implements StatsStorageAdapter {
  async getStats(): Promise<{ totalPrompts: number; totalCopies: number; timeSavedMinutes: number }> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('prompt_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          totalPrompts: 0,
          totalCopies: 0,
          timeSavedMinutes: 0,
        };
      }
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    return {
      totalPrompts: (data?.total_prompts as number | null) ?? 0,
      totalCopies: (data?.total_copies as number | null) ?? 0,
      timeSavedMinutes: (data?.time_saved_minutes as number | null) ?? 0,
    };
  }

  async incrementCopyCount(): Promise<void> {
    // Stats view is computed dynamically; no-op required for Supabase implementation.
  }
}

export class SupabaseAdapter implements StorageAdapter {
  public prompts: PromptsStorageAdapter;
  public copyEvents: CopyEventsStorageAdapter;
  public stats: StatsStorageAdapter;
  private channel: RealtimeChannel | null = null;

  constructor() {
    this.prompts = new SupabasePromptsAdapter();
    this.copyEvents = new SupabaseCopyEventsAdapter();
    this.stats = new SupabaseStatsAdapter();
  }

  async isReady(): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      return !!userId;
    } catch {
      return false;
    }
  }

  getType(): 'localStorage' | 'supabase' {
    return 'supabase';
  }

  subscribe(callback: (type: 'prompts' | 'copyEvents' | 'stats', data?: unknown) => void): () => void {
    const setupSubscription = async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        return;
      }

      if (this.channel) {
        await this.channel.unsubscribe();
        this.channel = null;
      }

      const channel = supabase
        .channel('prompt_vault_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'prompts',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          callback('prompts', payload);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'copy_events',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          callback('copyEvents', payload);
        });

      this.channel = channel;

      // Subscribe with status callback to ensure connection establishes
      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error:', err);
          console.error('Channel state:', channel);
        }
        if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime subscription timed out');
        }
        if (status === 'CLOSED') {
          console.warn('🔌 Realtime subscription closed');
        }
      });
    };

    setupSubscription().catch((err) => {
      console.error('Failed to initialise supabase subscriptions:', err);
    });

    return () => {
      if (this.channel) {
        this.channel.unsubscribe().catch((err) => {
          console.error('Failed to unsubscribe from Supabase channel:', err);
        });
        this.channel = null;
      }
    };
  }
}
