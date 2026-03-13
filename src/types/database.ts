// Generated Supabase database types.
// Replace this with the output of `npx supabase gen types typescript --project-id your-project-id`
// See: https://supabase.com/docs/guides/api/rest/generating-types

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
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'premium'
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'premium'
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
      subscription_tier: 'free' | 'pro' | 'premium'
    }
  }
}
