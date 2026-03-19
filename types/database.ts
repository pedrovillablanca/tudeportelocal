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
      regions: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      communes: {
        Row: {
          id: string
          name: string
          region_id: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          region_id: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          region_id?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      sports: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          region_id: string
          commune_id: string
          address: string | null
          instagram_url: string | null
          facebook_url: string | null
          contact_email: string
          contact_phone: string | null
          status: 'pending' | 'active' | 'inactive' | 'rejected'
          is_featured: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          region_id: string
          commune_id: string
          address?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          contact_email: string
          contact_phone?: string | null
          status?: 'pending' | 'active' | 'inactive' | 'rejected'
          is_featured?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          region_id?: string
          commune_id?: string
          address?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          contact_email?: string
          contact_phone?: string | null
          status?: 'pending' | 'active' | 'inactive' | 'rejected'
          is_featured?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      club_sports: {
        Row: {
          id: string
          club_id: string
          sport_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          sport_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          sport_id?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      update_requests: {
        Row: {
          id: string
          club_id: string
          type: 'info_change' | 'social_update' | 'sports_change' | 'club_closed' | 'remove_profile' | 'other'
          description: string | null
          contact_email: string
          status: 'pending' | 'applied' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          type: 'info_change' | 'social_update' | 'sports_change' | 'club_closed' | 'remove_profile' | 'other'
          description?: string | null
          contact_email: string
          status?: 'pending' | 'applied' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          type?: 'info_change' | 'social_update' | 'sports_change' | 'club_closed' | 'remove_profile' | 'other'
          description?: string | null
          contact_email?: string
          status?: 'pending' | 'applied' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
