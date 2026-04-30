# SaaS Router Shell MVP

## Goal

Move from only using:

?aplomoInternal=1

toward real SaaS routes:

- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin
- /dev-tools

## What changed

Added:

- apps/web/src/internal/aplomoSaasRoutes.ts
- apps/web/src/internal/AplomoSaasNavigationPanel.tsx

Updated:

- apps/web/src/internal/mountAplomoInternalTools.tsx

## Current behavior

The SaaS shell mounts when one of these is true:

- URL has ?aplomoInternal=1
- path is /app
- path is /app/admin
- path is /app/operations
- path is /app/capture
- path is /app/data
- path is /aplomo-admin
- path is /dev-tools

The public landing remains untouched at:

/

## Important

This is still not the final role router.

The next steps are:

1. Load current user session.
2. Load access context.
3. Decide allowed surfaces by role and membership.
4. Hide panels that do not match the current route.
5. Redirect users after login:
   - tenant admin -> /app/admin
   - supervisor -> /app/operations
   - capture operator -> /app/capture
   - analyst/data users -> /app/data
   - Aplomo owners -> /aplomo-admin
