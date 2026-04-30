# Servicio de sincronización GPS — Aplomo Systems

## Objetivo

Este avance deja lista la capa que después usará la UI para sincronizar capturas GPS con Supabase.

## Archivos

- apps/web/src/integrations/aplomoBackendConfig.ts
- apps/web/src/integrations/supabaseClient.ts
- apps/web/src/integrations/gpsCaptureRepository.ts
- apps/web/src/integrations/gpsSyncService.ts
- apps/web/src/integrations/index.ts
- apps/web/.env.example

## Qué hace

El servicio `syncAplomoGpsCapture` intenta sincronizar una captura GPS.

Si Supabase no está configurado, no rompe la app. Regresa estado skipped y mantiene el flujo local-demo.

Si Supabase está configurado, intenta insertar en la tabla `gps_captures`.

## Qué no hace todavía

- No cambia la UI.
- No activa auth.
- No reemplaza localStorage.
- No sincroniza automáticamente.
- No sube evidencia todavía.

## Siguiente paso

Conectar este servicio a una acción controlada de la UI, por ejemplo:

- botón interno de "Probar sync cloud"
- flujo de guardar paquete GPS
- panel de backend GPS

La conexión debe hacerse con cuidado para no romper la demo actual.
