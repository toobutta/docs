import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Viewport, BasemapStyle, LayerType, DrawMode } from '@/types/map'
import type { PropertyFilters } from '@/types/property'

interface MapStore {
  // View state
  viewport: Viewport
  basemap: BasemapStyle

  // Layers
  activeLayers: Set<LayerType>
  heatmapIntensity: number
  show3DBuildings: boolean

  // Drawing
  drawnTerritory: GeoJSON.Polygon | null
  drawMode: DrawMode

  // Filters
  filters: PropertyFilters

  // Actions
  setViewport: (viewport: Viewport) => void
  setBasemap: (basemap: BasemapStyle) => void
  toggleLayer: (layer: LayerType) => void
  setHeatmapIntensity: (intensity: number) => void
  toggle3DBuildings: () => void
  setDrawnTerritory: (territory: GeoJSON.Polygon | null) => void
  setDrawMode: (mode: DrawMode) => void
  clearDrawnTerritory: () => void
  setFilters: (filters: PropertyFilters) => void
  resetFilters: () => void
}

const defaultViewport: Viewport = {
  latitude: 33.7490,
  longitude: -84.3880,
  zoom: 12,
  bearing: 0,
  pitch: 0,
}

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      // Initial state
      viewport: defaultViewport,
      basemap: 'satellite',
      activeLayers: new Set(['parcels', 'roofs']),
      heatmapIntensity: 0.8,
      show3DBuildings: false,
      drawnTerritory: null,
      drawMode: null,
      filters: {},

      // Actions
      setViewport: (viewport) => set({ viewport }),

      setBasemap: (basemap) => set({ basemap }),

      toggleLayer: (layer) => {
        const layers = new Set(get().activeLayers)
        if (layers.has(layer)) {
          layers.delete(layer)
        } else {
          layers.add(layer)
        }
        set({ activeLayers: layers })
      },

      setHeatmapIntensity: (intensity) => set({ heatmapIntensity: intensity }),

      toggle3DBuildings: () => set({ show3DBuildings: !get().show3DBuildings }),

      setDrawnTerritory: (territory) => set({ drawnTerritory: territory }),

      setDrawMode: (mode) => set({ drawMode: mode }),

      clearDrawnTerritory: () => set({ drawnTerritory: null, drawMode: null }),

      setFilters: (filters) => set({ filters }),

      resetFilters: () => set({ filters: {} }),
    }),
    {
      name: 'evoteli-map-state',
      partialize: (state) => ({
        basemap: state.basemap,
        activeLayers: Array.from(state.activeLayers),
        heatmapIntensity: state.heatmapIntensity,
        show3DBuildings: state.show3DBuildings,
      }),
    }
  )
)
