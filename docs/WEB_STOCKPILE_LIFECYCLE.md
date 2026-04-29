# Web stockpile lifecycle

The cockpit loads stockpile lifecycle metadata from the Cloud API:

GET /stockpiles/lifecycle

The web panel displays:

- canonical stockpile statuses
- explicit transitions
- allowed transitions by current status

The source of truth remains `@iyi/domain`, exposed through `apps/api` and consumed by `apps/web`.