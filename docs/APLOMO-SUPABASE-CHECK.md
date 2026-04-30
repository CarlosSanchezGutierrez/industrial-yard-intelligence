# Verificador Supabase — Aplomo Systems

## Objetivo

Este script revisa que la base para Supabase esté lista antes de conectar la UI.

## Comando

Desde la raíz del repo:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-supabase-check.ps1

## Qué revisa

- Schema SQL V1.
- Datos demo SQL.
- Borrador RLS.
- Variables de entorno ejemplo.
- Cliente Supabase.
- Repositorio GPS.
- Servicio de sincronización GPS.
- Imports ESM con extensión `.js`.
- Dependencia `@supabase/supabase-js`.

## Qué no hace

- No se conecta a Supabase.
- No ejecuta SQL.
- No cambia la UI.
- No sube datos reales.
- No necesita credenciales.

## Flujo recomendado

Antes de conectar el primer botón real de sincronización:

pnpm --filter @iyi/web... build
pnpm typecheck
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-supabase-check.ps1

## Siguiente paso

Después de que este check pase, lo siguiente es conectar el servicio `syncAplomoGpsCapture` a una acción controlada de la UI.

La mejor opción es agregar un botón interno tipo:

Probar sincronización cloud

Ese botón debe aparecer como herramienta interna, no como flujo principal para operadores.
