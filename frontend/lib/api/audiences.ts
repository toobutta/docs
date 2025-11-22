import { apiClient } from './client'
import type {
  Audience,
  CreateAudienceDTO,
  UpdateAudienceDTO,
  AudienceExportOptions,
} from '@/types/audience'

export async function getAudiences(): Promise<Audience[]> {
  const response = await apiClient.get<Audience[]>('/api/audiences')
  return response.data
}

export async function getAudience(id: string): Promise<Audience> {
  const response = await apiClient.get<Audience>(`/api/audiences/${id}`)
  return response.data
}

export async function createAudience(
  data: CreateAudienceDTO
): Promise<Audience> {
  const response = await apiClient.post<Audience>('/api/audiences', data)
  return response.data
}

export async function updateAudience(
  id: string,
  data: UpdateAudienceDTO
): Promise<Audience> {
  const response = await apiClient.patch<Audience>(`/api/audiences/${id}`, data)
  return response.data
}

export async function deleteAudience(id: string): Promise<void> {
  await apiClient.delete(`/api/audiences/${id}`)
}

export async function exportAudience(
  id: string,
  options: AudienceExportOptions
): Promise<Blob> {
  const response = await apiClient.post(
    `/api/audiences/${id}/export`,
    options,
    {
      responseType: 'blob',
    }
  )
  return response.data
}
