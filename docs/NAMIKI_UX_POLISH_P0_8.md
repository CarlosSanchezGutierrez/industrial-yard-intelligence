# Namiki UX polish P0.8

## Purpose

This pass upgrades GPS from a conceptual visual map into a real interactive map experience.

## Added

- Leaflet map.
- OpenStreetMap tiles.
- Real GPS marker.
- Search result marker.
- Saved point markers.
- Perimeter vertex markers.
- Polygon / polyline drawing.
- Click on map to select point.
- Click on map to add perimeter vertex.
- Address/lugar search.
- Reverse geocoding retained.
- Current point accuracy circle.
- GeoJSON FeatureCollection export.
- Clipboard copy for GeoJSON.

## Frontend-only behavior

This is still frontend-only:

- GPS points are stored in browser localStorage.
- Perimeter vertices are stored in browser localStorage.
- Address search and reverse geocoding call OpenStreetMap Nominatim from the browser.
- No backend persistence yet.

## Production direction

For production:

- Proxy geocoding through backend.
- Persist points to API.
- Persist polygons/zones to spatial package/API.
- Add permission and audit trail per capture.
- Add offline-first queue for GPS captures.