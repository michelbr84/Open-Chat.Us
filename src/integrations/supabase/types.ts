export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_code: string
          category: string
          created_at: string | null
          description: string
          icon_name: string | null
          id: string
          name: string
          rarity: string
          reputation_reward: number | null
          unlocks_feature: string | null
        }
        Insert: {
          achievement_code: string
          category: string
          created_at?: string | null
          description: string
          icon_name?: string | null
          id?: string
          name: string
          rarity: string
          reputation_reward?: number | null
          unlocks_feature?: string | null
        }
        Update: {
          achievement_code?: string
          category?: string
          created_at?: string | null
          description?: string
          icon_name?: string | null
          id?: string
          name?: string
          rarity?: string
          reputation_reward?: number | null
          unlocks_feature?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          role: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          content: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          role: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          role?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      competitions: {
        Row: {
          country_code: string | null
          created_at: string
          current_season: string
          id: string
          name_en: string
          name_es: string
          name_fr: string
          name_pt: string
          status: string
          teams_count: number
          tier: number
          type: string
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          current_season?: string
          id?: string
          name_en: string
          name_es: string
          name_fr: string
          name_pt: string
          status?: string
          teams_count?: number
          tier?: number
          type: string
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          current_season?: string
          id?: string
          name_en?: string
          name_es?: string
          name_fr?: string
          name_pt?: string
          status?: string
          teams_count?: number
          tier?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          email: string
          id: string
          message: string
          name: string
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          message: string
          name: string
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          message?: string
          name?: string
          submitted_at?: string
        }
        Relationships: []
      }
      delivery_requests: {
        Row: {
          created_at: string
          date: string
          dropoff_address: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          pickup_address: string
          platform: string
          platform_other: string | null
          status: string
          time: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          date: string
          dropoff_address: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          pickup_address: string
          platform: string
          platform_other?: string | null
          status?: string
          time: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          date?: string
          dropoff_address?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          pickup_address?: string
          platform?: string
          platform_other?: string | null
          status?: string
          time?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_team_id: string
          competition_id: string
          created_at: string
          home_team_id: string
          id: string
          match_id: string | null
          matchday: number
          round_name: string | null
          scheduled_date: string
          scheduled_time: string | null
          season: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_team_id: string
          competition_id: string
          created_at?: string
          home_team_id: string
          id?: string
          match_id?: string | null
          matchday: number
          round_name?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          season?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_team_id?: string
          competition_id?: string
          created_at?: string
          home_team_id?: string
          id?: string
          match_id?: string | null
          matchday?: number
          round_name?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          season?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      game_credits: {
        Row: {
          category: string
          id: string
          language: string
          name: string
          role: string
          team: string
        }
        Insert: {
          category: string
          id?: string
          language: string
          name: string
          role: string
          team: string
        }
        Update: {
          category?: string
          id?: string
          language?: string
          name?: string
          role?: string
          team?: string
        }
        Relationships: []
      }
      hall_of_fame: {
        Row: {
          club: string
          country: string | null
          games_won: number | null
          id: string
          manager_name: string
          score: number
          timestamp: string | null
          trophies: number | null
          user_id: string | null
        }
        Insert: {
          club: string
          country?: string | null
          games_won?: number | null
          id?: string
          manager_name: string
          score: number
          timestamp?: string | null
          trophies?: number | null
          user_id?: string | null
        }
        Update: {
          club?: string
          country?: string | null
          games_won?: number | null
          id?: string
          manager_name?: string
          score?: number
          timestamp?: string | null
          trophies?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      league_standings: {
        Row: {
          competition_id: string
          created_at: string
          draws: number
          form: string | null
          goal_difference: number | null
          goals_against: number
          goals_for: number
          id: string
          last_updated: string
          losses: number
          matches_played: number
          points: number | null
          position: number | null
          season: string
          team_id: string
          wins: number
        }
        Insert: {
          competition_id: string
          created_at?: string
          draws?: number
          form?: string | null
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          last_updated?: string
          losses?: number
          matches_played?: number
          points?: number | null
          position?: number | null
          season?: string
          team_id: string
          wins?: number
        }
        Update: {
          competition_id?: string
          created_at?: string
          draws?: number
          form?: string | null
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          last_updated?: string
          losses?: number
          matches_played?: number
          points?: number | null
          position?: number | null
          season?: string
          team_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_standings_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          manager_id: string | null
          season: string | null
          unlocked_at: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          manager_id?: string | null
          season?: string | null
          unlocked_at?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          manager_id?: string | null
          season?: string | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_achievements_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_career: {
        Row: {
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          current_contract_salary: number | null
          experience_points: number
          id: string
          manager_id: string | null
          reputation_level: number
          total_draws: number
          total_losses: number
          total_matches: number
          total_wins: number
          trophies_won: number
          updated_at: string | null
        }
        Insert: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          current_contract_salary?: number | null
          experience_points?: number
          id?: string
          manager_id?: string | null
          reputation_level?: number
          total_draws?: number
          total_losses?: number
          total_matches?: number
          total_wins?: number
          trophies_won?: number
          updated_at?: string | null
        }
        Update: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          current_contract_salary?: number | null
          experience_points?: number
          id?: string
          manager_id?: string | null
          reputation_level?: number
          total_draws?: number
          total_losses?: number
          total_matches?: number
          total_wins?: number
          trophies_won?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_career_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          nationality: string
          selected_team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          nationality: string
          selected_team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string
          selected_team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managers_selected_team_id_fkey"
            columns: ["selected_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          match_id: string
          minute: number
          player_id: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          match_id: string
          minute: number
          player_id?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          match_id?: string
          minute?: number
          player_id?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineup_players: {
        Row: {
          id: string
          is_captain: boolean
          lineup_id: string
          player_id: string
          position: string
        }
        Insert: {
          id?: string
          is_captain?: boolean
          lineup_id: string
          player_id: string
          position: string
        }
        Update: {
          id?: string
          is_captain?: boolean
          lineup_id?: string
          player_id?: string
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineup_players_lineup_id_fkey"
            columns: ["lineup_id"]
            isOneToOne: false
            referencedRelation: "match_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineup_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          formation_code: string
          formation_id: string | null
          id: string
          match_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          formation_code: string
          formation_id?: string | null
          id?: string
          match_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          formation_code?: string
          formation_id?: string | null
          id?: string
          match_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "team_formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number
          away_team_id: string
          competition: string
          created_at: string
          home_score: number
          home_team_id: string
          id: string
          match_date: string
          match_status: string
          season: string
          updated_at: string
        }
        Insert: {
          away_score?: number
          away_team_id: string
          competition?: string
          created_at?: string
          home_score?: number
          home_team_id: string
          id?: string
          match_date: string
          match_status?: string
          season?: string
          updated_at?: string
        }
        Update: {
          away_score?: number
          away_team_id?: string
          competition?: string
          created_at?: string
          home_score?: number
          home_team_id?: string
          id?: string
          match_date?: string
          match_status?: string
          season?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      message_edit_history: {
        Row: {
          edited_at: string
          editor_id: string
          id: string
          message_id: string
          new_content: string
          original_content: string
        }
        Insert: {
          edited_at?: string
          editor_id: string
          id?: string
          message_id: string
          new_content: string
          original_content: string
        }
        Update: {
          edited_at?: string
          editor_id?: string
          id?: string
          message_id?: string
          new_content?: string
          original_content?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          sender_id: string | null
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id?: string | null
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id?: string | null
          sender_name?: string
        }
        Relationships: []
      }
      multiplayer_players: {
        Row: {
          id: string
          joined_at: string | null
          session_id: string | null
          team_name: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          session_id?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          session_id?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multiplayer_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      multiplayer_sessions: {
        Row: {
          created_at: string | null
          host_id: string | null
          id: string
          last_updated: string | null
          room_code: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          host_id?: string | null
          id?: string
          last_updated?: string | null
          room_code: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          host_id?: string | null
          id?: string
          last_updated?: string | null
          room_code?: string
          status?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_public: boolean
          name: string
          owner_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_public?: boolean
          name: string
          owner_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_public?: boolean
          name?: string
          owner_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string
          delivery_request_id: string
          id: string
          payment_intent_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          delivery_request_id: string
          id?: string
          payment_intent_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          delivery_request_id?: string
          id?: string
          payment_intent_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_delivery_request_id_fkey"
            columns: ["delivery_request_id"]
            isOneToOne: false
            referencedRelation: "delivery_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_intent_id: string | null
          payment_method: string
          reservation_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_intent_id?: string | null
          payment_method: string
          reservation_id: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_intent_id?: string | null
          payment_method?: string
          reservation_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_contracts: {
        Row: {
          bonus_clauses: Json | null
          contract_end_date: string
          contract_start_date: string
          contract_type: string
          created_at: string
          id: string
          is_active: boolean
          player_id: string
          release_clause: number | null
          team_id: string
          updated_at: string
          wage_per_week: number
        }
        Insert: {
          bonus_clauses?: Json | null
          contract_end_date: string
          contract_start_date: string
          contract_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          player_id: string
          release_clause?: number | null
          team_id: string
          updated_at?: string
          wage_per_week: number
        }
        Update: {
          bonus_clauses?: Json | null
          contract_end_date?: string
          contract_start_date?: string
          contract_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          player_id?: string
          release_clause?: number | null
          team_id?: string
          updated_at?: string
          wage_per_week?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_player_contracts_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_match_performance: {
        Row: {
          assists: number
          created_at: string
          goals: number
          goals_conceded: number
          id: string
          match_id: string
          minutes_played: number
          passes_attempted: number
          passes_completed: number
          player_id: string
          rating: number | null
          red_cards: number
          saves: number
          shots: number
          shots_on_target: number
          tackles_attempted: number
          tackles_won: number
          team_id: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          goals_conceded?: number
          id?: string
          match_id: string
          minutes_played?: number
          passes_attempted?: number
          passes_completed?: number
          player_id: string
          rating?: number | null
          red_cards?: number
          saves?: number
          shots?: number
          shots_on_target?: number
          tackles_attempted?: number
          tackles_won?: number
          team_id: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          goals_conceded?: number
          id?: string
          match_id?: string
          minutes_played?: number
          passes_attempted?: number
          passes_completed?: number
          player_id?: string
          rating?: number | null
          red_cards?: number
          saves?: number
          shots?: number
          shots_on_target?: number
          tackles_attempted?: number
          tackles_won?: number
          team_id?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_match_performance_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_performance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_performance_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          apps: number
          assists: number
          conceded: number
          contract_value: number | null
          created_at: string
          fitness_level: number | null
          form_level: number | null
          fouls_committed: number
          fouls_suffered: number
          goals: number
          height_cm: number
          id: string
          injury_return_date: string | null
          injury_status: string | null
          is_captain: boolean
          is_injured: boolean
          is_new_transfer: boolean
          morale_level: number | null
          name: string
          nationality: string
          position: string
          red_cards: number
          saves: number
          shots: number
          shots_on_target: number
          sub: number
          team_id: string
          training_focus: string | null
          wage_per_week: number | null
          weight_kg: number
          yellow_cards: number
        }
        Insert: {
          age: number
          apps?: number
          assists?: number
          conceded?: number
          contract_value?: number | null
          created_at?: string
          fitness_level?: number | null
          form_level?: number | null
          fouls_committed?: number
          fouls_suffered?: number
          goals?: number
          height_cm: number
          id?: string
          injury_return_date?: string | null
          injury_status?: string | null
          is_captain?: boolean
          is_injured?: boolean
          is_new_transfer?: boolean
          morale_level?: number | null
          name: string
          nationality: string
          position: string
          red_cards?: number
          saves?: number
          shots?: number
          shots_on_target?: number
          sub?: number
          team_id: string
          training_focus?: string | null
          wage_per_week?: number | null
          weight_kg: number
          yellow_cards?: number
        }
        Update: {
          age?: number
          apps?: number
          assists?: number
          conceded?: number
          contract_value?: number | null
          created_at?: string
          fitness_level?: number | null
          form_level?: number | null
          fouls_committed?: number
          fouls_suffered?: number
          goals?: number
          height_cm?: number
          id?: string
          injury_return_date?: string | null
          injury_status?: string | null
          is_captain?: boolean
          is_injured?: boolean
          is_new_transfer?: boolean
          morale_level?: number | null
          name?: string
          nationality?: string
          position?: string
          red_cards?: number
          saves?: number
          shots?: number
          shots_on_target?: number
          sub?: number
          team_id?: string
          training_focus?: string | null
          wage_per_week?: number | null
          weight_kg?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_category_relationships: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_category_relationships_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "post_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_category_relationships_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tag_relationships: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tag_relationships_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tag_relationships_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "post_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
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
          created_at: string
          crypto_trading_enabled: boolean | null
          default_currency: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          is_paper_trading: boolean | null
          name: string
          options_trading_enabled: boolean | null
          order_notifications: boolean | null
          price_alerts: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          theme_preference: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crypto_trading_enabled?: boolean | null
          default_currency?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          is_paper_trading?: boolean | null
          name: string
          options_trading_enabled?: boolean | null
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crypto_trading_enabled?: boolean | null
          default_currency?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          is_paper_trading?: boolean | null
          name?: string
          options_trading_enabled?: boolean | null
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content: string
          created_at: string
          id: string
          is_directory: boolean
          language: string
          name: string
          parent_id: string | null
          path: string
          project_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_directory?: boolean
          language?: string
          name: string
          parent_id?: string | null
          path: string
          project_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_directory?: boolean
          language?: string
          name?: string
          parent_id?: string | null
          path?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quickstart_files: {
        Row: {
          country: string
          created_at: string | null
          description: string | null
          id: string
          template_data: Json | null
          title: string
        }
        Insert: {
          country: string
          created_at?: string | null
          description?: string | null
          id?: string
          template_data?: Json | null
          title: string
        }
        Update: {
          country?: string
          created_at?: string | null
          description?: string | null
          id?: string
          template_data?: Json | null
          title?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reservation_id: string | null
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reservation_id?: string | null
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reservation_id?: string | null
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_games: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          save_name: string
          team: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          save_name: string
          team: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          save_name?: string
          team?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scout_reports: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          estimated_value: number | null
          id: string
          mental_rating: number | null
          overall_rating: number | null
          physical_rating: number | null
          player_id: string | null
          potential_rating: number | null
          recommendation: string | null
          scout_id: string | null
          scout_notes: string | null
          scouting_date: string | null
          team_id: string
          technical_rating: number | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          mental_rating?: number | null
          overall_rating?: number | null
          physical_rating?: number | null
          player_id?: string | null
          potential_rating?: number | null
          recommendation?: string | null
          scout_id?: string | null
          scout_notes?: string | null
          scouting_date?: string | null
          team_id: string
          technical_rating?: number | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          estimated_value?: number | null
          id?: string
          mental_rating?: number | null
          overall_rating?: number | null
          physical_rating?: number | null
          player_id?: string | null
          potential_rating?: number | null
          recommendation?: string | null
          scout_id?: string | null
          scout_notes?: string | null
          scouting_date?: string | null
          team_id?: string
          technical_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scout_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scout_reports_scout_id_fkey"
            columns: ["scout_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scout_reports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          id: string
          timestamp: string
          vin: string
        }
        Insert: {
          id?: string
          timestamp?: string
          vin: string
        }
        Update: {
          id?: string
          timestamp?: string
          vin?: string
        }
        Relationships: []
      }
      season_calendar: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_current_week: boolean
          matchday_number: number
          season: string
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_current_week?: boolean
          matchday_number: number
          season?: string
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_current_week?: boolean
          matchday_number?: number
          season?: string
          week_end_date?: string
          week_number?: number
          week_start_date?: string
        }
        Relationships: []
      }
      season_objectives: {
        Row: {
          created_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          manager_id: string | null
          objective_description: string
          objective_type: string
          penalty_reputation: number | null
          priority_level: string
          reward_budget: number | null
          reward_reputation: number | null
          season: string
          target_value: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          manager_id?: string | null
          objective_description: string
          objective_type: string
          penalty_reputation?: number | null
          priority_level: string
          reward_budget?: number | null
          reward_reputation?: number | null
          season?: string
          target_value: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          manager_id?: string | null
          objective_description?: string
          objective_type?: string
          penalty_reputation?: number | null
          priority_level?: string
          reward_budget?: number | null
          reward_reputation?: number | null
          season?: string
          target_value?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "season_objectives_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          rating: number
          service_id: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          rating: number
          service_id: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          service_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description: string
          icon: string | null
          id: string
          is_featured: boolean | null
          position: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          position?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          position?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          age: number
          contract_end_date: string | null
          created_at: string | null
          hired_date: string | null
          id: string
          is_active: boolean | null
          morale: number | null
          name: string
          nationality: string
          skill_level: number
          specialization: string | null
          staff_type: string
          team_id: string
          wage_per_week: number
        }
        Insert: {
          age: number
          contract_end_date?: string | null
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          morale?: number | null
          name: string
          nationality: string
          skill_level: number
          specialization?: string | null
          staff_type: string
          team_id: string
          wage_per_week?: number
        }
        Update: {
          age?: number
          contract_end_date?: string | null
          created_at?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          morale?: number | null
          name?: string
          nationality?: string
          skill_level?: number
          specialization?: string | null
          staff_type?: string
          team_id?: string
          wage_per_week?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_finances: {
        Row: {
          created_at: string | null
          current_budget: number
          debt: number
          expenses_facilities: number
          expenses_other: number
          expenses_transfers: number
          expenses_wages: number
          id: string
          revenue_other: number
          revenue_prize_money: number
          revenue_sponsorships: number
          revenue_ticket_sales: number
          season: string
          team_id: string
          transfer_budget: number
          updated_at: string | null
          wage_budget: number
        }
        Insert: {
          created_at?: string | null
          current_budget?: number
          debt?: number
          expenses_facilities?: number
          expenses_other?: number
          expenses_transfers?: number
          expenses_wages?: number
          id?: string
          revenue_other?: number
          revenue_prize_money?: number
          revenue_sponsorships?: number
          revenue_ticket_sales?: number
          season?: string
          team_id: string
          transfer_budget?: number
          updated_at?: string | null
          wage_budget?: number
        }
        Update: {
          created_at?: string | null
          current_budget?: number
          debt?: number
          expenses_facilities?: number
          expenses_other?: number
          expenses_transfers?: number
          expenses_wages?: number
          id?: string
          revenue_other?: number
          revenue_prize_money?: number
          revenue_sponsorships?: number
          revenue_ticket_sales?: number
          season?: string
          team_id?: string
          transfer_budget?: number
          updated_at?: string | null
          wage_budget?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_finances_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_formations: {
        Row: {
          created_at: string
          formation_code: string
          formation_name: string
          id: string
          is_default: boolean
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation_code: string
          formation_name: string
          id?: string
          is_default?: boolean
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation_code?: string
          formation_name?: string
          id?: string
          is_default?: boolean
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_formations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          country_code: string
          division_code: string
          id: string
          league: string
          name_en: string
          name_es: string
          name_fr: string
          name_pt: string
        }
        Insert: {
          country_code: string
          division_code: string
          id: string
          league: string
          name_en: string
          name_es: string
          name_fr: string
          name_pt: string
        }
        Update: {
          country_code?: string
          division_code?: string
          id?: string
          league?: string
          name_en?: string
          name_es?: string
          name_fr?: string
          name_pt?: string
        }
        Relationships: []
      }
      teams_extended: {
        Row: {
          accent_color: string
          id: string
          primary_color: string
          secondary_color: string
        }
        Insert: {
          accent_color?: string
          id: string
          primary_color?: string
          secondary_color?: string
        }
        Update: {
          accent_color?: string
          id?: string
          primary_color?: string
          secondary_color?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_extended_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      training_participation: {
        Row: {
          created_at: string | null
          fitness_change: number | null
          id: string
          injury_risk_increase: number | null
          morale_change: number | null
          participation_level: string
          performance_rating: number | null
          player_id: string | null
          training_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          fitness_change?: number | null
          id?: string
          injury_risk_increase?: number | null
          morale_change?: number | null
          participation_level: string
          performance_rating?: number | null
          player_id?: string | null
          training_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          fitness_change?: number | null
          id?: string
          injury_risk_increase?: number | null
          morale_change?: number | null
          participation_level?: string
          performance_rating?: number | null
          player_id?: string | null
          training_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_participation_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_participation_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number
          focus_areas: string[] | null
          id: string
          intensity: string
          session_date: string
          session_type: string
          team_id: string
          weather_conditions: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number
          focus_areas?: string[] | null
          id?: string
          intensity: string
          session_date: string
          session_type: string
          team_id: string
          weather_conditions?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          focus_areas?: string[] | null
          id?: string
          intensity?: string
          session_date?: string
          session_type?: string
          team_id?: string
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_bids: {
        Row: {
          bid_amount: number
          bidding_team_id: string
          bonus_clauses: Json | null
          contract_length_months: number | null
          created_at: string
          expires_at: string | null
          id: string
          listing_id: string
          responded_at: string | null
          response_message: string | null
          status: string
          submitted_at: string
          wage_offer: number | null
        }
        Insert: {
          bid_amount: number
          bidding_team_id: string
          bonus_clauses?: Json | null
          contract_length_months?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          listing_id: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          submitted_at?: string
          wage_offer?: number | null
        }
        Update: {
          bid_amount?: number
          bidding_team_id?: string
          bonus_clauses?: Json | null
          contract_length_months?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          listing_id?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          submitted_at?: string
          wage_offer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transfer_bids_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "transfer_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_listings: {
        Row: {
          asking_price: number
          auto_accept_price: number | null
          contract_length_months: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          listed_by_team_id: string
          listing_type: string
          min_price: number | null
          player_id: string
          updated_at: string
        }
        Insert: {
          asking_price: number
          auto_accept_price?: number | null
          contract_length_months?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          listed_by_team_id: string
          listing_type?: string
          min_price?: number | null
          player_id: string
          updated_at?: string
        }
        Update: {
          asking_price?: number
          auto_accept_price?: number | null
          contract_length_months?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          listed_by_team_id?: string
          listing_type?: string
          min_price?: number | null
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transfer_listings_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_windows: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          season: string
          start_date: string
          updated_at: string
          window_type: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          season?: string
          start_date: string
          updated_at?: string
          window_type?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          season?: string
          start_date?: string
          updated_at?: string
          window_type?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          announcement: string | null
          bonus_clauses: Json | null
          buy_option_fee: number | null
          completed_at: string
          contract_length_months: number | null
          created_at: string
          from_team_id: string
          id: string
          loan_end_date: string | null
          player_id: string
          season: string
          to_team_id: string
          transfer_fee: number
          transfer_type: string
          transfer_window_id: string | null
          wage_per_week: number | null
        }
        Insert: {
          announcement?: string | null
          bonus_clauses?: Json | null
          buy_option_fee?: number | null
          completed_at?: string
          contract_length_months?: number | null
          created_at?: string
          from_team_id: string
          id?: string
          loan_end_date?: string | null
          player_id: string
          season?: string
          to_team_id: string
          transfer_fee?: number
          transfer_type?: string
          transfer_window_id?: string | null
          wage_per_week?: number | null
        }
        Update: {
          announcement?: string | null
          bonus_clauses?: Json | null
          buy_option_fee?: number | null
          completed_at?: string
          contract_length_months?: number | null
          created_at?: string
          from_team_id?: string
          id?: string
          loan_end_date?: string | null
          player_id?: string
          season?: string
          to_team_id?: string
          transfer_fee?: number
          transfer_type?: string
          transfer_window_id?: string | null
          wage_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transfers_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_window"
            columns: ["transfer_window_id"]
            isOneToOne: false
            referencedRelation: "transfer_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          alpaca_key_id: string | null
          alpaca_secret_key: string | null
          created_at: string
          crypto_trading_enabled: boolean | null
          default_currency: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          is_paper_trading: boolean
          options_trading_enabled: boolean | null
          order_notifications: boolean | null
          price_alerts: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          theme_preference: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          alpaca_key_id?: string | null
          alpaca_secret_key?: string | null
          created_at?: string
          crypto_trading_enabled?: boolean | null
          default_currency?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          is_paper_trading?: boolean
          options_trading_enabled?: boolean | null
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          alpaca_key_id?: string | null
          alpaca_secret_key?: string | null
          created_at?: string
          crypto_trading_enabled?: boolean | null
          default_currency?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          is_paper_trading?: boolean
          options_trading_enabled?: boolean | null
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          available: boolean
          brand: string
          category: string
          color: string
          created_at: string
          fuel_type: string
          id: string
          image_url: string | null
          images: string[] | null
          license_plate: string
          location: string
          model: string
          price_per_day: number
          seats: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          available?: boolean
          brand: string
          category: string
          color: string
          created_at?: string
          fuel_type: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          license_plate: string
          location: string
          model: string
          price_per_day: number
          seats: number
          transmission: string
          updated_at?: string
          year: number
        }
        Update: {
          available?: boolean
          brand?: string
          category?: string
          color?: string
          created_at?: string
          fuel_type?: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          license_plate?: string
          location?: string
          model?: string
          price_per_day?: number
          seats?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          user_identifier: string
          action_type: string
          max_actions?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
      enhanced_rate_limit_check: {
        Args: {
          user_identifier: string
          action_type: string
          max_actions?: number
          time_window_minutes?: number
          strict_mode?: boolean
        }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_unread_conversation_partners: {
        Args: { p_user_id: string }
        Returns: {
          sender_id: string
          sender_name: string
          unread_count: number
          latest_message: string
          latest_message_time: string
        }[]
      }
      get_unread_private_message_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_private_messages_as_read: {
        Args: { p_sender_id: string; p_receiver_id: string }
        Returns: number
      }
      validate_message_content: {
        Args: { content: string }
        Returns: boolean
      }
    }
    Enums: {
      reservation_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      user_role: "admin" | "user"
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
      reservation_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
