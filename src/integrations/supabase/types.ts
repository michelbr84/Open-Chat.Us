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
      achievements: {
        Row: {
          achievement_code: string
          category: string
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          points: number
        }
        Insert: {
          achievement_code: string
          category: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          points?: number
        }
        Update: {
          achievement_code?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points?: number
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_temporary: boolean | null
          max_participants: number | null
          name: string
          room_type: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          max_participants?: number | null
          name: string
          room_type?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_temporary?: boolean | null
          max_participants?: number | null
          name?: string
          room_type?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_user_id: string
          created_at: string | null
          id: string
          nickname: string | null
          user_id: string
        }
        Insert: {
          contact_user_id: string
          created_at?: string | null
          id?: string
          nickname?: string | null
          user_id: string
        }
        Update: {
          contact_user_id?: string
          created_at?: string | null
          id?: string
          nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_filters: {
        Row: {
          created_at: string
          filter_type: string
          id: string
          is_active: boolean
          is_regex: boolean | null
          pattern: string
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          filter_type: string
          id?: string
          is_active?: boolean
          is_regex?: boolean | null
          pattern: string
          severity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          filter_type?: string
          id?: string
          is_active?: boolean
          is_regex?: boolean | null
          pattern?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      flagged_content: {
        Row: {
          auto_flagged: boolean | null
          created_at: string
          id: string
          message_id: string | null
          reason: string
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          auto_flagged?: boolean | null
          created_at?: string
          id?: string
          message_id?: string | null
          reason: string
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          auto_flagged?: boolean | null
          created_at?: string
          id?: string
          message_id?: string | null
          reason?: string
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flagged_content_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          channel_id: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          achievement_count: number | null
          id: string
          message_count: number | null
          rank: number | null
          reaction_count: number | null
          total_points: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          achievement_count?: number | null
          id?: string
          message_count?: number | null
          rank?: number | null
          reaction_count?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          achievement_count?: number | null
          id?: string
          message_count?: number | null
          rank?: number | null
          reaction_count?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          reason: string
          reporter_id: string | null
          reporter_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason: string
          reporter_id?: string | null
          reporter_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason?: string
          reporter_id?: string | null
          reporter_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          channel_id: string | null
          created_at: string
          id: string
          last_reply_at: string | null
          parent_message_id: string
          reply_count: number | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          id?: string
          last_reply_at?: string | null
          parent_message_id: string
          reply_count?: number | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          id?: string
          last_reply_at?: string | null
          parent_message_id?: string
          reply_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_bot_message: boolean | null
          is_deleted: boolean
          mentions: Json | null
          parent_message_id: string | null
          reply_count: number | null
          sender_id: string | null
          sender_name: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot_message?: boolean | null
          is_deleted?: boolean
          mentions?: Json | null
          parent_message_id?: string | null
          reply_count?: number | null
          sender_id?: string | null
          sender_name: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot_message?: boolean | null
          is_deleted?: boolean
          mentions?: Json | null
          parent_message_id?: string | null
          reply_count?: number | null
          sender_id?: string | null
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          moderator_id: string | null
          reason: string | null
          target_message_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_message_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          moderator_id?: string | null
          reason?: string | null
          target_message_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_target_message_id_fkey"
            columns: ["target_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          receiver_name?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          reputation: number | null
          role: string
          status: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          reputation?: number | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          reputation?: number | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_code: string
          achievement_description: string
          achievement_name: string
          id: string
          points_awarded: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_code: string
          achievement_description: string
          achievement_name: string
          id?: string
          points_awarded?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_code?: string
          achievement_description?: string
          achievement_name?: string
          id?: string
          points_awarded?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_moderation_status: {
        Row: {
          banned_until: string | null
          created_at: string
          id: string
          muted_until: string | null
          status: string | null
          total_warnings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banned_until?: string | null
          created_at?: string
          id?: string
          muted_until?: string | null
          status?: string | null
          total_warnings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banned_until?: string | null
          created_at?: string
          id?: string
          muted_until?: string | null
          status?: string | null
          total_warnings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_temporary_rooms: { Args: never; Returns: undefined }
      enhanced_rate_limit_check: {
        Args: { p_action_type?: string; p_user_id: string }
        Returns: boolean
      }
      get_unread_conversations: {
        Args: { p_user_id: string }
        Returns: {
          sender_id: string
          sender_name: string
          unread_count: number
        }[]
      }
      get_unread_message_count: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid?: string }; Returns: boolean }
      mark_messages_as_read: {
        Args: { p_sender_id: string; p_user_id: string }
        Returns: undefined
      }
      validate_message_content: { Args: { content: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
