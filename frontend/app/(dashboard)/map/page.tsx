'use client'

import { InteractiveMap } from '@/components/map/interactive-map'

export default function MapPage() {
  const handlePropertyClick = (lngLat: [number, number]) => {
    console.log('Clicked at:', lngLat)
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <InteractiveMap
        onPropertyClick={handlePropertyClick}
        className="h-full w-full"
      />
    </div>
  )
}
