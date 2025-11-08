'use client'

import { MapContainer } from './map-container'
import { LayerControls } from './layer-controls'
import type { MapLayerMouseEvent } from 'maplibre-gl'

interface InteractiveMapProps {
  onPropertyClick?: (lngLat: [number, number]) => void
  className?: string
}

export function InteractiveMap({ onPropertyClick, className }: InteractiveMapProps) {
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat
    onPropertyClick?.([lng, lat])
  }

  return (
    <div className={className}>
      <MapContainer onMapClick={handleMapClick} className="h-full w-full">
        <LayerControls />
      </MapContainer>
    </div>
  )
}
