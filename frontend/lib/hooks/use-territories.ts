/**
 * Territory React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTerritory,
  getTerritories,
  getTerritory,
  updateTerritory,
  deleteTerritory,
  getTerritoryPropertyCount,
  createTerritoryGroup,
  getTerritoryGroups,
} from '@/lib/api/territories'
import type {
  TerritoryCreate,
  TerritoryUpdate,
  SavedTerritoryGroupCreate,
} from '@/types/territory'

export function useTerritories(params: {
  skip?: number
  limit?: number
  active_only?: boolean
} = {}) {
  return useQuery({
    queryKey: ['territories', params],
    queryFn: () => getTerritories(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTerritory(territoryId: string) {
  return useQuery({
    queryKey: ['territory', territoryId],
    queryFn: () => getTerritory(territoryId),
    enabled: !!territoryId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTerritory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TerritoryCreate) => createTerritory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] })
    },
  })
}

export function useUpdateTerritory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      territoryId,
      updates,
    }: {
      territoryId: string
      updates: TerritoryUpdate
    }) => updateTerritory(territoryId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['territory', variables.territoryId],
      })
      queryClient.invalidateQueries({ queryKey: ['territories'] })
    },
  })
}

export function useDeleteTerritory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (territoryId: string) => deleteTerritory(territoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] })
    },
  })
}

export function useTerritoryPropertyCount(territoryId: string) {
  return useQuery({
    queryKey: ['territory-property-count', territoryId],
    queryFn: () => getTerritoryPropertyCount(territoryId),
    enabled: !!territoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTerritoryGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SavedTerritoryGroupCreate) => createTerritoryGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territory-groups'] })
    },
  })
}

export function useTerritoryGroups(params: {
  skip?: number
  limit?: number
} = {}) {
  return useQuery({
    queryKey: ['territory-groups', params],
    queryFn: () => getTerritoryGroups(params),
    staleTime: 5 * 60 * 1000,
  })
}
