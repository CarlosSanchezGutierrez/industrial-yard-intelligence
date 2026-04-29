# Namiki UX polish P0.7

## Purpose

This pass turns GPS into a premium frontend experience.

## Added

- Browser GPS request.
- Live tracking mode.
- Stop tracking.
- Reverse geocoding for approximate address.
- Address fields:
  - country
  - state
  - city
  - neighborhood / zone
  - street
  - postal code
- Manual field reference:
  - entre calles
  - access
  - visual reference
- Saved GPS points persisted in browser localStorage.
- Material association.
- Evidence type association.
- Visual map markers.
- Perimeter vertices.
- Polygon/perimeter visual preview.
- GeoJSON preview for current point.

## Runtime notes

Reverse geocoding currently uses OpenStreetMap Nominatim directly from the browser as a frontend demo.

For production, recommended options:

- backend proxy endpoint for reverse geocoding
- Mapbox Geocoding API
- Google Maps Geocoding API
- HERE / TomTom / Geoapify
- self-hosted geocoder if required

## Next recommended pass

P0.8:

- Add real map tiles using Leaflet.
- Add click-to-drop marker.
- Add draw polygon interaction.
- Persist GPS points and zones through backend endpoint.