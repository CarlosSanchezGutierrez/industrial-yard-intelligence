# Evidence smoke test — Aplomo Systems

## Objetivo

Probar Supabase Storage y la tabla evidence_files desde PowerShell.

## Archivo

scripts/aplomo-evidence-smoke.ps1

## Requisito

Crear:

apps/web/.env.local

Con:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

También deben existir en Supabase:

- docs/sql/aplomo_schema_v1.sql
- docs/sql/aplomo_seed_demo_v1.sql
- docs/sql/aplomo_storage_setup_v1.sql

## Comando seguro

Solo consulta empresa, captura y evidencia:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-evidence-smoke.ps1

## Comando estricto

Falla si no hay Supabase configurado:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-evidence-smoke.ps1 -RequireConfigured

## Comando con subida real

Sube una imagen PNG demo a Storage y guarda metadata en evidence_files:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-evidence-smoke.ps1 -UploadTestEvidence

## Orden recomendado

1. Crear Supabase.
2. Ejecutar schema.
3. Ejecutar seed.
4. Ejecutar storage setup.
5. Crear una captura GPS.
6. Ejecutar este smoke test con -UploadTestEvidence.
7. Abrir el panel interno con ?aplomoInternal=1.
8. Listar evidencia y abrir archivo.

## Nota

Este script no toca la UI.

Sirve para validar backend antes de conectar evidencia al flujo principal.
