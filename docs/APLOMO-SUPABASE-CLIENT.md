# Cliente Supabase — Aplomo Systems

## Qué se agregó

Se instaló:

@supabase/supabase-js

Se crearon archivos base:

- apps/web/src/integrations/aplomoBackendConfig.ts
- apps/web/src/integrations/supabaseClient.ts
- apps/web/src/integrations/gpsCaptureRepository.ts
- apps/web/.env.example

## Qué hace

La app ahora tiene una base segura para conectarse a Supabase cuando existan variables reales.

Si no hay variables, el sistema se queda en modo local-demo.

## Qué no hace todavía

- No cambia la UI.
- No activa login.
- No guarda datos reales automáticamente.
- No reemplaza localStorage.
- No obliga a tener Supabase configurado para compilar.

## Variables necesarias después

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

## Variable prohibida en frontend

SUPABASE_SERVICE_ROLE_KEY

## Siguiente paso

Conectar un botón o flujo real de captura GPS para que intente guardar en Supabase cuando esté configurado.

La regla sigue siendo no conectar todo de golpe.
