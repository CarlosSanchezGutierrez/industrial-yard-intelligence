# Auth Access Gate MVP

## Goal

Protect the SaaS route shell with real auth and role checks.

## What this adds

- Session-aware route gate.
- Platform role awareness.
- Tenant membership role awareness.
- Route-scoped panel hiding when the user does not have access.
- Basic sign in/sign out panel inside the SaaS shell.

## Routes protected

- /app
- /app/admin
- /app/operations
- /app/capture
- /app/data
- /aplomo-admin
- /dev-tools

## Role behavior

Aplomo platform roles:

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

Tenant roles:

- tenant_owner
- tenant_admin
- operations_manager
- site_supervisor
- capture_operator
- machine_operator
- analyst
- data_engineer
- data_scientist
- viewer

## Current limitation

This is a client-side MVP gate.

It improves product behavior and UX, but database enforcement still depends on Supabase RLS and server endpoints.

Final production hardening still needs:

- backend route guards
- audit logs for sensitive admin actions
- stronger permission checks in each API endpoint
- route-level deployment rewrites
