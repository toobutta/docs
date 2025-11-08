/**
 * Saved Search Type Definitions
 */

import type { PropertyFilters } from './property'

export type AlertFrequency = 'instant' | 'daily' | 'weekly' | 'monthly'

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  last_checked_at?: string
  filters: PropertyFilters
  alerts_enabled: boolean
  alert_frequency: AlertFrequency
  alert_email: string
  alert_time?: number
  alert_day?: number
  total_matches: number
  new_matches_since_last_alert: number
  is_active: boolean
}

export interface SearchAlert {
  id: string
  sent_at: string
  property_count: number
  email_sent: boolean
  email_opened: boolean
  email_clicked: boolean
  error_message?: string
}

export interface SavedSearchWithAlerts extends SavedSearch {
  alert_history: SearchAlert[]
}

export interface SavedSearchCreate {
  name: string
  description?: string
  filters: PropertyFilters
  alerts_enabled?: boolean
  alert_frequency?: AlertFrequency
  alert_email: string
  alert_time?: number
  alert_day?: number
}

export interface SavedSearchUpdate {
  name?: string
  description?: string
  filters?: PropertyFilters
  alerts_enabled?: boolean
  alert_frequency?: AlertFrequency
  alert_email?: string
  alert_time?: number
  alert_day?: number
  is_active?: boolean
}

export interface SavedSearchListResponse {
  searches: SavedSearch[]
  total: number
}

export interface UserEmailPreference {
  id: string
  user_id: string
  email: string
  all_alerts_enabled: boolean
  marketing_emails_enabled: boolean
  daily_digest_enabled: boolean
  daily_digest_time: number
  weekly_digest_enabled: boolean
  weekly_digest_day: number
  weekly_digest_time: number
  unsubscribed_at?: string
  created_at: string
  updated_at: string
}

export interface UserEmailPreferenceUpdate {
  email?: string
  all_alerts_enabled?: boolean
  marketing_emails_enabled?: boolean
  daily_digest_enabled?: boolean
  daily_digest_time?: number
  weekly_digest_enabled?: boolean
  weekly_digest_day?: number
  weekly_digest_time?: number
}

export interface TestAlertResponse {
  success: boolean
  message: string
  property_count: number
  email_sent: boolean
  sendgrid_message_id?: string
}
