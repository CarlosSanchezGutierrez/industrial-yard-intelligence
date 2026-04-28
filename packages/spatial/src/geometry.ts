import { err, ok, type Result } from "@iyi/kernel";

export type Position2D = readonly [number, number];
export type Position3D = readonly [number, number, number];
export type Position = Position2D | Position3D;

export interface PointGeometry {
  readonly type: "Point";
  readonly coordinates: Position;
}

export interface LineStringGeometry {
  readonly type: "LineString";
  readonly coordinates: readonly Position[];
}

export interface PolygonGeometry {
  readonly type: "Polygon";
  readonly coordinates: readonly (readonly Position[])[];
}

export interface MultiPolygonGeometry {
  readonly type: "MultiPolygon";
  readonly coordinates: readonly (readonly (readonly Position[])[])[];
}

export type Geometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry
  | MultiPolygonGeometry;

export type SpatialValidationError =
  | "invalid_position"
  | "linestring_requires_two_positions"
  | "polygon_requires_outer_ring"
  | "linear_ring_requires_four_positions"
  | "linear_ring_must_be_closed"
  | "unsupported_geometry_type";

export function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function isValidPosition(position: Position): boolean {
  if (position.length !== 2 && position.length !== 3) {
    return false;
  }

  return position.every(isFiniteNumber);
}

export function positionEquals2D(left: Position, right: Position): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

export function isClosedLinearRing(ring: readonly Position[]): boolean {
  if (ring.length < 4) {
    return false;
  }

  const first = ring[0];
  const last = ring[ring.length - 1];

  if (!first || !last) {
    return false;
  }

  return positionEquals2D(first, last);
}

export function validateLinearRing(
  ring: readonly Position[]
): Result<true, SpatialValidationError> {
  if (ring.length < 4) {
    return err(
      "linear_ring_requires_four_positions",
      "A polygon linear ring must contain at least four positions."
    );
  }

  for (const position of ring) {
    if (!isValidPosition(position)) {
      return err("invalid_position", "A geometry position contains invalid coordinates.");
    }
  }

  if (!isClosedLinearRing(ring)) {
    return err("linear_ring_must_be_closed", "A polygon linear ring must be closed.");
  }

  return ok(true);
}

export function validateLineStringGeometry(
  geometry: LineStringGeometry
): Result<true, SpatialValidationError> {
  if (geometry.coordinates.length < 2) {
    return err(
      "linestring_requires_two_positions",
      "A LineString must contain at least two positions."
    );
  }

  for (const position of geometry.coordinates) {
    if (!isValidPosition(position)) {
      return err("invalid_position", "A geometry position contains invalid coordinates.");
    }
  }

  return ok(true);
}

export function validatePolygonGeometry(
  geometry: PolygonGeometry
): Result<true, SpatialValidationError> {
  if (geometry.coordinates.length === 0) {
    return err("polygon_requires_outer_ring", "A Polygon must contain an outer ring.");
  }

  for (const ring of geometry.coordinates) {
    const result = validateLinearRing(ring);

    if (!result.ok) {
      return result;
    }
  }

  return ok(true);
}

export function validateMultiPolygonGeometry(
  geometry: MultiPolygonGeometry
): Result<true, SpatialValidationError> {
  for (const polygonCoordinates of geometry.coordinates) {
    const result = validatePolygonGeometry({
      type: "Polygon",
      coordinates: polygonCoordinates
    });

    if (!result.ok) {
      return result;
    }
  }

  return ok(true);
}

export function validateGeometry(geometry: Geometry): Result<true, SpatialValidationError> {
  if (geometry.type === "Point") {
    return isValidPosition(geometry.coordinates)
      ? ok(true)
      : err("invalid_position", "A Point contains invalid coordinates.");
  }

  if (geometry.type === "LineString") {
    return validateLineStringGeometry(geometry);
  }

  if (geometry.type === "Polygon") {
    return validatePolygonGeometry(geometry);
  }

  if (geometry.type === "MultiPolygon") {
    return validateMultiPolygonGeometry(geometry);
  }

  return err("unsupported_geometry_type", "Unsupported geometry type.");
}