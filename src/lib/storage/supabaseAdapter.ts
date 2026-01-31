import { Prompt, CopyEvent, PromptVersion, PaginatedVersions, PublicPrompt } from '@/types/prompt';
import { PromptsStorageAdapter, CopyEventsStorageAdapter, StatsStorageAdapter, VersionsStorageAdapter, StorageAdapter, PaginatedCopyEvents, UpdatePromptOptions, FilterPreferences, VisibilityFilter, AuthorFilter, SortBy, SortDirection } from './types';
import { supabase, getCurrentUserId } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-generated';
import { COPY_HISTORY_SEARCH_LIMIT } from '@/config/copyHistory';

type PromptRow = {
  id: string;
  title: string;
  body: string;
  variables: unknown;
  created_at: string;
  updated_at: string;
  is_pinned: boolean | null;
  times_used: number | null;
  visibility: Database["public"]["Enums"]["prompt_visibility"];
};

type PublicPromptRow = PromptRow & {
  user_id: string;
};

type CopyEventRow = {
  id: string;
  prompt_id: string | null;
  prompt_title: string;
  variable_values: Record<string, string> | null;
  copied_text: string;
  created_at: string;
  source_copy_event_id: string | null;
};

type VersionRow = {
  id: string;
  prompt_id: string;
  user_id: string;
  version_number: number;
  title: string;
  body: string;
  variables: unknown;
  reverted_from_version_id: string | null;
  created_at: string;
};

// 🚨 IMPORTANT: See CLAUDE.md "Supabase Broadcast Channel Gotcha" for critical details!
// supabase.channel(name) REUSES existing instances - calling removeChannel() on a channel
// that's also used for persistent subscriptions will CLOSE those subscriptions!
// Solution: Check channel.state === 'joined' before removing (see broadcastPublicPromptChange).

const mapPromptRow = (row: PromptRow): Prompt => ({
  id: row.id,
  title: row.title,
  body: row.body,
  variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  isPinned: row.is_pinned ?? false,
  timesUsed: row.times_used ?? 0,
  visibility: row.visibility ?? 'private',
});

const mapPublicPromptRow = (row: PublicPromptRow): PublicPrompt => ({
  id: row.id,
  title: row.title,
  body: row.body,
  variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  isPinned: row.is_pinned ?? false,
  timesUsed: row.times_used ?? 0,
  visibility: 'public',
  authorId: row.user_id,
  author: {
    userId: row.user_id,
    displayName: undefined, // No user profile system yet; UI will use truncated userId as fallback
  },
});

const mapCopyEventRow = (row: CopyEventRow): CopyEvent => ({
  id: row.id,
  promptId: row.prompt_id ?? '',
  promptTitle: row.prompt_title,
  variableValues: row.variable_values ?? {},
  copiedText: row.copied_text,
  timestamp: row.created_at,
  sourceCopyEventId: row.source_copy_event_id,
});

const mapVersionRow = (row: VersionRow): PromptVersion => ({
  id: row.id,
  promptId: row.prompt_id,
  userId: row.user_id,
  versionNumber: row.version_number,
  title: row.title,
  body: row.body,
  variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
  revertedFromVersionId: row.reverted_from_version_id,
  createdAt: row.created_at,
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
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch prompt: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Prompt not found or you don't have permission to access it`);
  }

  return data as PromptRow;
}

function hasContentChanges(oldPrompt: Prompt, newData: Omit<Prompt, 'id' | 'updatedAt'>): boolean {
  return (
    oldPrompt.title !== newData.title ||
    oldPrompt.body !== newData.body ||
    JSON.stringify(oldPrompt.variables) !== JSON.stringify(newData.variables)
  );
}

/**
 * Broadcast a notification that a public prompt has changed.
 * This notifies all users viewing the Library page to refresh their data.
 * Uses Supabase Broadcast for client-to-client messaging (bypasses RLS).
 *
 * 🚨 CRITICAL: See CLAUDE.md "Supabase Broadcast Channel Gotcha" for why this is implemented this way!
 *
 * Implementation: Reuses existing subscription channel if available.
 * - supabase.channel(name) REUSES existing instances by name
 * - If channel.state === 'joined' (persistent subscription), just send without removing
 * - If channel is newly created (not subscribed), remove after sending to prevent accumulation
 * - Calling removeChannel() on a 'joined' channel would CLOSE the persistent subscription!
 * - Non-blocking: failures are logged but don't break the main operation
 */
async function broadcastPublicPromptChange(): Promise<void> {
  try {
    const channel = supabase.channel('public_prompts_broadcast');

    // Check if this channel is already being used for persistent subscription
    // A subscribed channel will have 'joined' state; a new channel won't
    const isExistingSubscription = channel.state === 'joined';

    await channel.send({
      type: 'broadcast',
      event: 'public_prompt_changed',
      payload: {},
    });

    // Only remove if this was a newly created channel (not the persistent subscription)
    // Removing a persistent subscription would cause reconnection churn
    if (!isExistingSubscription) {
      await supabase.removeChannel(channel);
    }
  } catch (err) {
    // Non-critical: broadcast failure shouldn't break the main operation
    console.error('Failed to broadcast public prompt change:', err);
  }
}

class SupabasePromptsAdapter implements PromptsStorageAdapter {
  private versionsAdapter: SupabaseVersionsAdapter;

  constructor(versionsAdapter: SupabaseVersionsAdapter) {
    this.versionsAdapter = versionsAdapter;
  }

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

  async getPublicPrompts(): Promise<PublicPrompt[]> {
    // Requires authentication - RLS policy allows reading public prompts for any authenticated user
    await requireUserId();

    const { data, error } = await supabase
      .from('prompts')
      .select('id, user_id, title, body, variables, updated_at, is_pinned, times_used, visibility')
      .eq('visibility', 'public')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public prompts: ${error.message}`);
    }

    return (data as PublicPromptRow[]).map(mapPublicPromptRow);
  }

  async getPublicPromptById(promptId: string): Promise<PublicPrompt | null> {
    // Requires authentication - RLS policy allows reading public prompts for any authenticated user
    await requireUserId();

    const { data, error } = await supabase
      .from('prompts')
      .select('id, user_id, title, body, variables, created_at, updated_at, is_pinned, times_used, visibility')
      .eq('id', promptId)
      .eq('visibility', 'public')  // CRITICAL: Only fetch if public
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch public prompt: ${error.message}`);
    }

    // Return null for both "not found" AND "not public" (security - don't reveal existence)
    if (!data) {
      return null;
    }

    return mapPublicPromptRow(data as PublicPromptRow);
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
      visibility: promptData.visibility ?? 'private',
    };

    const { data, error } = await supabase
      .from('prompts')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add prompt: ${error.message}`);
    }

    const createdPrompt = mapPromptRow(data as PromptRow);

    // Create version 1 snapshot (initial state)
    try {
      await this.versionsAdapter.createVersion({
        promptId: createdPrompt.id,
        versionNumber: 1,
        title: createdPrompt.title,
        body: createdPrompt.body,
        variables: createdPrompt.variables,
      });
    } catch (versionError) {
      // Log but don't fail prompt creation
      console.error('Failed to create initial version:', versionError);
    }

    // Broadcast if prompt is created as public so Library viewers see it
    if (createdPrompt.visibility === 'public') {
      void broadcastPublicPromptChange();
    }

    return createdPrompt;
  }

  async updatePrompt(id: string, promptData: Omit<Prompt, 'id' | 'updatedAt'>, options?: UpdatePromptOptions): Promise<Prompt> {
    const userId = await requireUserId();

    // Fetch current prompt state to check for content changes
    const oldPromptRow = await fetchPromptRowById(userId, id);
    const oldPrompt = mapPromptRow(oldPromptRow);

    // Check if content changed (title, body, or variables)
    const contentChanged = hasContentChanges(oldPrompt, promptData);

    // Prepare next version number BEFORE update (to avoid race conditions)
    // but only create the version AFTER successful update
    let nextVersion: number | null = null;
    if (contentChanged) {
      try {
        // Get current max version number
        const { data: versionsData } = await supabase
          .rpc('get_prompt_versions', {
            prompt_id: id,
            offset_count: 0,
            limit_count: 1,
          });

        const maxVersion = versionsData?.versions?.[0]?.version_number ?? 0;
        nextVersion = maxVersion + 1;
      } catch (versionError) {
        console.error('Failed to get version number:', versionError);
        // Continue with update even if versioning fails
      }
    }

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

    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Prompt not found or you don't have permission to update it`);
    }

    const updatedPrompt = mapPromptRow(data as PromptRow);

    // Create version snapshot AFTER successful update
    // Version N = content AFTER the Nth save (not before)
    if (contentChanged && nextVersion !== null) {
      try {
        await this.versionsAdapter.createVersion({
          promptId: id,
          versionNumber: nextVersion,
          title: promptData.title,
          body: promptData.body,
          variables: promptData.variables ?? [],
          revertedFromVersionId: options?.revertedFromVersionId,
        });
      } catch (versionError) {
        console.error('Failed to create version snapshot:', versionError);
        // Update succeeded, so return the updated prompt even if versioning fails
      }
    }

    // Broadcast if prompt is public so Library viewers see the update
    if (updatedPrompt.visibility === 'public') {
      void broadcastPublicPromptChange();
    }

    return updatedPrompt;
  }

  async deletePrompt(id: string): Promise<void> {
    const userId = await requireUserId();

    // Fetch prompt before deletion to check if it's public
    const promptRow = await fetchPromptRowById(userId, id);
    const wasPublic = promptRow.visibility === 'public';

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }

    // Broadcast if deleted prompt was public so Library viewers see it removed
    if (wasPublic) {
      void broadcastPublicPromptChange();
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
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to toggle pin: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Prompt not found or you don't have permission to toggle pin`);
    }

    return mapPromptRow(data as PromptRow);
  }

  async toggleVisibility(id: string): Promise<Prompt> {
    const userId = await requireUserId();
    const currentPrompt = await fetchPromptRowById(userId, id);
    const newVisibility = currentPrompt.visibility === 'public' ? 'private' : 'public';

    const { data, error } = await supabase
      .from('prompts')
      .update({ visibility: newVisibility })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to toggle visibility: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Prompt not found or you don't have permission to toggle visibility`);
    }

    // Broadcast to notify all Library page viewers
    // Handles both private→public (new prompt appears) and public→private (prompt disappears)
    void broadcastPublicPromptChange();

    return mapPromptRow(data as PromptRow);
  }

  async incrementPromptUsage(id: string): Promise<Prompt> {
    await requireUserId();

    // Use atomic RPC function instead of read-then-write pattern
    // This reduces 2 DB roundtrips to 1 and prevents race conditions
    const { data, error } = await supabase
      .rpc('increment_prompt_usage', {
        p_id: id,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Prompt not found or you don't have permission to increment usage`);
    }

    const updatedPrompt = mapPromptRow(data as PromptRow);

    // Broadcast if prompt is public so Library viewers see updated usage count
    if (updatedPrompt.visibility === 'public') {
      void broadcastPublicPromptChange();
    }

    return updatedPrompt;
  }
}

class SupabaseCopyEventsAdapter implements CopyEventsStorageAdapter {
  async getCopyEvents(offset: number = 0, limit: number = 25): Promise<PaginatedCopyEvents> {
    const userId = await requireUserId();

    // First query: Get total count (lightweight head-only request)
    const { count, error: countError } = await supabase
      .from('copy_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw new Error(`Failed to fetch copy events count: ${countError.message}`);
    }

    const totalCount = count ?? 0;

    // Second query: Get paginated data
    const { data, error } = await supabase
      .from('copy_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch copy events: ${error.message}`);
    }

    const events = (data as CopyEventRow[]).map(mapCopyEventRow);
    const hasMore = offset + events.length < totalCount;

    return {
      events,
      hasMore,
      totalCount,
    };
  }

  async getCopyEventsByPromptId(promptId: string, offset: number = 0, limit: number = 10): Promise<PaginatedCopyEvents> {
    const userId = await requireUserId();

    // First query: Get total count for this specific prompt
    const { count, error: countError } = await supabase
      .from('copy_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('prompt_id', promptId);

    if (countError) {
      throw new Error(`Failed to fetch copy events count for prompt: ${countError.message}`);
    }

    const totalCount = count ?? 0;

    // Second query: Get paginated data for this specific prompt
    const { data, error } = await supabase
      .from('copy_events')
      .select('*')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch copy events for prompt: ${error.message}`);
    }

    const events = (data as CopyEventRow[]).map(mapCopyEventRow);
    const hasMore = offset + events.length < totalCount;

    return {
      events,
      hasMore,
      totalCount,
    };
  }

  async searchCopyEvents(query: string): Promise<CopyEvent[]> {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .rpc('search_copy_events', {
        search_query: query,
        result_limit: COPY_HISTORY_SEARCH_LIMIT,
      });

    if (error) {
      throw new Error(`Failed to search copy events: ${error.message}`);
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
        source_copy_event_id: eventData.sourceCopyEventId ?? null,
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
  async getStats(): Promise<{ totalPrompts: number; totalCopies: number; totalPromptUses: number; timeSavedMultiplier: number }> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('prompt_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    if (!data) {
      // New user with no stats yet
      return {
        totalPrompts: 0,
        totalCopies: 0,
        totalPromptUses: 0,
        timeSavedMultiplier: 5,
      };
    }

    return {
      totalPrompts: (data?.total_prompts as number | null) ?? 0,
      totalCopies: (data?.total_copies as number | null) ?? 0,
      totalPromptUses: (data?.total_prompt_uses as number | null) ?? 0,
      timeSavedMultiplier: (data?.time_saved_multiplier as number | null) ?? 5,
    };
  }

  async incrementCopyCount(): Promise<void> {
    // Stats view is computed dynamically; no-op required for Supabase implementation.
  }

  async getFilterPreferences(): Promise<FilterPreferences> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('user_settings')
      .select('filter_visibility, filter_author, sort_by, sort_direction')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch filter preferences: ${error.message}`);
    }

    // Return defaults if no settings row exists (new user)
    if (!data) {
      return {
        filterVisibility: 'all',
        filterAuthor: 'all',
        sortBy: 'lastUpdated',
        sortDirection: 'desc',
      };
    }

    return {
      filterVisibility: (data.filter_visibility as VisibilityFilter) ?? 'all',
      filterAuthor: (data.filter_author as AuthorFilter) ?? 'all',
      sortBy: (data.sort_by as SortBy) ?? 'lastUpdated',
      sortDirection: (data.sort_direction as SortDirection) ?? 'desc',
    };
  }

  async updateFilterPreferences(prefs: Partial<FilterPreferences>): Promise<void> {
    const userId = await requireUserId();

    // Build update object with only the fields that are being changed
    const updates: Record<string, unknown> = {};
    if (prefs.filterVisibility !== undefined) {
      updates.filter_visibility = prefs.filterVisibility;
    }
    if (prefs.filterAuthor !== undefined) {
      updates.filter_author = prefs.filterAuthor;
    }
    if (prefs.sortBy !== undefined) {
      updates.sort_by = prefs.sortBy;
    }
    if (prefs.sortDirection !== undefined) {
      updates.sort_direction = prefs.sortDirection;
    }

    // Skip if no updates provided
    if (Object.keys(updates).length === 0) {
      return;
    }

    // Upsert to user_settings (insert if not exists, update if exists)
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      throw new Error(`Failed to update filter preferences: ${error.message}`);
    }
  }
}

class SupabaseVersionsAdapter implements VersionsStorageAdapter {
  async createVersion(data: {
    promptId: string;
    versionNumber: number;
    title: string;
    body: string;
    variables: string[];
    revertedFromVersionId?: string;
  }): Promise<PromptVersion> {
    await requireUserId();

    const { data: result, error } = await supabase
      .rpc('create_prompt_version', {
        p_prompt_id: data.promptId,
        p_version_number: data.versionNumber,
        p_title: data.title,
        p_body: data.body,
        p_variables: data.variables,
        p_reverted_from_version_id: data.revertedFromVersionId ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create version: ${error.message}`);
    }

    if (!result) {
      throw new Error('Failed to create version: No data returned');
    }

    return mapVersionRow(result as VersionRow);
  }

  async getVersions(promptId: string, offset: number = 0, limit: number = 25): Promise<PaginatedVersions> {
    await requireUserId();

    const { data, error } = await supabase
      .rpc('get_prompt_versions', {
        prompt_id: promptId,
        offset_count: offset,
        limit_count: limit,
      });

    if (error) {
      throw new Error(`Failed to fetch versions: ${error.message}`);
    }

    if (!data) {
      return {
        versions: [],
        hasMore: false,
        totalCount: 0,
      };
    }

    const result = data as {
      versions: VersionRow[];
      total_count: number;
    };

    const versions = result.versions.map(mapVersionRow);
    const totalCount = result.total_count ?? 0;
    const hasMore = offset + versions.length < totalCount;

    return {
      versions,
      hasMore,
      totalCount,
    };
  }
}

export class SupabaseAdapter implements StorageAdapter {
  public prompts: PromptsStorageAdapter;
  public copyEvents: CopyEventsStorageAdapter;
  public stats: StatsStorageAdapter;
  public versions: VersionsStorageAdapter;
  private channel: RealtimeChannel | null = null;
  private broadcastChannel: RealtimeChannel | null = null;
  private channelUserId: string | null = null;
  private subscribers = new Set<(type: 'prompts' | 'copyEvents' | 'stats' | 'publicPrompts', data?: unknown) => void>();
  private subscriptionGeneration = 0;
  private subscribeTask: Promise<void> | null = null;

  constructor() {
    this.versions = new SupabaseVersionsAdapter();
    this.prompts = new SupabasePromptsAdapter(this.versions);
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

  getType(): 'supabase' {
    return 'supabase';
  }

  subscribe(callback: (type: 'prompts' | 'copyEvents' | 'stats' | 'publicPrompts', data?: unknown) => void): () => void {
    this.subscribers.add(callback);
    if (this.subscribers.size === 1) {
      const generation = ++this.subscriptionGeneration;
      void this.ensureSubscription(generation);
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        const generation = ++this.subscriptionGeneration;
        void this.teardownChannel(generation);
      }
    };
  }

  private notifySubscribers(type: 'prompts' | 'copyEvents' | 'stats' | 'publicPrompts', data?: unknown) {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(type, data);
      } catch (err) {
        console.error('Realtime subscription callback failed:', err);
      }
    });
  }

  private async ensureSubscription(generation: number): Promise<void> {
    if (generation !== this.subscriptionGeneration) {
      return;
    }

    if (this.subscribeTask) {
      await this.subscribeTask;
      if (generation !== this.subscriptionGeneration) {
        return;
      }
      if (this.channel) {
        return;
      }
    }

    const task = this.setupSubscription(generation);
    this.subscribeTask = task;
    try {
      await task;
    } finally {
      if (this.subscribeTask === task) {
        this.subscribeTask = null;
      }
    }
  }

  private async setupSubscription(generation: number): Promise<void> {
    if (generation !== this.subscriptionGeneration) {
      return;
    }

    if (this.subscribers.size === 0) {
      await this.teardownChannel(generation);
      return;
    }

    const userId = await getCurrentUserId();
    if (!userId || generation !== this.subscriptionGeneration || this.subscribers.size === 0) {
      await this.teardownChannel(generation);
      return;
    }

    if (this.channel && this.channelUserId === userId) {
      return;
    }

    await this.teardownChannel(generation);
    if (generation !== this.subscriptionGeneration || this.subscribers.size === 0) {
      return;
    }

    const channel = supabase
      .channel(`prompt_vault_changes:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prompts',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.notifySubscribers('prompts', payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'copy_events',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.notifySubscribers('copyEvents', payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prompt_versions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Version changes affect prompt context; trigger prompts refresh
        // Future phases will add dedicated version event handling
        this.notifySubscribers('prompts', payload);
      });

    // Create a broadcast channel for public prompt notifications
    // Uses Supabase Broadcast instead of postgres_changes because RLS evaluates
    // against the OLD row state - when private→public, other users can't see the
    // old (private) row, so they never receive postgres_changes events.
    // Broadcast bypasses RLS for notifications; actual data fetch still uses RLS.
    const broadcastChannel = supabase
      .channel('public_prompts_broadcast')
      .on('broadcast', { event: 'public_prompt_changed' }, () => {
        this.notifySubscribers('publicPrompts');
      });

    if (generation !== this.subscriptionGeneration || this.subscribers.size === 0) {
      try {
        await supabase.removeChannel(channel);
        await supabase.removeChannel(broadcastChannel);
      } catch (err) {
        console.error('Failed to remove Supabase channel:', err);
      }
      return;
    }

    this.channel = channel;
    this.broadcastChannel = broadcastChannel;
    this.channelUserId = userId;

    channel.subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime subscription error:', err);
        void this.resubscribe();
      }
      if (status === 'TIMED_OUT') {
        console.error('Realtime subscription timed out');
      }
      if (status === 'CLOSED') {
        // Silently resubscribe on close - no logging needed for expected disconnections
        void this.resubscribe();
      }
    });

    broadcastChannel.subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Public prompts broadcast subscription error:', err);
        void this.resubscribe();
      }
      if (status === 'TIMED_OUT') {
        console.error('Public prompts broadcast subscription timed out');
      }
      if (status === 'CLOSED') {
        // Silently resubscribe on close - no logging needed for expected disconnections
        void this.resubscribe();
      }
    });
  }

  private async resubscribe(): Promise<void> {
    if (this.subscribers.size === 0) {
      await this.teardownChannel(this.subscriptionGeneration);
      return;
    }

    const generation = ++this.subscriptionGeneration;
    await this.teardownChannel(generation);
    if (generation !== this.subscriptionGeneration || this.subscribers.size === 0) {
      return;
    }

    await this.ensureSubscription(generation);
  }

  private async teardownChannel(generation: number): Promise<void> {
    if (generation !== this.subscriptionGeneration) {
      return;
    }

    if (!this.channel && !this.broadcastChannel) {
      this.channelUserId = null;
      return;
    }

    const channel = this.channel;
    const broadcastChannel = this.broadcastChannel;
    this.channel = null;
    this.broadcastChannel = null;
    this.channelUserId = null;

    try {
      if (channel) {
        await supabase.removeChannel(channel);
      }
      if (broadcastChannel) {
        await supabase.removeChannel(broadcastChannel);
      }
    } catch (err) {
      console.error('Failed to remove Supabase channel:', err);
    }
  }
}
