# Supabase persistence adapter — Aplomo Systems

## Objetivo

Crear el adaptador TypeScript de Supabase para implementar los puertos de persistencia.

## Archivo principal

packages/sync-core/src/aplomoSupabasePersistenceAdapter.ts

## Decisión importante

Este adaptador no importa `@supabase/supabase-js` directamente.

Recibe un cliente compatible.

Esto evita acoplar `sync-core` a una librería concreta y permite usarlo desde:

- backend API
- edge functions
- workers
- scripts internos
- tests
- service role
- clientes server-side

sin contaminar el frontend público.

## Qué implementa

- AplomoTelemetryPersistencePort
- AplomoGovernedEventRepositoryPort
- AplomoOperationalIntelligenceRepositoryPort
- AplomoDataPlatformRepositoryPort
- AplomoPersistenceAdapter

## Qué tablas usa

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

## Estado

Este es el primer adaptador real.

Todavía falta crear:

- API backend que lo use
- service role seguro
- seed inicial
- jobs de exportación
- workers de conectores
- endpoints SaaS
- pruebas de integración con Supabase local/remoto
