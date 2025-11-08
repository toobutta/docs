import type { Property } from '@/types/property'

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    address: '123 Peachtree St',
    city: 'Atlanta',
    state: 'GA',
    zip: '30303',
    county: 'Fulton',
    latitude: 33.7590,
    longitude: -84.3880,
    property_type: 'residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-84.3880, 33.7590], [-84.3879, 33.7590], [-84.3879, 33.7589], [-84.3880, 33.7589], [-84.3880, 33.7590]]]
    },
    roofiq: {
      condition: 'good',
      confidence: 85,
      age_years: 12,
      material: 'asphalt',
      area_sqft: 2400,
      slope_degrees: 25,
      complexity: 'moderate',
      cost_low: 12000,
      cost_high: 18000,
      imagery_date: '2024-06-15',
      analysis_date: '2024-11-01'
    },
    solarfit: {
      score: 82,
      confidence: 88,
      annual_kwh_potential: 8500,
      panel_count: 24,
      panel_layout: { type: 'MultiPolygon', coordinates: [] },
      system_size_kw: 7.2,
      estimated_cost: 21600,
      annual_savings: 1200,
      roi_years: 18,
      shading_analysis: { spring: 0.92, summer: 0.95, fall: 0.88, winter: 0.85 },
      orientation: 'south',
      tilt_degrees: 25
    },
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-11-01T14:30:00Z'
  },
  {
    id: '2',
    address: '456 Piedmont Ave',
    city: 'Atlanta',
    state: 'GA',
    zip: '30308',
    county: 'Fulton',
    latitude: 33.7750,
    longitude: -84.3700,
    property_type: 'residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-84.3700, 33.7750], [-84.3699, 33.7750], [-84.3699, 33.7749], [-84.3700, 33.7749], [-84.3700, 33.7750]]]
    },
    roofiq: {
      condition: 'fair',
      confidence: 78,
      age_years: 22,
      material: 'asphalt',
      area_sqft: 1800,
      slope_degrees: 20,
      complexity: 'simple',
      cost_low: 9000,
      cost_high: 14000,
      imagery_date: '2024-06-15',
      analysis_date: '2024-11-01'
    },
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-11-01T14:30:00Z'
  },
  {
    id: '3',
    address: '789 Spring St',
    city: 'Atlanta',
    state: 'GA',
    zip: '30308',
    county: 'Fulton',
    latitude: 33.7710,
    longitude: -84.3850,
    property_type: 'commercial',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-84.3850, 33.7710], [-84.3849, 33.7710], [-84.3849, 33.7709], [-84.3850, 33.7709], [-84.3850, 33.7710]]]
    },
    roofiq: {
      condition: 'excellent',
      confidence: 92,
      age_years: 5,
      material: 'metal',
      area_sqft: 12000,
      slope_degrees: 15,
      complexity: 'complex',
      cost_low: 45000,
      cost_high: 65000,
      imagery_date: '2024-06-15',
      analysis_date: '2024-11-01'
    },
    solarfit: {
      score: 95,
      confidence: 94,
      annual_kwh_potential: 45000,
      panel_count: 120,
      panel_layout: { type: 'MultiPolygon', coordinates: [] },
      system_size_kw: 36,
      estimated_cost: 108000,
      annual_savings: 6500,
      roi_years: 16.6,
      shading_analysis: { spring: 0.98, summer: 0.99, fall: 0.96, winter: 0.94 },
      orientation: 'south',
      tilt_degrees: 15
    },
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-11-01T14:30:00Z'
  },
  {
    id: '4',
    address: '321 West Peachtree St',
    city: 'Atlanta',
    state: 'GA',
    zip: '30308',
    county: 'Fulton',
    latitude: 33.7650,
    longitude: -84.3900,
    property_type: 'residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-84.3900, 33.7650], [-84.3899, 33.7650], [-84.3899, 33.7649], [-84.3900, 33.7649], [-84.3900, 33.7650]]]
    },
    roofiq: {
      condition: 'poor',
      confidence: 81,
      age_years: 35,
      material: 'asphalt',
      area_sqft: 2200,
      slope_degrees: 22,
      complexity: 'moderate',
      cost_low: 13000,
      cost_high: 19000,
      imagery_date: '2024-06-15',
      analysis_date: '2024-11-01'
    },
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-11-01T14:30:00Z'
  },
  {
    id: '5',
    address: '555 Marietta St',
    city: 'Atlanta',
    state: 'GA',
    zip: '30313',
    county: 'Fulton',
    latitude: 33.7630,
    longitude: -84.4000,
    property_type: 'residential',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-84.4000, 33.7630], [-84.3999, 33.7630], [-84.3999, 33.7629], [-84.4000, 33.7629], [-84.4000, 33.7630]]]
    },
    roofiq: {
      condition: 'good',
      confidence: 87,
      age_years: 10,
      material: 'tile',
      area_sqft: 3200,
      slope_degrees: 30,
      complexity: 'complex',
      cost_low: 22000,
      cost_high: 32000,
      imagery_date: '2024-06-15',
      analysis_date: '2024-11-01'
    },
    solarfit: {
      score: 76,
      confidence: 82,
      annual_kwh_potential: 9200,
      panel_count: 28,
      panel_layout: { type: 'MultiPolygon', coordinates: [] },
      system_size_kw: 8.4,
      estimated_cost: 25200,
      annual_savings: 1300,
      roi_years: 19.4,
      shading_analysis: { spring: 0.85, summer: 0.90, fall: 0.82, winter: 0.78 },
      orientation: 'southeast',
      tilt_degrees: 30
    },
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-11-01T14:30:00Z'
  }
]
