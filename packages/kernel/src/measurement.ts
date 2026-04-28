export const measurementSourceTypes = [
  "manual_drawing",
  "mobile_gps",
  "georeferenced_image",
  "simulated_orthomosaic",
  "gps_industrial",
  "gnss_rtk",
  "survey_pole",
  "drone_rtk_ppk",
  "photogrammetry",
  "lidar",
  "total_station",
  "cad_gis_import",
  "geojson",
  "geotiff",
  "scale",
  "external_sensor"
] as const;

export type MeasurementSourceType = (typeof measurementSourceTypes)[number];
