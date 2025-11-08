import { apiClient } from './client'
import type {
  Property,
  PropertyFilters,
  PropertySearchResponse,
  RoofIQData,
  SolarFitData,
  DrivewayProData,
  PermitScopeData,
} from '@/types/property'

export async function searchProperties(
  filters: PropertyFilters
): Promise<PropertySearchResponse> {
  const response = await apiClient.post<PropertySearchResponse>(
    '/api/properties/search',
    filters
  )
  return response.data
}

export async function getProperty(id: string): Promise<Property> {
  const response = await apiClient.get<Property>(`/api/properties/${id}`)
  return response.data
}

export async function getRoofIQData(propertyId: string): Promise<RoofIQData> {
  const response = await apiClient.get<RoofIQData>(
    `/api/properties/${propertyId}/roofiq`
  )
  return response.data
}

export async function getSolarFitData(
  propertyId: string
): Promise<SolarFitData> {
  const response = await apiClient.get<SolarFitData>(
    `/api/properties/${propertyId}/solarfit`
  )
  return response.data
}

export async function getDrivewayProData(
  propertyId: string
): Promise<DrivewayProData> {
  const response = await apiClient.get<DrivewayProData>(
    `/api/properties/${propertyId}/drivewaypro`
  )
  return response.data
}

export async function getPermitScopeData(
  propertyId: string
): Promise<PermitScopeData> {
  const response = await apiClient.get<PermitScopeData>(
    `/api/properties/${propertyId}/permitscope`
  )
  return response.data
}
