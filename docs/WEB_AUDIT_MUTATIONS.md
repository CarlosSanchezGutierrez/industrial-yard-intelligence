# Web audit mutations panel

The cockpit now reads Cloud API mutation audit data from:

GET /audit/summary
GET /audit/mutations

The panel displays:

- total audit entry count
- stockpile creation count
- stockpile status update count
- latest audit entries

This is the first cockpit visibility layer for traceability and accountability in the Cloud API.
## Stockpile audit history

The cockpit now reads entity-level audit history from:

GET /audit/stockpiles/:id

The audit panel lets supervisors select a stockpile and inspect its stockpile-specific mutation timeline.