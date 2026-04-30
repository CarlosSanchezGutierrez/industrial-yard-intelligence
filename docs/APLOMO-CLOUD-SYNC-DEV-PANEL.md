# Panel interno cloud sync — Aplomo Systems

## Objetivo

Este componente permite probar sincronización cloud con Supabase desde una herramienta interna.

## Archivo principal

apps/web/src/internal/AplomoCloudSyncDevPanel.tsx

## Cómo abrirlo

Abrir la app con:

https://aplomosystems.com/?aplomoInternal=1

## Qué permite

- Ver el modo backend.
- Cargar el contexto demo por slug `cooper-t-smith`.
- Llenar automáticamente IDs de empresa, sitio, patio, zona y operador.
- Probar una captura GPS contra Supabase.
- Listar capturas recientes de la empresa.
- Ver si la sincronización realmente quedó guardada.

## Requisito

Primero deben existir variables reales:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Y Supabase debe tener ejecutados:

- docs/sql/aplomo_schema_v1.sql
- docs/sql/aplomo_seed_demo_v1.sql

## Flujo de prueba recomendado

1. Abrir `?aplomoInternal=1`.
2. Presionar `Cargar contexto demo`.
3. Presionar `Probar sincronización cloud`.
4. Presionar `Listar capturas`.
5. Confirmar que aparece la captura nueva.

## Importante

No aparece en la demo normal.

No afecta el flujo principal.

Es una herramienta interna.
