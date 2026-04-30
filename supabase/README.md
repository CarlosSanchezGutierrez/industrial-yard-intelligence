# Supabase — Aplomo Systems

Supabase se usa como adaptador de persistencia, no como centro del sistema.

La arquitectura principal vive en:

- packages/domain
- packages/api-contracts
- packages/sync-core

Supabase implementará después los puertos definidos en:

- packages/sync-core/src/aplomoPersistencePorts.ts

## Migraciones

Las migraciones están en:

- supabase/migrations

## Primer schema

La primera migración crea:

- companies
- company memberships
- sites
- devices
- device sessions
- device connections
- telemetry events
- latest device positions
- governed events
- operational alerts
- operational score snapshots
- data products
- export jobs
- external connectors
- llm tools

## Seguridad

El schema activa RLS.

Los usuarios autenticados solo pueden leer datos de empresas donde son miembros.

Las escrituras productivas deberán hacerse después mediante:

- API backend
- service role
- edge functions
- jobs
- workers

No desde el frontend directamente.
