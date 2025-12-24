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
      admins: {
        Row: {
          brand_scope: Database["public"]["Enums"]["brand_type"] | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          location_scope: string | null
          name: string
          role: Database["public"]["Enums"]["admin_role"]
          session_token: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_scope?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          location_scope?: string | null
          name: string
          role?: Database["public"]["Enums"]["admin_role"]
          session_token?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_scope?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          location_scope?: string | null
          name?: string
          role?: Database["public"]["Enums"]["admin_role"]
          session_token?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_location_scope_fkey"
            columns: ["location_scope"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action"]
          admin_id: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action"]
          admin_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action"]
          admin_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bonus_points_rules: Json | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          members_reached: number | null
          message_ar: string | null
          message_en: string | null
          name: string
          name_ar: string | null
          points_issued: number | null
          segment_rules_json: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
          visits_generated: number | null
        }
        Insert: {
          bonus_points_rules?: Json | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          members_reached?: number | null
          message_ar?: string | null
          message_en?: string | null
          name: string
          name_ar?: string | null
          points_issued?: number | null
          segment_rules_json?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
          visits_generated?: number | null
        }
        Update: {
          bonus_points_rules?: Json | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          members_reached?: number | null
          message_ar?: string | null
          message_en?: string | null
          name?: string
          name_ar?: string | null
          points_issued?: number | null
          segment_rules_json?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
          visits_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          brand: Database["public"]["Enums"]["brand_type"]
          city: Database["public"]["Enums"]["location_city"]
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          brand: Database["public"]["Enums"]["brand_type"]
          city: Database["public"]["Enums"]["location_city"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          brand?: Database["public"]["Enums"]["brand_type"]
          city?: Database["public"]["Enums"]["location_city"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      member_auth: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_auth_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_tiers: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          member_id: string
          override_flag: boolean | null
          override_reason: string | null
          tier_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          member_id: string
          override_flag?: boolean | null
          override_reason?: string | null
          tier_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          member_id?: string
          override_flag?: boolean | null
          override_reason?: string | null
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_tiers_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_tiers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_tiers_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          brand_affinity: Database["public"]["Enums"]["brand_type"] | null
          city: Database["public"]["Enums"]["location_city"]
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          preferred_language:
            | Database["public"]["Enums"]["language_pref"]
            | null
          status: Database["public"]["Enums"]["member_status"] | null
          total_points: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          brand_affinity?: Database["public"]["Enums"]["brand_type"] | null
          city?: Database["public"]["Enums"]["location_city"]
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          preferred_language?:
            | Database["public"]["Enums"]["language_pref"]
            | null
          status?: Database["public"]["Enums"]["member_status"] | null
          total_points?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_affinity?: Database["public"]["Enums"]["brand_type"] | null
          city?: Database["public"]["Enums"]["location_city"]
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_language?:
            | Database["public"]["Enums"]["language_pref"]
            | null
          status?: Database["public"]["Enums"]["member_status"] | null
          total_points?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          balance_after: number
          created_at: string | null
          created_by: string | null
          id: string
          member_id: string
          points_delta: number
          reason: string
          reference_id: string | null
          reference_type: Database["public"]["Enums"]["points_ref_type"]
        }
        Insert: {
          balance_after?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id: string
          points_delta: number
          reason: string
          reference_id?: string | null
          reference_type: Database["public"]["Enums"]["points_ref_type"]
        }
        Update: {
          balance_after?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id?: string
          points_delta?: number
          reason?: string
          reference_id?: string | null
          reference_type?: Database["public"]["Enums"]["points_ref_type"]
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      points_rules: {
        Row: {
          brand: Database["public"]["Enums"]["brand_type"] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          points_per_visit: number | null
          updated_at: string | null
        }
        Insert: {
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_per_visit?: number | null
          updated_at?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_per_visit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code_or_qr: string | null
          created_at: string | null
          decline_reason: string | null
          declined_at: string | null
          declined_by: string | null
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          member_id: string
          notes: string | null
          points_spent: number
          requested_at: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code_or_qr?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          member_id: string
          notes?: string | null
          points_spent: number
          requested_at?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code_or_qr?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          points_spent?: number
          requested_at?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_declined_by_fkey"
            columns: ["declined_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_fulfilled_by_fkey"
            columns: ["fulfilled_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          brand_scope: Database["public"]["Enums"]["brand_type"] | null
          created_at: string | null
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          per_member_limit: number | null
          points_cost: number
          stock_limit: number | null
          terms_ar: string | null
          terms_en: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          validity_end: string | null
          validity_start: string | null
        }
        Insert: {
          brand_scope?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          per_member_limit?: number | null
          points_cost: number
          stock_limit?: number | null
          terms_ar?: string | null
          terms_en?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          validity_end?: string | null
          validity_start?: string | null
        }
        Update: {
          brand_scope?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          per_member_limit?: number | null
          points_cost?: number
          stock_limit?: number | null
          terms_ar?: string | null
          terms_en?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          validity_end?: string | null
          validity_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      sevenrooms_sync: {
        Row: {
          created_at: string
          id: string
          last_synced_at: string | null
          member_id: string | null
          sevenrooms_client_id: string | null
          sync_direction: string
          sync_error: string | null
          sync_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          member_id?: string | null
          sevenrooms_client_id?: string | null
          sync_direction?: string
          sync_error?: string | null
          sync_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          member_id?: string | null
          sevenrooms_client_id?: string | null
          sync_direction?: string
          sync_error?: string | null
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sevenrooms_sync_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sevenrooms_sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sevenrooms_sync_logs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      tiers: {
        Row: {
          benefits_text_ar: string | null
          benefits_text_en: string | null
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          min_points: number | null
          min_visits: number
          name: string
          name_ar: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          benefits_text_ar?: string | null
          benefits_text_en?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_points?: number | null
          min_visits?: number
          name: string
          name_ar?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          benefits_text_ar?: string | null
          benefits_text_en?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_points?: number | null
          min_visits?: number
          name?: string
          name_ar?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: {
          brand: Database["public"]["Enums"]["brand_type"]
          created_at: string | null
          created_by: string | null
          id: string
          is_voided: boolean | null
          location_id: string | null
          member_id: string
          notes: string | null
          source: Database["public"]["Enums"]["visit_source"] | null
          visit_datetime: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_voided?: boolean | null
          location_id?: string | null
          member_id: string
          notes?: string | null
          source?: Database["public"]["Enums"]["visit_source"] | null
          visit_datetime?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_voided?: boolean | null
          location_id?: string | null
          member_id?: string
          notes?: string | null
          source?: Database["public"]["Enums"]["visit_source"] | null
          visit_datetime?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_has_role: {
        Args: {
          _roles: Database["public"]["Enums"]["admin_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      check_admin_email: { Args: { admin_email: string }; Returns: boolean }
      get_admin_id: { Args: { _user_id: string }; Returns: string }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_member_id: { Args: { _user_id: string }; Returns: string }
      get_my_admin_info: {
        Args: never
        Returns: {
          email: string
          id: string
          name: string
          role: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "manager" | "viewer"
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "export"
        | "import"
        | "approve"
        | "decline"
        | "fulfill"
        | "cancel"
        | "block"
        | "unblock"
        | "merge"
        | "tier_override"
        | "points_adjust"
        | "password_change"
        | "role_change"
      brand_type: "noir" | "sasso" | "both"
      campaign_status: "draft" | "active" | "paused" | "completed"
      language_pref: "ar" | "en"
      location_city: "doha" | "riyadh"
      member_status: "active" | "blocked"
      points_ref_type:
        | "visit"
        | "redemption"
        | "manual"
        | "import"
        | "campaign"
        | "birthday"
        | "bonus"
      redemption_status:
        | "requested"
        | "approved"
        | "declined"
        | "fulfilled"
        | "cancelled"
      visit_source: "manual" | "qr" | "pos" | "import"
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
      admin_role: ["super_admin", "admin", "manager", "viewer"],
      audit_action: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "export",
        "import",
        "approve",
        "decline",
        "fulfill",
        "cancel",
        "block",
        "unblock",
        "merge",
        "tier_override",
        "points_adjust",
        "password_change",
        "role_change",
      ],
      brand_type: ["noir", "sasso", "both"],
      campaign_status: ["draft", "active", "paused", "completed"],
      language_pref: ["ar", "en"],
      location_city: ["doha", "riyadh"],
      member_status: ["active", "blocked"],
      points_ref_type: [
        "visit",
        "redemption",
        "manual",
        "import",
        "campaign",
        "birthday",
        "bonus",
      ],
      redemption_status: [
        "requested",
        "approved",
        "declined",
        "fulfilled",
        "cancelled",
      ],
      visit_source: ["manual", "qr", "pos", "import"],
    },
  },
} as const
