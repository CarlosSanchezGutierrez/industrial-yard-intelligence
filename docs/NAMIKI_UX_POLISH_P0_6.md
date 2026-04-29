# Namiki UX polish P0.6

## Purpose

This pass adds real browser geolocation to the product experience.

## Added

- Real GPS permission request from browser/device.
- Current latitude.
- Current longitude.
- Accuracy in meters.
- Current location marker.
- Saved field points.
- Point label.
- Conceptual perimeter preview.
- Field workflow for:
  - current location
  - saved point
  - future perimeter
  - evidence association

## Notes

Browser geolocation works in:

- localhost
- HTTPS

It may fail on plain HTTP outside localhost.

## Next recommended pass

P0.7:

- Associate saved GPS points with material and evidence.
- Add perimeter drawing state.
- Add polygon save demo.
- Prepare API contract for persisted yard zones.