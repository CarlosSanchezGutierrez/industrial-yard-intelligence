# Web Cloud API Panel

The web app can now inspect apps/api separately from apps/edge.

This keeps the architecture split clear:

apps/edge
Local/offline backend.

apps/api
Future cloud backend.

apps/web
Cockpit that can read from both.

Current web cloud API actions:

1. Load API health.
2. Load system overview.
3. Load tenants.
4. Load stockpiles.

Default API URL:

http://localhost:8788

Override with:

VITE_IYI_API_BASE_URL
## Stockpile lifecycle panel

The web cockpit now consumes:

GET /stockpiles/lifecycle

This lets the cockpit display the canonical status model from the shared domain layer.
## Audit mutations panel

The cockpit consumes:

GET /audit/summary
GET /audit/mutations

This gives supervisors visibility into stockpile creation and stockpile status update audit entries.