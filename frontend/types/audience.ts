import { PropertyFilters } from './property'

export interface Audience {
  id: string
  name: string
  description?: string
  filters: PropertyFilters
  property_count: number
  created_at: string
  updated_at: string
  created_by: string
}

export interface CreateAudienceDTO {
  name: string
  description?: string
  filters: PropertyFilters
}

export interface UpdateAudienceDTO {
  name?: string
  description?: string
  filters?: PropertyFilters
}

export interface AudienceExportOptions {
  format: 'google-ads' | 'csv' | 'pdf'
  include_fields?: string[]
}

export interface GoogleAdsExportOptions extends AudienceExportOptions {
  format: 'google-ads'
  customer_id: string
  campaign_name: string
}

export interface CSVExportOptions extends AudienceExportOptions {
  format: 'csv'
  include_headers: boolean
}

export interface PDFExportOptions extends AudienceExportOptions {
  format: 'pdf'
  include_map: boolean
  include_property_details: boolean
}
