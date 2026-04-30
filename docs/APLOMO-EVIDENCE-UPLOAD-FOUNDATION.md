# Evidencia con Supabase Storage — Aplomo Systems

## Objetivo

Preparar la base para subir fotos o archivos asociados a capturas GPS.

## Archivos agregados

- apps/web/src/integrations/evidenceRepository.ts
- docs/sql/aplomo_storage_setup_v1.sql
- docs/APLOMO-EVIDENCE-UPLOAD-FOUNDATION.md

## Qué hace el repositorio

`uploadAplomoEvidenceFile` permite:

- Subir archivo a Supabase Storage.
- Guardar metadata en `evidence_files`.
- Asociar evidencia a una captura GPS.
- Asociar evidencia a empresa.
- Guardar nombre, tipo, mime type, tamaño y ruta.

## Bucket recomendado

aplomo-evidence

## Orden para probar después

1. Ejecutar `docs/sql/aplomo_schema_v1.sql`.
2. Ejecutar `docs/sql/aplomo_seed_demo_v1.sql`.
3. Ejecutar `docs/sql/aplomo_storage_setup_v1.sql`.
4. Crear `apps/web/.env.local`.
5. Probar conexión con `scripts/aplomo-supabase-smoke.ps1`.
6. Después conectar UI de evidencia.

## Qué no hace todavía

- No cambia pantallas.
- No sube fotos automáticamente.
- No activa auth.
- No crea políticas finales de storage.
- No reemplaza la demo local.

## Siguiente paso recomendado

Crear un panel interno para subir una foto de prueba ligada a una captura GPS ya existente.

Después de eso, conectar evidencia al flujo real de captura.
