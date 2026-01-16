// ============================================================================
// Public Library Types
// ============================================================================

/**
 * Source of a prompt - determines ownership and available actions
 * - 'owned': User created this prompt, full control
 * - 'saved': User saved this from public library (live-linked, read-only)
 * - 'public': Viewing from public library (not in user's vault)
 */
export type PromptSource = 'owned' | 'saved' | 'public';

/**
 * Display variant for prompt components - determines layout and actions
 * - 'default': Full card with all actions (dashboard)
 * - 'compact': Minimal card (search results, history references)
 * - 'library': Public library card (author attribution, save/fork actions)
 */
export type PromptVariant = 'default' | 'compact' | 'library';

/**
 * Author metadata for public prompts
 */
export interface AuthorInfo {
  userId: string;
  displayName?: string; // Future: user profile name
}

// ============================================================================
// Core Prompt Types
// ============================================================================

export interface Prompt {
  id: string;
  title: string;
  body: string;
  variables: string[];
  updatedAt: string;
  isPinned?: boolean;
  timesUsed?: number;

  // Public library metadata (optional - only present for public/saved prompts)
  visibility?: 'private' | 'public'; // Maps to prompt_visibility enum
  authorId?: string; // Original author's user_id
  author?: AuthorInfo; // Author display info (populated on fetch)

  // Saved prompt tracking (for live-linked prompts)
  sourcePromptId?: string; // Original prompt ID if saved from library

  // Fork tracking
  forkedFromPromptId?: string; // Source prompt if this is a fork
}

/**
 * A prompt that is definitely public with all required metadata
 */
export interface PublicPrompt extends Prompt {
  visibility: 'public';
  authorId: string;
  author: AuthorInfo;
}

/**
 * Type guard to check if a prompt is a public prompt with full metadata
 */
export function isPublicPrompt(prompt: Prompt): prompt is PublicPrompt {
  return prompt.visibility === 'public' && !!prompt.authorId;
}

export interface VariableValues {
  [key: string]: string;
}

export interface PromptWithValues extends Prompt {
  variableValues: VariableValues;
}

export interface CopyEvent {
  id: string;
  promptId: string;
  promptTitle: string;
  variableValues: VariableValues;
  copiedText: string;
  timestamp: string;
  sourceCopyEventId?: string | null;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  userId: string;
  versionNumber: number;
  title: string;
  body: string;
  variables: string[];
  revertedFromVersionId: string | null;
  createdAt: string;
}

export interface PaginatedVersions {
  versions: PromptVersion[];
  hasMore: boolean;
  totalCount: number;
}