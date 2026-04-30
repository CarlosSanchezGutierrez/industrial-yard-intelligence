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
- Usar GPS real del dispositivo.
- Crear captura GPS en Supabase.
- Listar capturas recientes.
- Seleccionar una captura para evidencia.
- Subir foto o PDF a Supabase Storage.
- Guardar metadata de evidencia en `evidence_files`.
- Listar evidencia por captura.
- Listar evidencia reciente por empresa.
- Generar URL firmada y abrir evidencia privada.

## Requisito

Primero deben existir variables reales:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Y Supabase debe tener ejecutados:

- docs/sql/aplomo_schema_v1.sql
- docs/sql/aplomo_seed_demo_v1.sql
- docs/sql/aplomo_storage_setup_v1.sql

## Flujo de prueba recomendado

1. Abrir `?aplomoInternal=1`.
2. Presionar `Cargar contexto demo`.
3. Presionar `Usar GPS del dispositivo`.
4. Presionar `Probar sincronización cloud`.
5. Presionar `Listar capturas`.
6. Seleccionar archivo.
7. Presionar `Subir evidencia`.
8. Presionar `Listar evidencia de captura`.
9. Presionar `Abrir evidencia`.

## Importante

No aparece en la demo normal.

No afecta el flujo principal.

Es una herramienta interna.
