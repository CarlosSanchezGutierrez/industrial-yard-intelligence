# Data Model V1

## Core entities

app_tenants
Customer or organization boundary.

terminals
Physical terminal or yard location.

app_users
Operators, supervisors, admins and viewers.

devices
Web, Android, edge, sensor or external devices.

stockpiles
Material piles tracked inside the yard.

yard_zones
Named areas, docks, routes, warehouses and restricted zones.

measurements
Quantity observations for stockpiles or yard operations.

sync_events
Local-first events received by edge or future cloud APIs.

conflict_resolutions
Supervisor decisions for sync conflicts.

audit_entries
Append-only audit chain entries with SHA-256 integrity hashes.

evidence_items
Photos, documents, GeoJSON, RTK observations and other evidence with SHA-256 metadata.

## Version

Current migration:

2026_04_28_0001_core_schema

## Strategy

This schema is intentionally relational and PostgreSQL-friendly.

The edge can later map the same logical model into SQLite for offline local persistence.

The web should not own data rules directly. It should consume API contracts and display state.

The Android app should produce sync events and evidence records, not directly mutate core tables.