export interface Property {
  id: string
  address: string
  city: string
  state: string
  zip: string
  county: string
  latitude: number
  longitude: number
  property_type: 'residential' | 'commercial'

  // Geometry
  geometry: GeoJSON.Polygon

  // RoofIQ data
  roofiq?: RoofIQData

  // SolarFit data
  solarfit?: SolarFitData

  // DrivewayPro data
  drivewaypro?: DrivewayProData

  // PermitScope data
  permitscope?: PermitScopeData

  // Metadata
  created_at: string
  updated_at: string
}

export interface RoofIQData {
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  confidence: number // 0-100
  age_years: number
  material: 'asphalt' | 'metal' | 'tile' | 'slate' | 'wood' | 'unknown'
  area_sqft: number
  slope_degrees: number
  complexity: 'simple' | 'moderate' | 'complex'
  cost_low: number
  cost_high: number
  imagery_date: string
  analysis_date: string
}

export interface SolarFitData {
  score: number // 0-100
  confidence: number
  annual_kwh_potential: number
  panel_count: number
  panel_layout: GeoJSON.MultiPolygon
  system_size_kw: number
  estimated_cost: number
  annual_savings: number
  roi_years: number
  shading_analysis: {
    spring: number // 0-1 (% unshaded)
    summer: number
    fall: number
    winter: number
  }
  orientation: 'south' | 'southeast' | 'southwest' | 'east' | 'west'
  tilt_degrees: number
}

export interface DrivewayProData {
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  confidence: number
  area_sqft: number
  surface_type: 'asphalt' | 'concrete' | 'gravel' | 'paver' | 'unknown'
  cracking_severity: 'none' | 'minor' | 'moderate' | 'severe'
  sealing_recommended: boolean
  estimated_cost_low: number
  estimated_cost_high: number
  imagery_date: string
  analysis_date: string
}

export interface PermitScopeData {
  recent_permits: Permit[]
  total_permits: number
  last_permit_date: string | null
  construction_activity_score: number // 0-100
  confidence: number
}

export interface Permit {
  id: string
  permit_number: string
  permit_type: string
  description: string
  issue_date: string
  status: 'issued' | 'approved' | 'completed' | 'expired'
  estimated_cost: number
  contractor: string | null
}

export interface PropertyFilters {
  // Location filters
  city?: string
  state?: string
  zip?: string
  county?: string
  bounds?: [number, number, number, number] // [west, south, east, north]
  territory?: GeoJSON.Polygon

  // Property type
  property_type?: 'residential' | 'commercial'

  // RoofIQ filters
  roof_condition?: ('excellent' | 'good' | 'fair' | 'poor')[]
  roof_age_years_max?: number
  roof_age_years_min?: number
  roof_material?: string[]

  // SolarFit filters
  solar_score_min?: number
  solar_score_max?: number
  panel_count_min?: number
  roi_years_max?: number

  // DrivewayPro filters
  driveway_condition?: ('excellent' | 'good' | 'fair' | 'poor')[]
  driveway_sealing_recommended?: boolean

  // PermitScope filters
  permit_activity_days?: number // recent permits within X days
  construction_activity_min?: number

  // Pagination
  limit?: number
  offset?: number

  // Sorting
  sort_by?: 'solar_score' | 'roof_age' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}

export interface PropertySearchResponse {
  properties: Property[]
  total: number
  limit: number
  offset: number
  center?: [number, number] // [longitude, latitude]
}
