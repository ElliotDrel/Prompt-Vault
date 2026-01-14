export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      copy_events: {
        Row: {
          copied_text: string
          created_at: string | null
          id: string
          prompt_id: string | null
          prompt_title: string
          source_copy_event_id: string | null
          user_id: string | null
          variable_values: Json | null
        }
        Insert: {
          copied_text: string
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          prompt_title: string
          source_copy_event_id?: string | null
          user_id?: string | null
          variable_values?: Json | null
        }
        Update: {
          copied_text?: string
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          prompt_title?: string
          source_copy_event_id?: string | null
          user_id?: string | null
          variable_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_events_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_events_source_copy_event_id_fkey"
            columns: ["source_copy_event_id"]
            isOneToOne: false
            referencedRelation: "copy_events"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          body: string
          created_at: string | null
          id: string
          prompt_id: string
          reverted_from_version_id: string | null
          title: string
          user_id: string
          variables: Json
          version_number: number
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          prompt_id: string
          reverted_from_version_id?: string | null
          title: string
          user_id: string
          variables?: Json
          version_number: number
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          prompt_id?: string
          reverted_from_version_id?: string | null
          title?: string
          user_id?: string
          variables?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_versions_reverted_from_version_id_fkey"
            columns: ["reverted_from_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          times_used: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          times_used?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          times_used?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          time_saved_multiplier: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          time_saved_multiplier?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          time_saved_multiplier?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      prompt_stats: {
        Row: {
          time_saved_multiplier: number | null
          total_copies: number | null
          total_prompt_uses: number | null
          total_prompts: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_prompt_version: {
        Args: {
          p_body: string
          p_prompt_id: string
          p_reverted_from_version_id?: string
          p_title: string
          p_variables: Json
          p_version_number: number
        }
        Returns: {
          body: string
          created_at: string
          id: string
          prompt_id: string
          reverted_from_version_id: string
          title: string
          user_id: string
          variables: Json
          version_number: number
        }[]
      }
      get_prompt_versions: {
        Args: { limit_count?: number; offset_count?: number; prompt_id: string }
        Returns: Json
      }
      increment_prompt_usage: {
        Args: { p_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_pinned: boolean
          times_used: number
          title: string
          updated_at: string
          user_id: string
          variables: Json
        }[]
      }
      search_copy_events: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          copied_text: string
          created_at: string | null
          id: string
          prompt_id: string | null
          prompt_title: string
          source_copy_event_id: string | null
          user_id: string | null
          variable_values: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "copy_events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
