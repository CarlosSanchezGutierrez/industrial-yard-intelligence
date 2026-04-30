# Aplomo Internal Console Isolation

## Goal

When the internal SaaS console is opened with:

?aplomoInternal=1

the public landing page must not remain visible behind or above the internal tools.

## What changed

Added:

- apps/web/src/internal/aplomoInternalConsoleIsolation.ts

Updated:

- apps/web/src/internal/mountAplomoInternalTools.tsx

## Behavior

The internal console now mounts as a full-screen isolated shell:

- fixed viewport
- dark SaaS console background
- own scroll area
- very high z-index
- public #root hidden from view
- body scroll disabled behind console

## Why this is still temporary

This is the correct surgical fix for the current internal mode.

The final product should later move to protected routes:

- /login
- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin

with auth, tenant role and permission routing.
