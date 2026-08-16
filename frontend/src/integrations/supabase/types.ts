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
      discovery_calls: {
        Row: {
          booking_link: string | null
          created_at: string
          id: string
          lead_id: string | null
          meeting_date: string | null
          meeting_status: string | null
          platform: string | null
          post_call_summary: string | null
          pre_call_brief: Json | null
          user_id: string
        }
        Insert: {
          booking_link?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          meeting_date?: string | null
          meeting_status?: string | null
          platform?: string | null
          post_call_summary?: string | null
          pre_call_brief?: Json | null
          user_id: string
        }
        Update: {
          booking_link?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          meeting_date?: string | null
          meeting_status?: string | null
          platform?: string | null
          post_call_summary?: string | null
          pre_call_brief?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          campaign_name: string | null
          channel: string | null
          created_at: string
          due_date: string | null
          followup_type: string | null
          id: string
          lead_id: string | null
          message: string | null
          status: string | null
          step_number: number | null
          user_id: string
        }
        Insert: {
          campaign_name?: string | null
          channel?: string | null
          created_at?: string
          due_date?: string | null
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
          status?: string | null
          step_number?: number | null
          user_id: string
        }
        Update: {
          campaign_name?: string | null
          channel?: string | null
          created_at?: string
          due_date?: string | null
          followup_type?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
          status?: string | null
          step_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          interest: string | null
          lead_score: string | null
          name: string
          notes: string | null
          phone: string | null
          product_interest: string | null
          sector: string | null
          source: string | null
          status: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          lead_score?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          sector?: string | null
          source?: string | null
          status?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          lead_score?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          sector?: string | null
          source?: string | null
          status?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          ai_report: Json | null
          business_goal: string | null
          business_stage: string | null
          certifications: string | null
          created_at: string
          hs_code: string | null
          id: string
          monthly_capacity: string | null
          price_range: string | null
          product_description: string | null
          product_name: string | null
          sector: string | null
          source_country: string | null
          target_buyer_type: string | null
          target_country: string | null
          user_id: string
          website_link: string | null
        }
        Insert: {
          ai_report?: Json | null
          business_goal?: string | null
          business_stage?: string | null
          certifications?: string | null
          created_at?: string
          hs_code?: string | null
          id?: string
          monthly_capacity?: string | null
          price_range?: string | null
          product_description?: string | null
          product_name?: string | null
          sector?: string | null
          source_country?: string | null
          target_buyer_type?: string | null
          target_country?: string | null
          user_id: string
          website_link?: string | null
        }
        Update: {
          ai_report?: Json | null
          business_goal?: string | null
          business_stage?: string | null
          certifications?: string | null
          created_at?: string
          hs_code?: string | null
          id?: string
          monthly_capacity?: string | null
          price_range?: string | null
          product_description?: string | null
          product_name?: string | null
          sector?: string | null
          source_country?: string | null
          target_buyer_type?: string | null
          target_country?: string | null
          user_id?: string
          website_link?: string | null
        }
        Relationships: []
      }
      outreach_messages: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          lead_id: string | null
          message: string | null
          scheduled_date: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          message?: string | null
          scheduled_date?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          message?: string | null
          scheduled_date?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profile: {
        Row: {
          business_type: string | null
          calendly_link: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email_signature: string | null
          full_name: string | null
          google_calendar_link: string | null
          id: string
          products_services: string | null
          sector: string | null
          target_countries: string | null
          topmate_link: string | null
          updated_at: string
          user_id: string
          zoom_link: string | null
        }
        Insert: {
          business_type?: string | null
          calendly_link?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email_signature?: string | null
          full_name?: string | null
          google_calendar_link?: string | null
          id?: string
          products_services?: string | null
          sector?: string | null
          target_countries?: string | null
          topmate_link?: string | null
          updated_at?: string
          user_id: string
          zoom_link?: string | null
        }
        Update: {
          business_type?: string | null
          calendly_link?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email_signature?: string | null
          full_name?: string | null
          google_calendar_link?: string | null
          id?: string
          products_services?: string | null
          sector?: string | null
          target_countries?: string | null
          topmate_link?: string | null
          updated_at?: string
          user_id?: string
          zoom_link?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
