# Vercel SPA Rewrites

## Goal

Allow SaaS routes to work when opened directly in production.

## Routes

- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin
- /dev-tools

## Why

The app is a Vite SPA. Browser routes must be rewritten to index.html so the client-side SaaS shell can resolve the route.

## Vercel config

vercel.json contains:

- /app -> /index.html
- /app/:path* -> /index.html
- /aplomo-admin -> /index.html
- /dev-tools -> /index.html

## Public landing

The public landing remains at /.
