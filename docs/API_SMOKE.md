# API smoke

The API smoke test validates the runtime Cloud API through scripts/api-smoke.ps1.

## Stockpile lifecycle runtime check

The API smoke test validates GET /stockpiles/lifecycle.

Required assertions:

- response includes statuses
- response includes transitions
- response includes allowedTransitionsByStatus
- required statuses are present
- draft can transition to operational
- validated can transition to archived
- archived has no outgoing transitions