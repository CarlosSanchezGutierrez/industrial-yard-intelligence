import type { LineStringGeometry, PolygonGeometry, Position } from "./geometry.js";

function distance2D(left: Position, right: Position): number {
  return Math.hypot(right[0] - left[0], right[1] - left[1]);
}

export function calculatePlanarLineStringLength(line: LineStringGeometry): number {
  let length = 0;

  for (let index = 1; index < line.coordinates.length; index += 1) {
    const previous = line.coordinates[index - 1];
    const current = line.coordinates[index];

    if (!previous || !current) {
      continue;
    }

    length += distance2D(previous, current);
  }

  return length;
}

function calculateRingSignedArea(ring: readonly Position[]): number {
  let sum = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index];
    const next = ring[index + 1];

    if (!current || !next) {
      continue;
    }

    sum += current[0] * next[1] - next[0] * current[1];
  }

  return sum / 2;
}

export function calculatePlanarPolygonArea(polygon: PolygonGeometry): number {
  const outerRing = polygon.coordinates[0];

  if (!outerRing) {
    return 0;
  }

  const outerArea = Math.abs(calculateRingSignedArea(outerRing));
  const holesArea = polygon.coordinates
    .slice(1)
    .reduce((total, ring) => total + Math.abs(calculateRingSignedArea(ring)), 0);

  return Math.max(outerArea - holesArea, 0);
}

export function calculatePlanarPolygonPerimeter(polygon: PolygonGeometry): number {
  return polygon.coordinates.reduce((total, ring) => {
    const line = {
      type: "LineString" as const,
      coordinates: ring
    };

    return total + calculatePlanarLineStringLength(line);
  }, 0);
}