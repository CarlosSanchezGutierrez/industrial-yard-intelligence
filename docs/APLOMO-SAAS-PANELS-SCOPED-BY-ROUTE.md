# SaaS Panels Scoped By Route

## Goal

Each SaaS route should show only the panels that belong to its surface.

## Routes

- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin
- /dev-tools
- /?aplomoInternal=1

## Behavior

- /app/admin shows tenant administration and invite tools.
- /app/operations shows live operational tools.
- /app/capture shows GPS capture tools.
- /app/data is reserved for data hub, exports and data products.
- /aplomo-admin is reserved for Aplomo internal platform administration.
- /dev-tools and legacy internal mode can still show broad internal tooling.

## Files

- apps/web/src/internal/AplomoRouteScopedPanel.tsx
- apps/web/src/internal/mountAplomoInternalTools.tsx

## Next step

Add authenticated access context so route access depends on:

- platform_role
- tenant membership role
- permission surface
- active company
