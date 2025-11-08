import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchProperties, getProperty, getRoofIQData, getSolarFitData } from '@/lib/api/properties'
import type { PropertyFilters, Property } from '@/types/property'

/**
 * Hook to search properties with filters
 * Automatically caches results for 5 minutes
 */
export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => searchProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
  })
}

/**
 * Hook for infinite scrolling property search
 * Loads 100 properties per page
 */
export function useInfiniteProperties(filters: PropertyFilters) {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) =>
      searchProperties({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      // If we got a full page, there might be more
      if (lastPage.properties.length === filters.limit || lastPage.properties.length === 100) {
        return pages.length * (filters.limit || 100)
      }
      return undefined
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * Hook to get single property details
 * Includes all product analyses
 */
export function useProperty(id: string | null) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to get RoofIQ analysis for a property
 */
export function useRoofIQ(propertyId: string | null) {
  return useQuery({
    queryKey: ['roofiq', propertyId],
    queryFn: () => getRoofIQData(propertyId!),
    enabled: !!propertyId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to get SolarFit analysis for a property
 */
export function useSolarFit(propertyId: string | null) {
  return useQuery({
    queryKey: ['solarfit', propertyId],
    queryFn: () => getSolarFitData(propertyId!),
    enabled: !!propertyId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to prefetch property details on hover
 * Improves perceived performance
 */
export function usePrefetchProperty() {
  const queryClient = useQueryClient()

  return (propertyId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['property', propertyId],
      queryFn: () => getProperty(propertyId),
      staleTime: 10 * 60 * 1000,
    })
  }
}
