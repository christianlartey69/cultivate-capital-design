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
      asset_media: {
        Row: {
          asset_id: string
          created_at: string | null
          description: string | null
          id: string
          media_type: string
          media_url: string
          title: string | null
          uploaded_at: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          media_type: string
          media_url: string
          title?: string | null
          uploaded_at?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          media_type?: string
          media_url?: string
          title?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_media_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string | null
          current_phase: string | null
          expected_end_date: string
          farm_location: string | null
          id: string
          investor_id: string
          package_id: string
          purchase_amount: number
          purchase_date: string | null
          start_date: string | null
          status: string | null
          thumbnail_url: string | null
          unique_tag_id: string
          updated_at: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string | null
          current_phase?: string | null
          expected_end_date: string
          farm_location?: string | null
          id?: string
          investor_id: string
          package_id: string
          purchase_amount: number
          purchase_date?: string | null
          start_date?: string | null
          status?: string | null
          thumbnail_url?: string | null
          unique_tag_id: string
          updated_at?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          current_phase?: string | null
          expected_end_date?: string
          farm_location?: string | null
          id?: string
          investor_id?: string
          package_id?: string
          purchase_amount?: number
          purchase_date?: string | null
          start_date?: string | null
          status?: string | null
          thumbnail_url?: string | null
          unique_tag_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "investment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          asset_id: string | null
          created_at: string | null
          id: string
          investor_id: string
          message: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          id?: string
          investor_id: string
          message: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          id?: string
          investor_id?: string
          message?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_visits: {
        Row: {
          asset_id: string | null
          confirmation_sent: boolean | null
          created_at: string | null
          id: string
          investor_id: string
          number_of_guests: number | null
          special_requests: string | null
          status: string | null
          updated_at: string | null
          visit_date: string
          visit_time: string
        }
        Insert: {
          asset_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          id?: string
          investor_id: string
          number_of_guests?: number | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date: string
          visit_time: string
        }
        Update: {
          asset_id?: string | null
          confirmation_sent?: boolean | null
          created_at?: string | null
          id?: string
          investor_id?: string
          number_of_guests?: number | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_visits_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_visits_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_packages: {
        Row: {
          business_type: string
          created_at: string
          description: string
          duration_months: number
          expected_roi_max: number
          expected_roi_min: number
          id: string
          is_active: boolean | null
          min_investment: number
          name: string
          updated_at: string
        }
        Insert: {
          business_type: string
          created_at?: string
          description: string
          duration_months: number
          expected_roi_max: number
          expected_roi_min: number
          id?: string
          is_active?: boolean | null
          min_investment: number
          name: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          created_at?: string
          description?: string
          duration_months?: number
          expected_roi_max?: number
          expected_roi_min?: number
          id?: string
          is_active?: boolean | null
          min_investment?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          actual_roi: number | null
          amount: number
          created_at: string
          id: string
          investor_id: string
          maturity_date: string
          package_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_roi?: number | null
          amount: number
          created_at?: string
          id?: string
          investor_id: string
          maturity_date: string
          package_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_roi?: number | null
          amount?: number
          created_at?: string
          id?: string
          investor_id?: string
          maturity_date?: string
          package_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "investment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          id: string
          media_type: string | null
          media_url: string | null
          package_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          package_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          package_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "investment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alternate_payout_method: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          billing_address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          id_number: string | null
          id_photo_back_url: string | null
          id_photo_front_url: string | null
          id_type: string | null
          last_name: string | null
          marketing_consent: boolean | null
          middle_name: string | null
          mobile_money_number: string | null
          mobile_money_provider: string | null
          onboarding_completed: boolean | null
          phone: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          primary_phone: string | null
          profile_picture_url: string | null
          region: string | null
          residential_address: string | null
          selfie_with_id_url: string | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          alternate_payout_method?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          id_number?: string | null
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
          id_type?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          middle_name?: string | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          primary_phone?: string | null
          profile_picture_url?: string | null
          region?: string | null
          residential_address?: string | null
          selfie_with_id_url?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          alternate_payout_method?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          billing_address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          id_photo_back_url?: string | null
          id_photo_front_url?: string | null
          id_type?: string | null
          last_name?: string | null
          marketing_consent?: boolean | null
          middle_name?: string | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          primary_phone?: string | null
          profile_picture_url?: string | null
          region?: string | null
          residential_address?: string | null
          selfie_with_id_url?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
