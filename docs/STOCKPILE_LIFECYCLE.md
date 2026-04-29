# Stockpile Lifecycle

Stockpile status transitions are now owned by packages/domain.

Allowed statuses:

- draft
- operational
- pending_review
- validated
- archived

Current transition policy:

- draft can move to operational, pending_review, validated or archived.
- operational can move to pending_review, validated or archived.
- pending_review can move to operational, validated or archived.
- validated can move back to pending_review or move to archived.
- archived is terminal.

Same-status updates are idempotent.

apps/api applies these rules through stockpile-service.ts.

This keeps lifecycle rules out of HTTP routing and ready for future mobile, edge and Postgres implementations.