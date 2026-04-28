import type { Geometry } from "./geometry.js";

export interface Feature<TGeometry extends Geometry = Geometry, TProperties = Record<string, unknown>> {
  readonly type: "Feature";
  readonly id?: string;
  readonly geometry: TGeometry;
  readonly properties: TProperties;
}

export function createFeature<TGeometry extends Geometry, TProperties>(
  geometry: TGeometry,
  properties: TProperties,
  id?: string
): Feature<TGeometry, TProperties> {
  if (id === undefined) {
    return {
      type: "Feature",
      geometry,
      properties
    };
  }

  return {
    type: "Feature",
    id,
    geometry,
    properties
  };
}