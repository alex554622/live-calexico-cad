
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      officers: {
        Row: {
          id: string
          name: string
          rank: string
          badge_number: number
          status: string
          department: string
          shift_schedule: string | null
          current_incident_id: string | null
          last_updated: string
          contact_info: Json | null
        }
        Insert: {
          id?: string
          name: string
          rank: string
          badge_number: number
          status?: string
          department: string
          shift_schedule?: string | null
          current_incident_id?: string | null
          last_updated?: string
          contact_info?: Json | null
        }
        Update: {
          id?: string
          name?: string
          rank?: string
          badge_number?: number
          status?: string
          department?: string
          shift_schedule?: string | null
          current_incident_id?: string | null
          last_updated?: string
          contact_info?: Json | null
        }
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          location: Json
          reported_at: string
          updated_at: string
          assigned_officers: string[]
          type: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          priority: string
          location: Json
          reported_at?: string
          updated_at?: string
          assigned_officers?: string[]
          type: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          location?: Json
          reported_at?: string
          updated_at?: string
          assigned_officers?: string[]
          type?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          timestamp: string
          read: boolean
          related_to: Json | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          timestamp?: string
          read?: boolean
          related_to?: Json | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          timestamp?: string
          read?: boolean
          related_to?: Json | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string
          name: string
          role: string
          avatar: string | null
          permissions: Json | null
        }
        Insert: {
          id: string
          username: string
          name: string
          role: string
          avatar?: string | null
          permissions?: Json | null
        }
        Update: {
          id?: string
          username?: string
          name?: string
          role?: string
          avatar?: string | null
          permissions?: Json | null
        }
      }
    }
  }
}
