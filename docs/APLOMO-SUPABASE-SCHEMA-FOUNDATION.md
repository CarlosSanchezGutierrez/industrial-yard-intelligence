# Supabase schema foundation — Aplomo Systems

## Objetivo

Crear el schema base de Supabase como adaptador real de persistencia.

## Decisión arquitectónica

Supabase no es el centro del sistema.

Supabase es un adaptador para los puertos de persistencia.

Esto permite migrar o complementar después con:

- Postgres dedicado
- Snowflake
- Databricks
- data lake
- warehouse
- workers
- colas
- APIs propias

sin reescribir dominio ni lógica de negocio.

## Tablas creadas

- aplomo_companies
- aplomo_company_memberships
- aplomo_sites
- aplomo_devices
- aplomo_device_sessions
- aplomo_device_connections
- aplomo_telemetry_events
- aplomo_latest_device_positions
- aplomo_governed_events
- aplomo_operational_alerts
- aplomo_operational_score_snapshots
- aplomo_data_products
- aplomo_export_jobs
- aplomo_external_connectors
- aplomo_llm_tools

## RLS

Se activa row level security.

Los usuarios autenticados pueden leer datos solamente si pertenecen a la empresa.

Las escrituras se dejan para backend/service-role.

## Siguiente paso

Crear un adaptador TypeScript Supabase que implemente:

- AplomoTelemetryPersistencePort
- AplomoGovernedEventRepositoryPort
- AplomoOperationalIntelligenceRepositoryPort
- AplomoDataPlatformRepositoryPort

Ese adaptador debe vivir fuera del frontend público.
