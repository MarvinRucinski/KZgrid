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
      categories: {
        Row: {
          id: string
          name: string
          type: 'row' | 'column'
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'row' | 'column'
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'row' | 'column'
          position?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          photo_url?: string | null
          created_at?: string
        }
      }
      user_categories: {
        Row: {
          id: string
          user_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          created_at?: string
        }
      }
      grid_games: {
        Row: {
          id: string
          created_at: string
          row_categories: string[]
          column_categories: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          row_categories: string[]
          column_categories: string[]
        }
        Update: {
          id?: string
          created_at?: string
          row_categories?: string[]
          column_categories?: string[]
        }
      }
      answer_statistics: {
        Row: {
          id: string
          user_id: string
          row_category_id: string
          column_category_id: string
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          row_category_id: string
          column_category_id: string
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          row_category_id?: string
          column_category_id?: string
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
