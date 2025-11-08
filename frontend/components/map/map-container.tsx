'use client'

import { useRef, useCallback, useEffect } from 'react'
import Map, { MapRef, NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import { useMapStore } from '@/lib/stores/map-store'
import { MAP_STYLES } from '@/lib/constants/map-styles'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapContainerProps {
  onMapClick?: (event: MapLayerMouseEvent) => void
  children?: React.ReactNode
  className?: string
}

export function MapContainer({ onMapClick, children, className }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null)
  const { viewport, basemap, setViewport } = useMapStore()

  const handleMove = useCallback((evt: any) => {
    setViewport({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
      bearing: evt.viewState.bearing,
      pitch: evt.viewState.pitch,
    })
  }, [setViewport])

  const handleClick = useCallback((event: MapLayerMouseEvent) => {
    onMapClick?.(event)
  }, [onMapClick])

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={handleMove}
        onClick={handleClick}
        mapStyle={MAP_STYLES[basemap]}
        style={{ width: '100%', height: '100%' }}
        maxZoom={20}
        minZoom={3}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />
        {children}
      </Map>
    </div>
  )
}
