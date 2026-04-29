# Namiki UX polish P0.9

## Purpose

This pass turns the GPS workspace into a full capture package experience.

## Added

- Capture package status:
  - Borrador
  - Listo para enviar
  - Sincronizado
- Capture quality score.
- GPS audit timeline.
- Audit persistence in localStorage.
- Package persistence in localStorage.
- Simulated sync.
- Ready-to-send state.
- Package export/copy.
- Quality checklist:
  - current location
  - interpreted address
  - saved point
  - perimeter
  - package state

## Why

The GPS module should feel like a real industrial field workflow:

1. Capture location.
2. Interpret address.
3. Associate material/evidence.
4. Save point.
5. Draw perimeter.
6. Audit every action.
7. Prepare package.
8. Simulate sync/export.

## Still frontend-only

No backend persistence yet. Current persistence is browser localStorage.

## Next recommended pass

P1.0:

- Persist GPS points through API.
- Persist polygons/zones through API.
- Add backend schema/contracts for GPS captures.
- Add offline sync queue.
- Add audit mutations for GPS captures.