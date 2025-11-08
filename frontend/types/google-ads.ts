/**
 * Google Ads Type Definitions
 */

import type { PropertyFilters } from './property'

export type GoogleAdsAccountStatus = 'connected' | 'disconnected' | 'error' | 'pending'
export type AudienceSyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partial'

export interface GoogleAdsAccount {
  id: string
  user_id: string
  customer_id: string
  account_name?: string
  currency_code?: string
  time_zone?: string
  status: GoogleAdsAccountStatus
  is_active: boolean
  last_error?: string
  last_sync_at?: string
  connected_at: string
  created_at: string
  updated_at: string
}

export interface GoogleAdsAuthURL {
  auth_url: string
  state: string
}

export interface GoogleAdsOAuthCallback {
  code: string
  state: string
}

export interface CustomerMatchAudience {
  id: string
  google_ads_account_id: string
  user_id: string
  name: string
  description?: string
  user_list_resource_name?: string
  user_list_id?: string
  property_filters: PropertyFilters
  total_properties: number
  total_contacts: number
  uploaded_count: number
  matched_count: number
  match_rate: number
  sync_status: AudienceSyncStatus
  last_sync_at?: string
  next_sync_at?: string
  auto_sync_enabled: boolean
  sync_frequency_hours: number
  last_error?: string
  failed_records_count: number
  created_at: string
  updated_at: string
}

export interface AudienceSyncHistory {
  id: string
  started_at: string
  completed_at?: string
  status: AudienceSyncStatus
  properties_processed: number
  contacts_uploaded: number
  contacts_matched: number
  failed_count: number
  error_message?: string
  triggered_by?: string
}

export interface CustomerMatchAudienceWithHistory extends CustomerMatchAudience {
  sync_history: AudienceSyncHistory[]
}

export interface CustomerMatchAudienceCreate {
  name: string
  description?: string
  property_filters: PropertyFilters
  auto_sync_enabled?: boolean
  sync_frequency_hours?: number
}

export interface CustomerMatchAudienceUpdate {
  name?: string
  description?: string
  property_filters?: PropertyFilters
  auto_sync_enabled?: boolean
  sync_frequency_hours?: number
}

export interface AudienceListResponse {
  audiences: CustomerMatchAudience[]
  total: number
}

export interface AudienceSyncRequest {
  audience_id: string
  force_refresh?: boolean
}

export interface AudienceSyncResponse {
  sync_id: string
  status: string
  message: string
  estimated_contacts: number
}

export interface AudienceStatistics {
  total_audiences: number
  active_audiences: number
  total_contacts: number
  total_synced: number
  average_match_rate: number
  last_sync?: string
}

export interface GoogleAdsAccountStatistics {
  account: GoogleAdsAccount
  statistics: AudienceStatistics
  recent_syncs: AudienceSyncHistory[]
}
