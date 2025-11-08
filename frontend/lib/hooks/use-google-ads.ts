/**
 * Google Ads React Query Hooks
 *
 * Custom hooks for Google Ads Customer Match integration.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAuthorizationURL,
  handleOAuthCallback,
  getGoogleAdsAccounts,
  updateCustomerId,
  disconnectAccount,
  createAudience,
  getAudiences,
  getAudience,
  updateAudience,
  syncAudience,
  getAccountStatistics,
} from '@/lib/api/google-ads'
import type {
  GoogleAdsOAuthCallback,
  CustomerMatchAudienceCreate,
  CustomerMatchAudienceUpdate,
} from '@/types/google-ads'

/**
 * Get OAuth authorization URL
 */
export function useAuthorizationURL() {
  return useQuery({
    queryKey: ['google-ads', 'auth-url'],
    queryFn: getAuthorizationURL,
    enabled: false, // Manual trigger only
    staleTime: 0,
    gcTime: 0,
  })
}

/**
 * Handle OAuth callback
 */
export function useOAuthCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (callback: GoogleAdsOAuthCallback) => handleOAuthCallback(callback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'accounts'] })
    },
  })
}

/**
 * Get Google Ads accounts
 */
export function useGoogleAdsAccounts() {
  return useQuery({
    queryKey: ['google-ads', 'accounts'],
    queryFn: getGoogleAdsAccounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Update customer ID
 */
export function useUpdateCustomerId() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ accountId, customerId }: { accountId: string; customerId: string }) =>
      updateCustomerId(accountId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'accounts'] })
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'statistics'] })
    },
  })
}

/**
 * Disconnect account
 */
export function useDisconnectAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => disconnectAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'accounts'] })
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'audiences'] })
    },
  })
}

/**
 * Create audience
 */
export function useCreateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomerMatchAudienceCreate) => createAudience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'audiences'] })
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'statistics'] })
    },
  })
}

/**
 * Get audiences
 */
export function useAudiences(params: { skip?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['google-ads', 'audiences', params],
    queryFn: () => getAudiences(params),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single audience with sync history
 */
export function useAudience(audienceId: string) {
  return useQuery({
    queryKey: ['google-ads', 'audience', audienceId],
    queryFn: () => getAudience(audienceId),
    enabled: !!audienceId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Update audience
 */
export function useUpdateAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      audienceId,
      updates,
    }: {
      audienceId: string
      updates: CustomerMatchAudienceUpdate
    }) => updateAudience(audienceId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['google-ads', 'audience', variables.audienceId],
      })
      queryClient.invalidateQueries({ queryKey: ['google-ads', 'audiences'] })
    },
  })
}

/**
 * Sync audience to Google Ads
 */
export function useSyncAudience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (audienceId: string) => syncAudience(audienceId),
    onSuccess: (data, audienceId) => {
      // Invalidate after a delay to allow background sync to complete
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['google-ads', 'audience', audienceId],
        })
        queryClient.invalidateQueries({ queryKey: ['google-ads', 'audiences'] })
        queryClient.invalidateQueries({ queryKey: ['google-ads', 'statistics'] })
      }, 2000)
    },
  })
}

/**
 * Get account statistics
 */
export function useAccountStatistics() {
  return useQuery({
    queryKey: ['google-ads', 'statistics'],
    queryFn: getAccountStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute when viewing
  })
}
