import type { GeoGeometryObjects } from 'd3-geo'

export type Country = { id: string; name: string; geometry: GeoGeometryObjects }

export type CountriesMap = { zoom1x: Country[]; zoom2x: Country[] }