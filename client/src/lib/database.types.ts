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
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'user'
        }
        Insert: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
      }
      tournaments: {
        Row: {
          id: string
          created_at: string
          name: string
          sport: string
          start_date: string
          end_date: string
          status: 'upcoming' | 'ongoing' | 'completed'
          created_by: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          sport: string
          start_date: string
          end_date: string
          status?: 'upcoming' | 'ongoing' | 'completed'
          created_by: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          sport?: string
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'ongoing' | 'completed'
          created_by?: string
          description?: string | null
        }
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
  }
} 