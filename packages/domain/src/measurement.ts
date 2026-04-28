import type { ConfidenceLevel, MeasurementSourceType } from "@iyi/kernel";

const defaultConfidenceBySource: Readonly<Record<MeasurementSourceType, ConfidenceLevel>> = {
  manual_drawing: "operational",
  mobile_gps: "approximate",
  georeferenced_image: "georeferenced",
  simulated_orthomosaic: "simulated",
  gps_industrial: "operational",
  gnss_rtk: "centimeter_ready",
  survey_pole: "centimeter_ready",
  drone_rtk_ppk: "centimeter_ready",
  photogrammetry: "georeferenced",
  lidar: "georeferenced",
  total_station: "centimeter_ready",
  cad_gis_import: "georeferenced",
  geojson: "georeferenced",
  geotiff: "georeferenced",
  scale: "operational",
  external_sensor: "operational"
};

export function getDefaultConfidenceForMeasurementSource(
  sourceType: MeasurementSourceType
): ConfidenceLevel {
  return defaultConfidenceBySource[sourceType];
}

export function requiresProfessionalValidation(sourceType: MeasurementSourceType): boolean {
  return (
    sourceType === "gnss_rtk" ||
    sourceType === "survey_pole" ||
    sourceType === "drone_rtk_ppk" ||
    sourceType === "total_station"
  );
}