/**
 * Property Comparison API Client
 */

import type { Property } from '@/types/property'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface PropertyComparisonResponse {
  properties: Property[]
  comparison_matrix: {
    roof_scores: Array<{ property_id: string; score: number | null }>
    solar_scores: Array<{ property_id: string; score: number | null }>
    property_types: Array<{ property_id: string; type: string | null }>
  }
}

export async function compareProperties(
  propertyIds: string[]
): Promise<PropertyComparisonResponse> {
  const response = await fetch(`${API_BASE}/comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_ids: propertyIds }),
  })

  if (!response.ok) {
    throw new Error('Failed to compare properties')
  }

  return response.json()
}
