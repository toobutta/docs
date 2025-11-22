/**
 * Saved Searches API Client
 *
 * API functions for managing saved searches and email alerts.
 */

import type {
  SavedSearch,
  SavedSearchCreate,
  SavedSearchUpdate,
  SavedSearchWithAlerts,
  SavedSearchListResponse,
  SearchAlert,
  UserEmailPreference,
  UserEmailPreferenceUpdate,
  TestAlertResponse,
} from '@/types/saved-search'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Create a new saved search
 */
export async function createSavedSearch(
  data: SavedSearchCreate
): Promise<SavedSearch> {
  const response = await fetch(`${API_BASE}/saved-searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create saved search')
  }

  return response.json()
}

/**
 * Get list of saved searches
 */
export async function getSavedSearches(params: {
  skip?: number
  limit?: number
  active_only?: boolean
}): Promise<SavedSearchListResponse> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())
  if (params.active_only !== undefined)
    searchParams.set('active_only', params.active_only.toString())

  const response = await fetch(
    `${API_BASE}/saved-searches?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch saved searches')
  }

  return response.json()
}

/**
 * Get a specific saved search with alert history
 */
export async function getSavedSearch(
  searchId: string,
  includeAlerts = true
): Promise<SavedSearchWithAlerts> {
  const searchParams = new URLSearchParams()
  searchParams.set('include_alerts', includeAlerts.toString())

  const response = await fetch(
    `${API_BASE}/saved-searches/${searchId}?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch saved search')
  }

  return response.json()
}

/**
 * Update a saved search
 */
export async function updateSavedSearch(
  searchId: string,
  updates: SavedSearchUpdate
): Promise<SavedSearch> {
  const response = await fetch(`${API_BASE}/saved-searches/${searchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update saved search')
  }

  return response.json()
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/saved-searches/${searchId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete saved search')
  }
}

/**
 * Send a test alert
 */
export async function sendTestAlert(
  searchId: string,
  recipientEmail?: string
): Promise<TestAlertResponse> {
  const response = await fetch(
    `${API_BASE}/saved-searches/${searchId}/test-alert`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_email: recipientEmail }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to send test alert')
  }

  return response.json()
}

/**
 * Get alert history for a saved search
 */
export async function getAlertHistory(
  searchId: string,
  params: { skip?: number; limit?: number } = {}
): Promise<SearchAlert[]> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())

  const response = await fetch(
    `${API_BASE}/saved-searches/${searchId}/alerts?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch alert history')
  }

  return response.json()
}

/**
 * Get user email preferences
 */
export async function getEmailPreferences(): Promise<UserEmailPreference> {
  const response = await fetch(`${API_BASE}/saved-searches/preferences/email`)

  if (!response.ok) {
    throw new Error('Failed to fetch email preferences')
  }

  return response.json()
}

/**
 * Update user email preferences
 */
export async function updateEmailPreferences(
  updates: UserEmailPreferenceUpdate
): Promise<UserEmailPreference> {
  const response = await fetch(`${API_BASE}/saved-searches/preferences/email`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update email preferences')
  }

  return response.json()
}
