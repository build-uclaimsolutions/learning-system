import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const getSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
      }
      learning_goals: {
        Row: {
          id: string
          user_id: string
          goal: string
          curriculum: string
          status: 'in_progress' | 'completed' | 'paused'
          created_at: string
        }
        Insert: {
          user_id: string
          goal: string
          curriculum: string
          status?: 'in_progress' | 'completed' | 'paused'
        }
      }
      summaries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          source_url: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          content: string
          source_url?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          summary_id: string
          exercise_text: string
          completed: boolean
          completed_at: string | null
        }
        Insert: {
          summary_id: string
          exercise_text: string
          completed?: boolean
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          topic: string
          level: 'beginner' | 'intermediate' | 'advanced'
          completed_date: string
        }
        Insert: {
          user_id: string
          topic: string
          level?: 'beginner' | 'intermediate' | 'advanced'
          completed_date?: string
        }
      }
      synthesis: {
        Row: {
          id: string
          user_id: string
          week: number
          summary_text: string
          takeaways: string[]
          created_at: string
        }
        Insert: {
          user_id: string
          week: number
          summary_text: string
          takeaways: string[]
        }
      }
    }
  }
}
