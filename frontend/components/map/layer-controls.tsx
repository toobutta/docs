'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/lib/stores/map-store'
import { Map, Layers, Sun, Home, Square, Mountain } from 'lucide-react'
import type { BasemapStyle, LayerType } from '@/types/map'

const basemapOptions: { value: BasemapStyle; label: string; icon: any }[] = [
  { value: 'satellite', label: 'Satellite', icon: Map },
  { value: 'streets', label: 'Streets', icon: Square },
  { value: 'terrain', label: 'Terrain', icon: Mountain },
]

const layerOptions: { value: LayerType; label: string }[] = [
  { value: 'parcels', label: 'Property Parcels' },
  { value: 'roofs', label: 'Roof Outlines' },
  { value: 'solar-potential', label: 'Solar Potential' },
  { value: 'buildings-3d', label: '3D Buildings' },
]

export function LayerControls() {
  const { basemap, setBasemap, activeLayers, toggleLayer, show3DBuildings, toggle3DBuildings } = useMapStore()

  return (
    <Card className="absolute left-4 top-4 z-10 w-64 p-4">
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Basemap</h3>
          <div className="grid grid-cols-3 gap-2">
            {basemapOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={basemap === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBasemap(option.value)}
                  className="flex flex-col h-auto py-2"
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-semibold">Layers</h3>
          <div className="space-y-2">
            {layerOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <label htmlFor={option.value} className="text-sm cursor-pointer">
                  {option.label}
                </label>
                <input
                  type="checkbox"
                  id={option.value}
                  checked={option.value === 'buildings-3d' ? show3DBuildings : activeLayers.has(option.value)}
                  onChange={() => {
                    if (option.value === 'buildings-3d') {
                      toggle3DBuildings()
                    } else {
                      toggleLayer(option.value)
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
