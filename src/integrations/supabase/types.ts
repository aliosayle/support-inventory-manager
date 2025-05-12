export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custom_users: {
        Row: {
          avatar: string | null
          company: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          password_hash: string
          permissions: string[] | null
          phone_number: string | null
          role: string
          site: string | null
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          permissions?: string[] | null
          phone_number?: string | null
          role?: string
          site?: string | null
        }
        Update: {
          avatar?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          permissions?: string[] | null
          phone_number?: string | null
          role?: string
          site?: string | null
        }
        Relationships: []
      }
      issue_comments: {
        Row: {
          created_at: string | null
          id: string
          issue_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_stock_items: {
        Row: {
          issue_id: string
          stock_item_id: string
        }
        Insert: {
          issue_id: string
          stock_item_id: string
        }
        Update: {
          issue_id?: string
          stock_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_stock_items_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_stock_items_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status: Database["public"]["Enums"]["issue_status"]
          submitted_by: string
          title: string
          type: Database["public"]["Enums"]["issue_type"]
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          submitted_by: string
          title: string
          type: Database["public"]["Enums"]["issue_type"]
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          submitted_by?: string
          title?: string
          type?: Database["public"]["Enums"]["issue_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "custom_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "custom_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          bon_number: string
          bon_signer: string
          created_at: string
          estimated_price: number | null
          id: string
          item_description: string | null
          item_name: string
          item_quantity: number
          notes: string | null
          status: Database["public"]["Enums"]["purchase_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bon_number: string
          bon_signer: string
          created_at?: string
          estimated_price?: number | null
          id?: string
          item_description?: string | null
          item_name: string
          item_quantity?: number
          notes?: string | null
          status?: Database["public"]["Enums"]["purchase_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bon_number?: string
          bon_signer?: string
          created_at?: string
          estimated_price?: number | null
          id?: string
          item_description?: string | null
          item_name?: string
          item_quantity?: number
          notes?: string | null
          status?: Database["public"]["Enums"]["purchase_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "custom_users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          category: string
          description: string | null
          id: string
          image: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          price: number | null
          purchase_date: string | null
          quantity: number
          serial_number: string | null
          status: Database["public"]["Enums"]["stock_status"]
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          image?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          price?: number | null
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["stock_status"]
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          image?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          price?: number | null
          purchase_date?: string | null
          quantity?: number
          serial_number?: string | null
          status?: Database["public"]["Enums"]["stock_status"]
        }
        Relationships: []
      }
      stock_usage: {
        Row: {
          assigned_to: string | null
          date: string | null
          id: string
          issue_id: string | null
          notes: string | null
          quantity: number
          stock_item_id: string
          transaction_type: string
        }
        Insert: {
          assigned_to?: string | null
          date?: string | null
          id?: string
          issue_id?: string | null
          notes?: string | null
          quantity: number
          stock_item_id: string
          transaction_type?: string
        }
        Update: {
          assigned_to?: string | null
          date?: string | null
          id?: string
          issue_id?: string | null
          notes?: string | null
          quantity?: number
          stock_item_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_usage_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "custom_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_usage_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_usage_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "stock_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_issue_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_issues: number
          open_issues: number
          resolved_issues: number
          avg_resolution_time: number
        }[]
      }
      get_issues_by_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: number
          count: number
        }[]
      }
      get_issues_by_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: Database["public"]["Enums"]["issue_status"]
          count: number
        }[]
      }
      get_issues_by_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          type: Database["public"]["Enums"]["issue_type"]
          count: number
        }[]
      }
      get_resolution_time_by_week: {
        Args: Record<PropertyKey, never>
        Returns: {
          week_number: number
          avg_hours: number
        }[]
      }
    }
    Enums: {
      issue_severity: "low" | "medium" | "high"
      issue_status: "submitted" | "in-progress" | "resolved" | "escalated"
      issue_type: "hardware" | "software" | "network"
      purchase_request_status: "pending" | "approved" | "rejected" | "purchased"
      stock_status: "available" | "in-use" | "repair" | "disposed"
      user_role: "admin" | "employee" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      issue_severity: ["low", "medium", "high"],
      issue_status: ["submitted", "in-progress", "resolved", "escalated"],
      issue_type: ["hardware", "software", "network"],
      purchase_request_status: ["pending", "approved", "rejected", "purchased"],
      stock_status: ["available", "in-use", "repair", "disposed"],
      user_role: ["admin", "employee", "user"],
    },
  },
} as const
