# Comandos pnpm de Aplomo Systems

## Objetivo

Este documento resume los comandos cortos registrados en `package.json`.

## Comandos base

Build web:

pnpm aplomo:build

Typecheck:

pnpm aplomo:typecheck

## QA

Si existe el script interno:

pnpm aplomo:qa

## Pre-demo

Si existe el script pre-demo:

pnpm aplomo:pre-demo

## Supabase

Revisión de archivos y preparación:

pnpm aplomo:supabase-check

Smoke test sin exigir configuración:

pnpm aplomo:supabase-smoke

Smoke test estricto:

pnpm aplomo:supabase-smoke:strict

Insertar captura GPS de prueba:

pnpm aplomo:supabase-insert-test

## Evidencia

Smoke test de evidencia sin exigir configuración:

pnpm aplomo:evidence-smoke

Smoke test de evidencia estricto:

pnpm aplomo:evidence-smoke:strict

Subir evidencia demo:

pnpm aplomo:evidence-upload-test

## Pre-piloto

Validación completa:

pnpm aplomo:pre-pilot

Validación rápida:

pnpm aplomo:pre-pilot:fast

Validación estricta con Supabase requerido:

pnpm aplomo:pre-pilot:strict

## Recomendación

Antes de enseñar:

pnpm aplomo:pre-pilot

Si ya corriste build y solo quieres revisar rápido:

pnpm aplomo:pre-pilot:fast
