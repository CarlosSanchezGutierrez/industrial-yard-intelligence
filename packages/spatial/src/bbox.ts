import { err, ok, type Result } from "@iyi/kernel";
import type { Geometry, Position } from "./geometry.js";

export interface BoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export type BoundingBoxError = "empty_geometry";

function bboxFromPosition(position: Position): BoundingBox {
  return {
    minX: position[0],
    minY: position[1],
    maxX: position[0],
    maxY: position[1]
  };
}

function expandBoundingBox(box: BoundingBox, position: Position): BoundingBox {
  return {
    minX: Math.min(box.minX, position[0]),
    minY: Math.min(box.minY, position[1]),
    maxX: Math.max(box.maxX, position[0]),
    maxY: Math.max(box.maxY, position[1])
  };
}

export function collectPositions(geometry: Geometry): readonly Position[] {
  if (geometry.type === "Point") {
    return [geometry.coordinates];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates;
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.flatMap((ring) => ring);
  }

  return geometry.coordinates.flatMap((polygon) => polygon.flatMap((ring) => ring));
}

export function calculateBoundingBox(
  geometry: Geometry
): Result<BoundingBox, BoundingBoxError> {
  const positions = collectPositions(geometry);
  const first = positions[0];

  if (!first) {
    return err("empty_geometry", "Cannot calculate bounding box for empty geometry.");
  }

  let box = bboxFromPosition(first);

  for (const position of positions.slice(1)) {
    box = expandBoundingBox(box, position);
  }

  return ok(box);
}