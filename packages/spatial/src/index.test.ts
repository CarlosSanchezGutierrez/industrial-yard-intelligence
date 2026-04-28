import { describe, expect, it } from "vitest";
import {
  calculateBoundingBox,
  calculatePlanarLineStringLength,
  calculatePlanarPolygonArea,
  calculatePlanarPolygonPerimeter,
  createFeature,
  isClosedLinearRing,
  validateGeometry,
  type LineStringGeometry,
  type PolygonGeometry
} from "./index.js";

describe("@iyi/spatial", () => {
  const square: PolygonGeometry = {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0]
      ]
    ]
  };

  it("validates closed polygon rings", () => {
    expect(isClosedLinearRing(square.coordinates[0] ?? [])).toBe(true);
    expect(validateGeometry(square).ok).toBe(true);
  });

  it("rejects open polygon rings", () => {
    const openPolygon: PolygonGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10]
        ]
      ]
    };

    const result = validateGeometry(openPolygon);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("linear_ring_must_be_closed");
    }
  });

  it("calculates bounding boxes", () => {
    const result = calculateBoundingBox(square);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        minX: 0,
        minY: 0,
        maxX: 10,
        maxY: 10
      });
    }
  });

  it("calculates planar polygon area", () => {
    expect(calculatePlanarPolygonArea(square)).toBe(100);
  });

  it("calculates planar polygon perimeter", () => {
    expect(calculatePlanarPolygonPerimeter(square)).toBe(40);
  });

  it("calculates planar line length", () => {
    const line: LineStringGeometry = {
      type: "LineString",
      coordinates: [
        [0, 0],
        [3, 4]
      ]
    };

    expect(calculatePlanarLineStringLength(line)).toBe(5);
  });

  it("creates GeoJSON-like features", () => {
    const feature = createFeature(square, {
      label: "Simulated stockpile"
    });

    expect(feature.type).toBe("Feature");
    expect(feature.properties.label).toBe("Simulated stockpile");
  });
});