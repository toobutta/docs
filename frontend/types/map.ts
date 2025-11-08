export interface Viewport {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
}

export type BasemapStyle = 'satellite' | 'streets' | 'terrain'

export type LayerType =
  | 'parcels'
  | 'roofs'
  | 'solar-potential'
  | 'heatmap'
  | 'buildings-3d'
  | 'driveways'

export interface MapLayer {
  id: LayerType
  name: string
  visible: boolean
  opacity: number
}

export type DrawMode = 'polygon' | 'radius' | null

export interface DrawnTerritory {
  type: 'Feature'
  geometry: GeoJSON.Polygon
  properties: {
    radius?: number // for radius mode
    center?: [number, number] // for radius mode
  }
}
