'use client'

import { useState } from 'react'
import { InteractiveMap } from '@/components/map/interactive-map'
import { PropertyPanel } from '@/components/property/property-panel'
import { useProperties } from '@/lib/hooks/use-properties'
import { useMapStore } from '@/lib/stores/map-store'
import { MOCK_PROPERTIES } from '@/lib/constants/mock-properties'
import type { Property } from '@/types/property'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const { filters, viewport } = useMapStore()

  // Query properties based on current viewport and filters
  const bounds = [
    viewport.longitude - 1,
    viewport.latitude - 1,
    viewport.longitude + 1,
    viewport.latitude + 1,
  ]

  const { data, isLoading, error, refetch } = useProperties({
    ...filters,
    bounds,
    limit: 100,
  })

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  // Use real data if available, fallback to mock data for demo
  const properties = data?.properties || MOCK_PROPERTIES

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="p-4 flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <span className="text-sm">Loading properties...</span>
          </Card>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <Card className="p-4 flex items-center gap-3 border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm">Failed to load properties. Using demo data.</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </Card>
        </div>
      )}

      <InteractiveMap
        properties={properties}
        onPropertyClick={handlePropertyClick}
        className="h-full w-full"
      />
      <PropertyPanel
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  )
}
