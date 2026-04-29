# API Application Services

apps/api now separates HTTP routing from application behavior.

Current services:

stockpile-service.ts

Responsibilities:

1. Parse stockpile creation commands.
2. Validate required fields.
3. Normalize defaults.
4. Reject duplicate stockpile IDs.
5. Persist records through the DB store.
6. Return API-safe stockpile summaries.

Route layer:

routes.ts owns HTTP response shape.

Service layer:

stockpile-service.ts owns stockpile application logic.

This keeps apps/api ready for auth, validation, permissions and Postgres later.