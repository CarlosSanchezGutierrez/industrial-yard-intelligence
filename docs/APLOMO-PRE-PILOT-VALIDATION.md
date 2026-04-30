# Validador maestro pre-piloto — Aplomo Systems

## Objetivo

Este script ejecuta una revisión completa antes de enseñar o probar el piloto técnico.

## Archivo

scripts/aplomo-pre-pilot-validate.ps1

## Comando normal

No inserta datos reales:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-pilot-validate.ps1

## Comando rápido

Omite build y typecheck:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-pilot-validate.ps1 -SkipBuild

## Comando estricto con Supabase requerido

Falla si Supabase no está configurado:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-pilot-validate.ps1 -RequireSupabase

## Comando con inserción de captura GPS de prueba

Inserta una captura demo:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-pilot-validate.ps1 -RequireSupabase -InsertGpsTestCapture

## Comando con evidencia de prueba

Sube una imagen PNG demo a Storage y guarda metadata:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-pre-pilot-validate.ps1 -RequireSupabase -UploadEvidenceTest

## Qué revisa

- Estado de Git.
- Build web.
- Typecheck.
- QA interno si existe.
- Supabase readiness check.
- Supabase smoke test.
- Evidence smoke test.
- Producción básica.
- Checklist manual.

## Uso recomendado

Antes de presentar o probar piloto:

1. Ejecutar este script.
2. Abrir producción.
3. Revisar celular.
4. Revisar panel interno.
5. Confirmar GPS, capturas y evidencia.
