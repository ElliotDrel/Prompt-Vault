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
