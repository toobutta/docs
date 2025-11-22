'use client'

import { MapContainer } from './map-container'
import { LayerControls } from './layer-controls'
import { PropertyMarkers } from './property-markers'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import type { Property } from '@/types/property'

interface InteractiveMapProps {
  properties?: Property[]
  onPropertyClick?: (property: Property) => void
  onMapClick?: (lngLat: [number, number]) => void
  className?: string
}

export function InteractiveMap({
  properties = [],
  onPropertyClick,
  onMapClick,
  className
}: InteractiveMapProps) {
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    onMapClick?.([lng, lat])
  }

  return (
    <div className={className}>
      <MapContainer onMapClick={handleMapClick} className="h-full w-full">
        <LayerControls />
        {properties.length > 0 && (
          <PropertyMarkers
            properties={properties}
            onPropertyClick={onPropertyClick}
          />
        )}
      </MapContainer>
    </div>
  )
}
