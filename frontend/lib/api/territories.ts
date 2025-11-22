/**
 * Territory API Client
 */

import type {
  Territory,
  TerritoryCreate,
  TerritoryUpdate,
  TerritoryListResponse,
  TerritoryPropertyCount,
  SavedTerritoryGroup,
  SavedTerritoryGroupCreate,
  TerritoryGroupListResponse,
} from '@/types/territory'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function createTerritory(data: TerritoryCreate): Promise<Territory> {
  const response = await fetch(`${API_BASE}/territories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create territory')
  }

  return response.json()
}

export async function getTerritories(params: {
  skip?: number
  limit?: number
  active_only?: boolean
}): Promise<TerritoryListResponse> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())
  if (params.active_only !== undefined)
    searchParams.set('active_only', params.active_only.toString())

  const response = await fetch(`${API_BASE}/territories?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch territories')
  }

  return response.json()
}

export async function getTerritory(territoryId: string): Promise<Territory> {
  const response = await fetch(`${API_BASE}/territories/${territoryId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch territory')
  }

  return response.json()
}

export async function updateTerritory(
  territoryId: string,
  updates: TerritoryUpdate
): Promise<Territory> {
  const response = await fetch(`${API_BASE}/territories/${territoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update territory')
  }

  return response.json()
}

export async function deleteTerritory(territoryId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/territories/${territoryId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete territory')
  }
}

export async function getTerritoryPropertyCount(
  territoryId: string
): Promise<TerritoryPropertyCount> {
  const response = await fetch(
    `${API_BASE}/territories/${territoryId}/properties/count`
  )

  if (!response.ok) {
    throw new Error('Failed to get property count')
  }

  return response.json()
}

export async function createTerritoryGroup(
  data: SavedTerritoryGroupCreate
): Promise<SavedTerritoryGroup> {
  const response = await fetch(`${API_BASE}/territories/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create territory group')
  }

  return response.json()
}

export async function getTerritoryGroups(params: {
  skip?: number
  limit?: number
}): Promise<TerritoryGroupListResponse> {
  const searchParams = new URLSearchParams()
  if (params.skip !== undefined) searchParams.set('skip', params.skip.toString())
  if (params.limit !== undefined) searchParams.set('limit', params.limit.toString())

  const response = await fetch(
    `${API_BASE}/territories/groups?${searchParams.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch territory groups')
  }

  return response.json()
}
