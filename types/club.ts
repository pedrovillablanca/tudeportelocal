export type ClubStatus = 'pending' | 'active' | 'inactive' | 'rejected'
export type UpdateRequestType = 
  | 'info_change' 
  | 'social_update' 
  | 'sports_change' 
  | 'club_closed' 
  | 'remove_profile' 
  | 'other'
export type UpdateRequestStatus = 'pending' | 'applied' | 'rejected'

export interface IRegion {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface ICommune {
  id: string
  name: string
  region_id: string
  slug: string
  created_at: string
  updated_at: string
}

export interface ISport {
  id: string
  name: string
  slug: string
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IClub {
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
  status: ClubStatus
  is_featured: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface IClubWithRelations extends IClub {
  region?: IRegion
  commune?: ICommune
  sports?: ISport[]
}

export interface IClubSport {
  id: string
  club_id: string
  sport_id: string
  is_primary: boolean
  created_at: string
}

export interface IUpdateRequest {
  id: string
  club_id: string
  type: UpdateRequestType
  description: string | null
  contact_email: string
  status: UpdateRequestStatus
  created_at: string
  updated_at: string
}

export interface IUpdateRequestWithClub extends IUpdateRequest {
  club?: IClub
}
