# Domain Glossary

## Organization

A company or customer using the platform.

Initial organization:

- Cooper/T. Smith

Future organizations may include ports, cement plants, mines, steel companies, recycling yards, or logistics yards.

## Terminal

A physical industrial operation belonging to an organization.

Example:

- Cooper/T. Smith Altamira terminal

## Yard

A defined spatial area within a terminal where materials, equipment, or operations exist.

Examples:

- Muelle 1
- Muelle 2
- Patios de almacenaje
- Bodega
- Placa de concreto

## Zone

A smaller defined area inside a yard.

Examples:

- storage zone
- restricted zone
- loading zone
- unloading zone
- rail zone
- equipment zone

## Asset

Any important object represented in the system.

Examples:

- stockpile
- equipment
- infrastructure
- route
- scale
- warehouse
- conveyor
- rail spur

## Material

A cargo or product handled in the yard.

Categories:

- Graneles minerales
- Acero
- Químicos, fertilizantes e insumos industriales
- Carga general

## Stockpile

A spatial representation of stored material, usually modeled with geometry and operational properties.

A stockpile can have:

- material
- geometry
- estimated area
- estimated quantity
- validation state
- confidence level
- evidence
- movement history
- measurement history

## Equipment

Operational machinery or equipment used in the yard.

Examples:

- crane
- hopper
- conveyor
- telestacker
- loader
- excavator
- reachstacker
- forklift
- rail tractor

Equipment can have:

- location
- state
- capability
- current operation
- movement history
- related material movements

## Infrastructure

Fixed or semi-fixed physical components of the terminal.

Examples:

- dock
- rail spur
- scale
- conveyor system
- warehouse
- concrete slab
- route
- restricted area

## Movement

An operational event that changes the location, geometry, quantity, state, responsibility, equipment association, or operational condition of an asset.

Movement types include:

- ARRIVAL
- VESSEL_DISCHARGE
- STOCKPILE_CREATED
- STOCKPILE_MOVED
- STOCKPILE_RESHAPED
- STOCKPILE_SPLIT
- STOCKPILE_MERGED
- QUANTITY_UPDATED
- EQUIPMENT_ASSIGNED
- EQUIPMENT_MOVED
- LOADED_TO_TRUCK
- LOADED_TO_RAIL
- TRANSFERRED_TO_YARD
- VALIDATED
- CORRECTED
- INCIDENT_REPORTED
- MEASUREMENT_ADDED
- MEASUREMENT_REPLACED
- SCENARIO_APPLIED

## Measurement Source

The origin method or technology used to capture spatial or operational data.

Examples:

- manual drawing
- mobile GPS
- georeferenced image
- simulated orthomosaic
- GPS industrial
- GNSS RTK
- survey pole
- drone RTK/PPK
- photogrammetry
- LiDAR
- total station
- CAD/GIS import
- GeoJSON
- GeoTIFF
- scale
- external sensor

## Measurement Session

A captured measurement workflow that may include source type, operator, device, raw files, processed geometry, confidence level, and validation status.

## Evidence

Any file or record attached to an operational event, asset, measurement, or validation.

Examples:

- photo
- document
- image
- GeoJSON
- map layer
- future GeoTIFF
- future point cloud

## Validation

The process of reviewing or approving operational data, spatial data, measurements, or events.

Suggested validation states:

- draft
- operational
- pending_review
- validated
- corrected
- rejected
- superseded
- archived

## Confidence Level

The expected reliability of the data.

Suggested levels:

- simulated
- approximate
- operational
- georeferenced
- centimeter_ready
- professionally_validated

## Scenario

A simulated or planned operational condition used to compare possible outcomes.

Examples:

- yard saturation
- equipment downtime
- simultaneous discharge
- incompatible material arrival
- rail flow priority
- stockpile rearrangement
- pending topographic validation

## Recommendation

A system-generated suggestion based on rules, heuristics, scores, or future ML models.

Recommendations may include:

- priority score
- reason
- impacted assets
- risk level
- suggested action

## KPI

A business metric shown to executives and operators.

KPI values must be classified as:

- real
- estimated
- simulated
- pending_validation
