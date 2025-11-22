/**
 * Territory Type Definitions
 */

export type TerritoryType = 'polygon' | 'circle' | 'rectangle'

export interface Territory {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  territory_type: TerritoryType
  geometry: GeoJSON.Polygon
  center_lat?: number
  center_lng?: number
  radius_meters?: number
  is_exclusion: boolean
  is_active: boolean
  property_count: number
  last_calculated_at?: string
  created_at: string
  updated_at: string
}

export interface TerritoryCreate {
  name: string
  description?: string
  color?: string
  territory_type: TerritoryType
  geometry: GeoJSON.Polygon
  center_lat?: number
  center_lng?: number
  radius_meters?: number
  is_exclusion?: boolean
}

export interface TerritoryUpdate {
  name?: string
  description?: string
  color?: string
  geometry?: GeoJSON.Polygon
  center_lat?: number
  center_lng?: number
  radius_meters?: number
  is_exclusion?: boolean
  is_active?: boolean
}

export interface TerritoryListResponse {
  territories: Territory[]
  total: number
}

export interface TerritoryPropertyCount {
  territory_id: string
  property_count: number
}

export interface SavedTerritoryGroup {
  id: string
  user_id: string
  name: string
  description?: string
  territory_ids: string[]
  created_at: string
  updated_at: string
}

export interface SavedTerritoryGroupCreate {
  name: string
  description?: string
  territory_ids: string[]
}

export interface TerritoryGroupListResponse {
  groups: SavedTerritoryGroup[]
  total: number
}
