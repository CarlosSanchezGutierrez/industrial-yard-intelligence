# Contexto demo Supabase — Aplomo Systems

## Qué se agregó

Se agregó un repositorio para cargar el contexto demo desde Supabase.

Archivo:

apps/web/src/integrations/demoContextRepository.ts

## Qué carga

Busca la empresa por slug:

cooper-t-smith

Después intenta cargar:

- Empresa.
- Primer sitio.
- Primer patio.
- Primera zona.
- Primer operador.
- Primer supervisor.

## Para qué sirve

El panel interno cloud sync ya no necesita que copies manualmente todos los UUID.

Ahora puede llenar:

- companyId
- siteId
- yardId
- zoneId
- capturedByProfileId

## Cómo abrir el panel

https://aplomosystems.com/?aplomoInternal=1

## Requisito

Supabase debe tener ejecutados:

- docs/sql/aplomo_schema_v1.sql
- docs/sql/aplomo_seed_demo_v1.sql

También deben existir variables:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

## Nota

Esto sigue siendo herramienta interna.

No afecta la demo normal.
