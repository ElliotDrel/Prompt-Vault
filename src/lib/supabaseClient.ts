import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database type definitions (will be generated after migrations are applied)
export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          variables: string[];
          is_pinned: boolean;
          times_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          variables?: string[];
          is_pinned?: boolean;
          times_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          variables?: string[];
          is_pinned?: boolean;
          times_used?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      copy_events: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          prompt_title: string;
          variable_values: Record<string, string>;
          copied_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          prompt_title: string;
          variable_values?: Record<string, string>;
          copied_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          prompt_title?: string;
          variable_values?: Record<string, string>;
          copied_text?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          time_saved_multiplier: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          time_saved_multiplier?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          time_saved_multiplier?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      prompt_stats: {
        Row: {
          user_id: string;
          total_prompts: number;
          total_copies: number;
          total_prompt_uses: number;
          time_saved_multiplier: number;
        };
      };
    };
  };
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
};

/**
 * Derive the localStorage key Supabase uses to persist auth sessions.
 * Key format: sb-{project_ref}-auth-token, where project_ref is extracted
 * from the Supabase URL (https://{project_ref}.supabase.co).
 */
const supabaseStorageKey = (() => {
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return 'sb-hupdhjdasqgfcabaiiwa-auth-token'; // fallback to known project ref
  }
})();

/**
 * Synchronous check for persisted Supabase session in localStorage.
 * Used for optimistic UI (e.g. showing "Go to App" instantly) — NOT for security decisions.
 * The actual auth state is still resolved async by supabase.auth.getSession().
 *
 * Returns true if:
 * - access_token exists and is not expired (definitely valid), OR
 * - access_token is expired but refresh_token exists (Supabase will auto-refresh)
 *
 * Only returns false when no session exists at all, covering returning users
 * who've been away for >1 hour (expired access_token but valid refresh_token).
 */
export function hasPersistedSession(): boolean {
  try {
    const stored = localStorage.getItem(supabaseStorageKey);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    if (!parsed?.access_token) return false;
    // If token is still valid, definitely authenticated
    if (parsed.expires_at && parsed.expires_at > Math.floor(Date.now() / 1000)) {
      return true;
    }
    // Token expired but refresh_token exists — Supabase will auto-refresh
    return !!parsed.refresh_token;
  } catch {
    return false;
  }
}
