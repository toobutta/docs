'use client'

import { useMemo } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import { useMapStore } from '@/lib/stores/map-store'
import type { Property } from '@/types/property'
import { Home, Building2 } from 'lucide-react'

interface PropertyMarkersProps {
  properties: Property[]
  onPropertyClick?: (property: Property) => void
}

export function PropertyMarkers({ properties, onPropertyClick }: PropertyMarkersProps) {
  const { viewport } = useMapStore()

  const cluster = useMemo(() => {
    const index = new Supercluster<Property>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
      minPoints: 3,
    })

    const points = properties.map(p => ({
      type: 'Feature' as const,
      properties: p,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude] as [number, number],
      },
    }))

    index.load(points)
    return index
  }, [properties])

  const clusters = useMemo(() => {
    const bounds = [
      viewport.longitude - 1,
      viewport.latitude - 1,
      viewport.longitude + 1,
      viewport.latitude + 1,
    ] as [number, number, number, number]

    return cluster.getClusters(bounds, Math.floor(viewport.zoom))
  }, [cluster, viewport.zoom, viewport.longitude, viewport.latitude])

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count: pointCount } = cluster.properties as any

        if (isCluster) {
          const size = 30 + (pointCount / properties.length) * 40

          return (
            <Marker
              key={`cluster-${cluster.id}`}
              latitude={latitude}
              longitude={longitude}
            >
              <div
                className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              >
                {pointCount}
              </div>
            </Marker>
          )
        }

        const property = cluster.properties as Property
        const Icon = property.property_type === 'commercial' ? Building2 : Home

        return (
          <Marker
            key={`property-${property.id}`}
            latitude={latitude}
            longitude={longitude}
          >
            <div
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onPropertyClick?.(property)}
            >
              <div className="rounded-full bg-background border-2 border-primary p-1.5 shadow-md">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </Marker>
        )
      })}
    </>
  )
}
