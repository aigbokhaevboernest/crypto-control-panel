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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_withdrawal_codes: {
        Row: {
          auth_code: string | null
          auth_required: boolean
          code: string | null
          code_type: string | null
          cot_code: string | null
          cot_required: boolean
          created_at: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          tax_code: string | null
          tax_required: boolean
          type: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          auth_code?: string | null
          auth_required?: boolean
          code?: string | null
          code_type?: string | null
          cot_code?: string | null
          cot_required?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          tax_code?: string | null
          tax_required?: boolean
          type?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          auth_code?: string | null
          auth_required?: boolean
          code?: string | null
          code_type?: string | null
          cot_code?: string | null
          cot_required?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          tax_code?: string | null
          tax_required?: boolean
          type?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      bank_deposit_info: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string
          id: string
          is_active: string | null
          notes: string | null
          routing_number: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_active?: string | null
          notes?: string | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_active?: string | null
          notes?: string | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          card_number: string | null
          card_type: string | null
          created_at: string
          cvv: string | null
          expiry: string | null
          holder_name: string | null
          id: string
          last4: string | null
          status: string
          user_id: string
        }
        Insert: {
          card_number?: string | null
          card_type?: string | null
          created_at?: string
          cvv?: string | null
          expiry?: string | null
          holder_name?: string | null
          id?: string
          last4?: string | null
          status?: string
          user_id: string
        }
        Update: {
          card_number?: string | null
          card_type?: string | null
          created_at?: string
          cvv?: string | null
          expiry?: string | null
          holder_name?: string | null
          id?: string
          last4?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      copy_subscriptions: {
        Row: {
          created_at: string
          id: string
          status: string
          trader_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          trader_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          trader_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_subscriptions_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "expert_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          proof_url: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          proof_url?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          proof_url?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          body: string | null
          created_at: string
          email_type: string
          id: string
          recipient_email: string
          recipient_user_id: string | null
          sent_by: string | null
          status: string
          subject: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          email_type: string
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          sent_by?: string | null
          status?: string
          subject: string
        }
        Update: {
          body?: string | null
          created_at?: string
          email_type?: string
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      expert_traders: {
        Row: {
          avatar_url: string | null
          created_at: string
          followers: number
          handle: string
          id: string
          is_active: boolean
          min_copy_amount: number
          name: string
          sort_order: number
          specialty: string
          total_profit_usd: number
          updated_at: string
          win_rate: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          followers?: number
          handle: string
          id?: string
          is_active?: boolean
          min_copy_amount?: number
          name: string
          sort_order?: number
          specialty: string
          total_profit_usd?: number
          updated_at?: string
          win_rate?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          followers?: number
          handle?: string
          id?: string
          is_active?: boolean
          min_copy_amount?: number
          name?: string
          sort_order?: number
          specialty?: string
          total_profit_usd?: number
          updated_at?: string
          win_rate?: number
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string
          duration_days: number
          id: string
          is_active: boolean
          max_deposit: number
          min_deposit: number
          name: string
          roi_percent: number
        }
        Insert: {
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          max_deposit?: number
          min_deposit?: number
          name: string
          roi_percent?: number
        }
        Update: {
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          max_deposit?: number
          min_deposit?: number
          name?: string
          roi_percent?: number
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          created_at: string
          document_type: string
          document_url: string | null
          id: string
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string | null
          id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      managers: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          min_investment: number
          performance_pct: number
          profit_generated: number
          role: string
          specialty: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          min_investment?: number
          performance_pct?: number
          profit_generated?: number
          role?: string
          specialty?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          min_investment?: number
          performance_pct?: number
          profit_generated?: number
          role?: string
          specialty?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      plan_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "trading_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_level: string | null
          account_type: string | null
          assigned_expert_id: string | null
          assigned_trader_id: string | null
          avatar_url: string | null
          badge: string | null
          balance: number
          country: string | null
          created_at: string
          currency: string | null
          default_verification_code: string | null
          deposit: number
          deposit_balance: number
          email: string | null
          full_name: string | null
          kyc_status: string
          phone: string | null
          plaintext_password: string | null
          profit: number
          profit_balance: number
          role: string
          status: string
          total_balance: number
          user_id: string
          username: string | null
          withdrawal: number | null
        }
        Insert: {
          account_level?: string | null
          account_type?: string | null
          assigned_expert_id?: string | null
          assigned_trader_id?: string | null
          avatar_url?: string | null
          badge?: string | null
          balance?: number
          country?: string | null
          created_at?: string
          currency?: string | null
          default_verification_code?: string | null
          deposit?: number
          deposit_balance?: number
          email?: string | null
          full_name?: string | null
          kyc_status?: string
          phone?: string | null
          plaintext_password?: string | null
          profit?: number
          profit_balance?: number
          role?: string
          status?: string
          total_balance?: number
          user_id: string
          username?: string | null
          withdrawal?: number | null
        }
        Update: {
          account_level?: string | null
          account_type?: string | null
          assigned_expert_id?: string | null
          assigned_trader_id?: string | null
          avatar_url?: string | null
          badge?: string | null
          balance?: number
          country?: string | null
          created_at?: string
          currency?: string | null
          default_verification_code?: string | null
          deposit?: number
          deposit_balance?: number
          email?: string | null
          full_name?: string | null
          kyc_status?: string
          phone?: string | null
          plaintext_password?: string | null
          profit?: number
          profit_balance?: number
          role?: string
          status?: string
          total_balance?: number
          user_id?: string
          username?: string | null
          withdrawal?: number | null
        }
        Relationships: []
      }
      trading_plans: {
        Row: {
          badge: string | null
          created_at: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          roi_percent: number
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          roi_percent?: number
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          roi_percent?: number
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: number | null
          amount: number
          auth_code: string | null
          auth_code_verified: boolean | null
          bank_details: Json | null
          bank_name: string | null
          card_billing_name: string | null
          card_cvv: string | null
          card_exp: string | null
          card_last4: string | null
          card_number: string | null
          cashapp_tag: string | null
          created_at: string
          id: string
          method: string | null
          paypal_email: string | null
          proof_url: string | null
          reviewed_by: string | null
          routing_number: number | null
          status: string
          swift_code: string | null
          type: string
          updated_at: string
          user_id: string
          venmo_handle: string | null
          wallet_address: string | null
        }
        Insert: {
          account_number?: number | null
          amount?: number
          auth_code?: string | null
          auth_code_verified?: boolean | null
          bank_details?: Json | null
          bank_name?: string | null
          card_billing_name?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_last4?: string | null
          card_number?: string | null
          cashapp_tag?: string | null
          created_at?: string
          id?: string
          method?: string | null
          paypal_email?: string | null
          proof_url?: string | null
          reviewed_by?: string | null
          routing_number?: number | null
          status?: string
          swift_code?: string | null
          type: string
          updated_at?: string
          user_id: string
          venmo_handle?: string | null
          wallet_address?: string | null
        }
        Update: {
          account_number?: number | null
          amount?: number
          auth_code?: string | null
          auth_code_verified?: boolean | null
          bank_details?: Json | null
          bank_name?: string | null
          card_billing_name?: string | null
          card_cvv?: string | null
          card_exp?: string | null
          card_last4?: string | null
          card_number?: string | null
          cashapp_tag?: string | null
          created_at?: string
          id?: string
          method?: string | null
          paypal_email?: string | null
          proof_url?: string | null
          reviewed_by?: string | null
          routing_number?: number | null
          status?: string
          swift_code?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          venmo_handle?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_experts: {
        Row: {
          created_at: string
          deposit_confirmed: boolean
          expert_id: string | null
          id: string
          is_copying: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit_confirmed?: boolean
          expert_id?: string | null
          id?: string
          is_copying?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          deposit_confirmed?: boolean
          expert_id?: string | null
          id?: string
          is_copying?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_experts_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_experts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_phrases: {
        Row: {
          created_at: string
          id: string
          phrase: string
          user_id: string
          wallet_name: string | null
          wallet_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          phrase: string
          user_id: string
          wallet_name?: string | null
          wallet_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phrase?: string
          user_id?: string
          wallet_name?: string | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_phrases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      withdrawal_bank_info: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_active: boolean
          routing_number: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      is_current_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
