# Web Stockpile Status Flow

The web app can now update stockpile status through apps/api.

Flow:

1. Start apps/api.
2. Start apps/web.
3. Load Cloud API.
4. Select a stockpile.
5. Choose a new status.
6. Submit status update.
7. apps/api writes the updated stockpile to .api-data/api-db.json.
8. The Cloud API panel refreshes.

Endpoint used:

PATCH /stockpiles/:id/status

Allowed statuses:

- draft
- operational
- pending_review
- validated
- archived

This is the first supervisor-style write flow in the web cockpit.
## Dynamic lifecycle options

The status update panel loads allowed status transitions from:

GET /stockpiles/lifecycle

The selected stockpile current status is used to filter valid target statuses before calling the update endpoint.