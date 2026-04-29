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
## Mutation audit runtime check

The API smoke test validates:

GET /audit/summary
GET /audit/mutations

Required assertions:

- audit summary includes auditEntryCount
- audit summary includes mutationCountsByType
- audit mutation list includes entries
- runtime smoke mutations create stockpile.created audit entries
- runtime smoke mutations create stockpile.status_updated audit entries
## Stockpile audit history runtime check

The API smoke test validates:

GET /audit/stockpiles/:id

Required assertions:

- stockpile id is discovered from audit mutation entries
- stockpile history response includes matching stockpileId
- stockpile history response includes entries
- every returned history entry belongs to the selected stockpile
## Cloud Edge sync runtime check

The API smoke test validates:

GET /sync/status
POST /sync/preview
POST /sync/ingest

Required assertions:

- sync status exposes supported package kinds
- sync status exposes supported conflict policies
- sync status exposes supported directions
- preview mode accepts a valid package without applying records
- ingest apply mode validates the package but remains disabled
- apply mode returns zero applied records and skips the package payload count