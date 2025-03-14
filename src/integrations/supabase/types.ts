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
      incident_officers: {
        Row: {
          assigned_at: string
          id: string
          incident_id: string
          officer_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          incident_id: string
          officer_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          incident_id?: string
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_officers_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_officers_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          description: string
          document_link: string | null
          id: string
          location_address: string
          location_lat: number
          location_lng: number
          priority: string
          reported_at: string
          reported_by: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          description: string
          document_link?: string | null
          id?: string
          location_address: string
          location_lat: number
          location_lng: number
          priority: string
          reported_at?: string
          reported_by: string
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          description?: string
          document_link?: string | null
          id?: string
          location_address?: string
          location_lat?: number
          location_lng?: number
          priority?: string
          reported_at?: string
          reported_by?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          message: string
          read: boolean
          related_to_id: string | null
          related_to_type: string | null
          timestamp: string
          title: string
          type: string
        }
        Insert: {
          id?: string
          message: string
          read?: boolean
          related_to_id?: string | null
          related_to_type?: string | null
          timestamp?: string
          title: string
          type: string
        }
        Update: {
          id?: string
          message?: string
          read?: boolean
          related_to_id?: string | null
          related_to_type?: string | null
          timestamp?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      officer_assignments: {
        Row: {
          assigned_at: string
          assignment_name: string
          id: string
          officer_id: string
        }
        Insert: {
          assigned_at?: string
          assignment_name: string
          id?: string
          officer_id: string
        }
        Update: {
          assigned_at?: string
          assignment_name?: string
          id?: string
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "officer_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      officers: {
        Row: {
          badge_number: string
          contact_email: string | null
          contact_phone: string | null
          current_incident_id: string | null
          department: string
          id: string
          last_updated: string
          location_lat: number | null
          location_lng: number | null
          name: string
          rank: string
          shift_schedule: string | null
          status: string
        }
        Insert: {
          badge_number: string
          contact_email?: string | null
          contact_phone?: string | null
          current_incident_id?: string | null
          department: string
          id?: string
          last_updated?: string
          location_lat?: number | null
          location_lng?: number | null
          name: string
          rank: string
          shift_schedule?: string | null
          status: string
        }
        Update: {
          badge_number?: string
          contact_email?: string | null
          contact_phone?: string | null
          current_incident_id?: string | null
          department?: string
          id?: string
          last_updated?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          rank?: string
          shift_schedule?: string | null
          status?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name: string
          password: string
          role: string
          username: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          password: string
          role: string
          username: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          password?: string
          role?: string
          username?: string
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
