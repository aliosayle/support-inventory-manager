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
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          password_hash: string
          role: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          role?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string
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
        Relationships: []
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
        }
        Insert: {
          assigned_to?: string | null
          date?: string | null
          id?: string
          issue_id?: string | null
          notes?: string | null
          quantity: number
          stock_item_id: string
        }
        Update: {
          assigned_to?: string | null
          date?: string | null
          id?: string
          issue_id?: string | null
          notes?: string | null
          quantity?: number
          stock_item_id?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Enums: {
      issue_severity: "low" | "medium" | "high"
      issue_status: "submitted" | "in-progress" | "resolved" | "escalated"
      issue_type: "hardware" | "software" | "network"
      stock_status: "available" | "in-use" | "repair" | "disposed"
      user_role: "admin" | "employee" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
