# Namiki GPS backend P1.0A

## Purpose

This pass adds real backend persistence for GPS capture packages.

## New API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/gps/health` | GPS capture API health |
| GET | `/gps/captures` | List saved GPS capture packages |
| POST | `/gps/captures` | Save GPS capture package |
| GET | `/gps/captures/:id` | Read one GPS capture package |
| DELETE | `/gps/captures/:id` | Delete one GPS capture package |
| DELETE | `/gps/captures` | Clear all GPS capture packages |
| POST | `/gps/captures/reset` | Clear all GPS capture packages |
| GET | `/gps/captures/export` | Export all GPS capture packages |

## Storage

Temporary durable development storage:

`.data/gps-captures.json`

## Smoke test

Start local stack first:

pnpm dev:stack:windows

Then run:

pnpm gps:smoke

## Next pass

P1.0B should connect the frontend GPS module to:

- `POST /gps/captures`
- `GET /gps/captures`
- `GET /gps/captures/export`

The current frontend can continue using localStorage as offline-first cache, but the package should sync to the backend when the API is available.