# Listado de evidencia — Aplomo Systems

## Objetivo

Agregar funciones para consultar evidencia subida a Supabase.

## Archivo actualizado

apps/web/src/integrations/evidenceRepository.ts

## Funciones nuevas

- listAplomoEvidenceFilesForCapture
- listRecentAplomoEvidenceFilesForCompany
- createAplomoEvidenceSignedUrl

## Qué permiten

Consultar evidencia asociada a una captura GPS.

Consultar evidencias recientes de una empresa.

Crear una URL firmada temporal para ver o descargar un archivo privado desde Supabase Storage.

## Por qué importa

Esto completa la base mínima de evidencia:

1. Subir archivo a Storage.
2. Guardar metadata en evidence_files.
3. Listar evidencia.
4. Obtener URL temporal para visualizar archivo.

## Siguiente paso

Conectar estas funciones al panel interno para listar archivos subidos y abrir evidencia.

Después se puede mover este flujo al producto real.
