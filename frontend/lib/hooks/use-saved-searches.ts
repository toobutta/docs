/**
 * Saved Searches React Query Hooks
 *
 * Custom hooks for managing saved searches with TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createSavedSearch,
  getSavedSearches,
  getSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  sendTestAlert,
  getAlertHistory,
  getEmailPreferences,
  updateEmailPreferences,
} from '@/lib/api/saved-searches'
import type {
  SavedSearchCreate,
  SavedSearchUpdate,
  UserEmailPreferenceUpdate,
} from '@/types/saved-search'

/**
 * Get list of saved searches
 */
export function useSavedSearches(params: {
  skip?: number
  limit?: number
  active_only?: boolean
} = {}) {
  return useQuery({
    queryKey: ['saved-searches', params],
    queryFn: () => getSavedSearches(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get a specific saved search with alert history
 */
export function useSavedSearch(searchId: string, includeAlerts = true) {
  return useQuery({
    queryKey: ['saved-search', searchId, { includeAlerts }],
    queryFn: () => getSavedSearch(searchId, includeAlerts),
    enabled: !!searchId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Create a new saved search
 */
export function useCreateSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SavedSearchCreate) => createSavedSearch(data),
    onSuccess: () => {
      // Invalidate saved searches list
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
  })
}

/**
 * Update a saved search
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      searchId,
      updates,
    }: {
      searchId: string
      updates: SavedSearchUpdate
    }) => updateSavedSearch(searchId, updates),
    onSuccess: (data, variables) => {
      // Invalidate specific search and list
      queryClient.invalidateQueries({
        queryKey: ['saved-search', variables.searchId],
      })
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
  })
}

/**
 * Delete a saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (searchId: string) => deleteSavedSearch(searchId),
    onSuccess: () => {
      // Invalidate saved searches list
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
  })
}

/**
 * Send a test alert
 */
export function useSendTestAlert() {
  return useMutation({
    mutationFn: ({
      searchId,
      recipientEmail,
    }: {
      searchId: string
      recipientEmail?: string
    }) => sendTestAlert(searchId, recipientEmail),
  })
}

/**
 * Get alert history for a search
 */
export function useAlertHistory(
  searchId: string,
  params: { skip?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: ['alert-history', searchId, params],
    queryFn: () => getAlertHistory(searchId, params),
    enabled: !!searchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get user email preferences
 */
export function useEmailPreferences() {
  return useQuery({
    queryKey: ['email-preferences'],
    queryFn: getEmailPreferences,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Update user email preferences
 */
export function useUpdateEmailPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: UserEmailPreferenceUpdate) =>
      updateEmailPreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-preferences'] })
    },
  })
}

/**
 * Toggle alerts on/off for a saved search
 */
export function useToggleAlerts() {
  const { mutate: updateSearch } = useUpdateSavedSearch()

  return (searchId: string, enabled: boolean) => {
    updateSearch({
      searchId,
      updates: { alerts_enabled: enabled },
    })
  }
}
