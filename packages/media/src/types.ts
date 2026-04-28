export const evidenceTypes = [
  "photo",
  "document",
  "image",
  "geojson",
  "geotiff",
  "cad_gis_file",
  "point_cloud",
  "scale_ticket",
  "drone_output",
  "measurement_file",
  "incident_file",
  "other"
] as const;

export type EvidenceType = (typeof evidenceTypes)[number];

export const storageProviderTypes = [
  "local_filesystem",
  "edge_storage",
  "cloud_object_storage",
  "external_reference"
] as const;

export type StorageProviderType = (typeof storageProviderTypes)[number];

export const integrityHashAlgorithms = [
  "sha256",
  "sha512"
] as const;

export type IntegrityHashAlgorithm = (typeof integrityHashAlgorithms)[number];

export const evidenceLinkTypes = [
  "entity",
  "event",
  "measurement_session",
  "audit_entry",
  "scenario",
  "recommendation"
] as const;

export type EvidenceLinkType = (typeof evidenceLinkTypes)[number];