# Primera conexión real a backend — Aplomo Systems

## Estado actual

La app sigue funcionando como demo local-first.

Ya existen:

- Schema SQL V1.
- Datos demo SQL.
- Borrador de seguridad RLS.
- Variables de entorno ejemplo.
- Config TypeScript para detectar si Supabase está configurado.

## Archivo TypeScript

apps/web/src/integrations/aplomoBackendConfig.ts

## Qué hace

Detecta si existen:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Si existen y parecen válidas, marca modo:

supabase-ready

Si no existen, mantiene modo:

local-demo

## Qué no hace todavía

- No instala supabase-js.
- No crea cliente Supabase.
- No cambia la UI.
- No cambia el flujo actual.
- No guarda datos reales todavía.

## Siguiente paso técnico recomendado

Instalar cliente Supabase:

pnpm --filter @iyi/web add @supabase/supabase-js

Después crear:

apps/web/src/integrations/supabaseClient.ts

Y conectar solo una función:

Crear captura GPS.

## Regla

No conectar todo de golpe.

Orden correcto:

1. Config.
2. Cliente Supabase.
3. Crear captura GPS.
4. Listar capturas.
5. Subir evidencia.
6. Auth.
7. RLS.
