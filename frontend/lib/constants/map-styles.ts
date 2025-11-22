import type { BasemapStyle } from '@/types/map'

export const MAP_STYLES: Record<BasemapStyle, string> = {
  satellite: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  streets: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  terrain: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

export const DEFAULT_MAP_STYLE = MAP_STYLES.satellite

export const DEFAULT_VIEWPORT = {
  latitude: 33.7490,
  longitude: -84.3880,
  zoom: 12,
  bearing: 0,
  pitch: 0,
}

export const ATLANTA_BOUNDS: [number, number, number, number] = [
  -84.55, 33.65, -84.29, 33.89
]
