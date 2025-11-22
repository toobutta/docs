/**
 * Google Ads API Client
 *
 * API functions for Google Ads Customer Match integration.
 */

import type {
  GoogleAdsAccount,
  GoogleAdsAuthURL,
  GoogleAdsOAuthCallback,
  GoogleAdsAccountStatistics,
  CustomerMatchAudience,
  CustomerMatchAudienceCreate,
  CustomerMatchAudienceUpdate,
  CustomerMatchAudienceWithHistory,
  AudienceListResponse,
  AudienceSyncResponse,
} from '@/types/google-ads'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Get OAuth authorization URL
 */
export async function getAuthorizationURL(): Promise<GoogleAdsAuthURL> {
  const response = await fetch(`${API_BASE}/google-ads/auth/url`)

  if (!response.ok) {
    throw new Error('Failed to get authorization URL')
  }

  return response.json()
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(
  callback: GoogleAdsOAuthCallback
): Promise<GoogleAdsAccount> {
  const response = await fetch(`${API_BASE}/google-ads/auth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callback),
  })

  if (!response.ok) {
    throw new Error('Failed to complete OAuth flow')
  }

  return response.json()
}

/**
 * Get list of Google Ads accounts
 */
export async function getGoogleAdsAccounts(): Promise<GoogleAdsAccount[]> {
  const response = await fetch(`${API_BASE}/google-ads/accounts`)

  if (!response.ok) {
    throw new Error('Failed to fetch Google Ads accounts')
  }

  return response.json()
}

/**
 * Update customer ID for an account
 */
export async function updateCustomerId(
  accountId: string,
  customerId: string
): Promise<GoogleAdsAccount> {
  const response = await fetch(
    `${API_BASE}/google-ads/accounts/${accountId}/customer-id?customer_id=${customerId}`,
    {
      method: 'PATCH',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to update customer ID')
  }

  return response.json()
}

/**
 * Disconnect Google Ads account
 */
export async function disconnectAccount(accountId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/google-ads/accounts/${accountId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to disconnect account')
  }
}

/**
 * Create a new Customer Match audience
 */
export async function createAudience(
  data: CustomerMatchAudienceCreate
): Promise<CustomerMatchAudience> {
  const response = await fetch(`${API_BASE}/google-ads/audiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create audience')
  }

  return response.json()
}

/**
 * Get list of audiences
 */
export async function getAudiences(params: {
  skip?: number
  limit?: number
}): Promise<AudienceListResponse> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())

  const response = await fetch(
    `${API_BASE}/google-ads/audiences?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch audiences')
  }

  return response.json()
}

/**
 * Get a specific audience with sync history
 */
export async function getAudience(
  audienceId: string
): Promise<CustomerMatchAudienceWithHistory> {
  const response = await fetch(`${API_BASE}/google-ads/audiences/${audienceId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch audience')
  }

  return response.json()
}

/**
 * Update an audience
 */
export async function updateAudience(
  audienceId: string,
  updates: CustomerMatchAudienceUpdate
): Promise<CustomerMatchAudience> {
  const response = await fetch(`${API_BASE}/google-ads/audiences/${audienceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update audience')
  }

  return response.json()
}

/**
 * Trigger audience sync
 */
export async function syncAudience(audienceId: string): Promise<AudienceSyncResponse> {
  const response = await fetch(
    `${API_BASE}/google-ads/audiences/${audienceId}/sync`,
    {
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to sync audience')
  }

  return response.json()
}

/**
 * Get account statistics
 */
export async function getAccountStatistics(): Promise<GoogleAdsAccountStatistics> {
  const response = await fetch(`${API_BASE}/google-ads/statistics`)

  if (!response.ok) {
    throw new Error('Failed to fetch statistics')
  }

  return response.json()
}
