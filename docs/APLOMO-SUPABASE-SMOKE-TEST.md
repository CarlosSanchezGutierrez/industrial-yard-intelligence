# Supabase smoke test — Aplomo Systems

## Objetivo

Este script prueba la conexión real a Supabase desde PowerShell.

No toca la UI.

No necesita navegador.

## Archivo

scripts/aplomo-supabase-smoke.ps1

## Requisito

Crear este archivo local:

apps/web/.env.local

Con:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

No poner service role key en frontend.

## Comando seguro

Solo consulta:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-supabase-smoke.ps1

## Comando estricto

Falla si Supabase no está configurado:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-supabase-smoke.ps1 -RequireConfigured

## Comando con inserción de prueba

Inserta una captura GPS demo:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\aplomo-supabase-smoke.ps1 -InsertTestCapture

## Qué revisa

- Lee variables de entorno.
- Consulta la empresa demo `cooper-t-smith`.
- Consulta capturas GPS recientes.
- Opcionalmente inserta una captura GPS de prueba.

## Orden recomendado

1. Crear proyecto Supabase.
2. Ejecutar `docs/sql/aplomo_schema_v1.sql`.
3. Ejecutar `docs/sql/aplomo_seed_demo_v1.sql`.
4. Crear `apps/web/.env.local`.
5. Correr smoke test.
6. Abrir panel interno con `?aplomoInternal=1`.

## Si falla

Revisar:

- URL Supabase.
- Anon key.
- Que exista tabla `companies`.
- Que exista empresa `cooper-t-smith`.
- Que RLS no bloquee lectura.
- Que el schema se haya ejecutado completo.
