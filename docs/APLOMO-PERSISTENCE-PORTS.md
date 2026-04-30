# Puertos de persistencia — Aplomo Systems

## Objetivo

Crear una capa de persistencia abstracta para preparar el backend real sin acoplar el sistema a Supabase.

## Principio

Supabase será un adaptador.

No será el centro del sistema.

El centro seguirá siendo:

- dominio
- contratos
- repositorios
- data governance
- alertas
- scores
- data products
- conectores
- eventos gobernados

## Archivo principal

packages/sync-core/src/aplomoPersistencePorts.ts

## Qué se agregó

### AplomoPersistenceAdapter

Adaptador general de persistencia.

Puede implementarse con:

- memory
- Supabase
- Postgres
- warehouse
- mock

### Telemetry persistence port

Para snapshots operativos de:

- devices
- sessions
- connections
- telemetry events
- latest positions

### Governed event repository

Para persistir eventos gobernados con:

- tenant partition key
- version
- persistedAt
- envelope completo

### Operational intelligence repository

Para persistir:

- alertas
- scores por dispositivo
- scores por sitio

### Data platform repository

Para persistir:

- data products
- export jobs
- external connectors
- LLM tools

## Por qué importa

Esto permite que mañana creemos:

- Supabase adapter
- Postgres adapter
- jobs worker
- API endpoints
- RLS
- multi tenant
- data exports
- connectors
- warehouse sync
- LLM tools

sin romper el panel interno ni el motor actual.

## Siguiente paso recomendado

Crear el adaptador Supabase como implementación concreta de estos puertos.

Primero solo schema/migrations y tipos.

Después operaciones reales:

- devices
- sessions
- connections
- telemetry_events
- latest_device_positions
- governed_events
- operational_alerts
- operational_scores
- data_products
- export_jobs
- connectors
- llm_tools
