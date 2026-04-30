# SaaS Surface Layout MVP

## Goal

Make each SaaS route feel like its own product module instead of one shared internal console.

## Routes affected

- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin
- /dev-tools
- /?aplomoInternal=1

## What changed

Added:

- apps/web/src/internal/AplomoSaasSurfaceLayoutPanel.tsx

Updated:

- apps/web/src/internal/mountAplomoInternalTools.tsx

## Result

Each route now displays a surface-specific module header with:

- target audience
- primary goal
- active user
- platform role
- tenant roles
- modules in the surface
- next product actions

## Why this matters

The system now starts to behave like a real multi-surface SaaS product:

- Tenant Admin is separated conceptually from Operations.
- Capture is separated from Data Hub.
- Aplomo Super Admin is separated from customer-facing tools.
- Dev Tools remains a laboratory for internal work.

## Next step

Add production SPA rewrites for Vercel routes so direct links like /app/admin and /aplomo-admin work after deployment.
