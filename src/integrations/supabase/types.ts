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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      calibration_records: {
        Row: {
          calibration_date: string
          calibration_request_id: string | null
          calibration_result: string | null
          certificate_file_url: string | null
          certificate_number: string | null
          created_at: string
          equipment_id: string
          id: string
          is_passed: boolean | null
          next_due_date: string | null
          notes: string | null
          performed_by: string
        }
        Insert: {
          calibration_date: string
          calibration_request_id?: string | null
          calibration_result?: string | null
          certificate_file_url?: string | null
          certificate_number?: string | null
          created_at?: string
          equipment_id: string
          id?: string
          is_passed?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          performed_by: string
        }
        Update: {
          calibration_date?: string
          calibration_request_id?: string | null
          calibration_result?: string | null
          certificate_file_url?: string | null
          certificate_number?: string | null
          created_at?: string
          equipment_id?: string
          id?: string
          is_passed?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibration_records_calibration_request_id_fkey"
            columns: ["calibration_request_id"]
            isOneToOne: false
            referencedRelation: "calibration_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibration_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibration_records_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      calibration_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          equipment_id: string
          id: string
          notes: string | null
          priority: number | null
          request_date: string
          requested_by: string
          status: Database["public"]["Enums"]["calibration_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          equipment_id: string
          id?: string
          notes?: string | null
          priority?: number | null
          request_date?: string
          requested_by: string
          status?: Database["public"]["Enums"]["calibration_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          priority?: number | null
          request_date?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["calibration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibration_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "calibration_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibration_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["equipment_category_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["equipment_category_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["equipment_category_type"]
        }
        Relationships: []
      }
      equipment: {
        Row: {
          barcode: string
          brand: string | null
          category_id: string | null
          created_at: string
          hospital_name: string | null
          id: string
          location: string | null
          model: string | null
          name: string
          photo_url: string | null
          price: number | null
          purchase_date: string | null
          serial_number: string
          specifications: Json | null
          status: Database["public"]["Enums"]["equipment_status"]
          tenant_id: string
          updated_at: string
          warranty_date: string | null
        }
        Insert: {
          barcode: string
          brand?: string | null
          category_id?: string | null
          created_at?: string
          hospital_name?: string | null
          id?: string
          location?: string | null
          model?: string | null
          name: string
          photo_url?: string | null
          price?: number | null
          purchase_date?: string | null
          serial_number: string
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tenant_id: string
          updated_at?: string
          warranty_date?: string | null
        }
        Update: {
          barcode?: string
          brand?: string | null
          category_id?: string | null
          created_at?: string
          hospital_name?: string | null
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          photo_url?: string | null
          price?: number | null
          purchase_date?: string | null
          serial_number?: string
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tenant_id?: string
          updated_at?: string
          warranty_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          sent_at: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pm_records: {
        Row: {
          condition_after: string | null
          condition_before: string | null
          created_at: string
          date_performed: string
          findings: string | null
          id: string
          next_maintenance_date: string | null
          parts_replaced: Json | null
          performed_by: string
          photos: Json | null
          pm_schedule_id: string
          recommendations: string | null
        }
        Insert: {
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string
          date_performed?: string
          findings?: string | null
          id?: string
          next_maintenance_date?: string | null
          parts_replaced?: Json | null
          performed_by: string
          photos?: Json | null
          pm_schedule_id: string
          recommendations?: string | null
        }
        Update: {
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string
          date_performed?: string
          findings?: string | null
          id?: string
          next_maintenance_date?: string | null
          parts_replaced?: Json | null
          performed_by?: string
          photos?: Json | null
          pm_schedule_id?: string
          recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_records_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pm_records_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "pm_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schedules: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          equipment_id: string
          frequency_months: number
          id: string
          notes: string | null
          priority: number | null
          scheduled_date: string
          status: Database["public"]["Enums"]["pm_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          equipment_id: string
          frequency_months?: number
          id?: string
          notes?: string | null
          priority?: number | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["pm_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          equipment_id?: string
          frequency_months?: number
          id?: string
          notes?: string | null
          priority?: number | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["pm_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_schedules_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pm_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pm_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          nama_lengkap: string
          name: string
          no_hp: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nama_lengkap: string
          name: string
          no_hp?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nama_lengkap?: string
          name?: string
          no_hp?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          alamat: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          contact: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          nama_perusahaan: string
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          alamat?: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          contact?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nama_perusahaan: string
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          alamat?: string | null
          company_type?: Database["public"]["Enums"]["company_type"]
          contact?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nama_perusahaan?: string
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          whatsapp?: string | null
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
      current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_barcode: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_super_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_mitra"
        | "teknisi_mitra"
        | "admin_klien"
        | "operator_klien"
      calibration_status: "pending" | "approved" | "rejected" | "completed"
      company_type:
        | "Mitra Penyedia (Kalibrasi)"
        | "Mitra Penyedia (Barang & Jasa)"
        | "Klien Rumah Sakit/Perusahaan"
      equipment_category_type: "medis" | "umum"
      equipment_status: "active" | "inactive" | "maintenance" | "retired"
      notification_channel: "email" | "whatsapp" | "in_app"
      pm_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "overdue"
        | "cancelled"
      tenant_type: "rumah_sakit" | "perusahaan"
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
      app_role: [
        "super_admin",
        "admin_mitra",
        "teknisi_mitra",
        "admin_klien",
        "operator_klien",
      ],
      calibration_status: ["pending", "approved", "rejected", "completed"],
      company_type: [
        "Mitra Penyedia (Kalibrasi)",
        "Mitra Penyedia (Barang & Jasa)",
        "Klien Rumah Sakit/Perusahaan",
      ],
      equipment_category_type: ["medis", "umum"],
      equipment_status: ["active", "inactive", "maintenance", "retired"],
      notification_channel: ["email", "whatsapp", "in_app"],
      pm_status: [
        "pending",
        "in_progress",
        "completed",
        "overdue",
        "cancelled",
      ],
      tenant_type: ["rumah_sakit", "perusahaan"],
    },
  },
} as const
