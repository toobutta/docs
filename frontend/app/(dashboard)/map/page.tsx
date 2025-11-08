'use client'

import { useState } from 'react'
import { InteractiveMap } from '@/components/map/interactive-map'
import { PropertyPanel } from '@/components/property/property-panel'
import { MOCK_PROPERTIES } from '@/lib/constants/mock-properties'
import type { Property } from '@/types/property'

export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <InteractiveMap
        properties={MOCK_PROPERTIES}
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
