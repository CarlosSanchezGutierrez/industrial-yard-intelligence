# Supabase Auth + GPS Capture Write MVP

## Objetivo

Agregar login real y escritura real de capturas GPS hacia Supabase.

## Archivos

- apps/web/src/integrations/aplomoSupabaseGpsCaptureRepository.ts
- apps/web/src/internal/AplomoSupabaseGpsCapturePanel.tsx
- supabase/migrations/20260430000300_aplomo_mvp_write_policies.sql

## QuÃ© hace

- Login con email/password.
- Signup con email/password.
- Crea/actualiza aplomo_profiles para el usuario.
- Lee memberships, sitios, dispositivos y stockpiles visibles por RLS.
- Pide ubicaciÃ³n del navegador.
- Inserta en aplomo_gps_captures.
- Actualiza aplomo_latest_device_positions cuando hay dispositivo elegido.
- Inserta audit log bÃ¡sico.

## Importante

Para que la escritura funcione, debes correr en Supabase SQL Editor la migraciÃ³n:

supabase/migrations/20260430000300_aplomo_mvp_write_policies.sql

## Flujo de prueba

1. Tener usuario en Supabase Auth.
2. Tener fila en aplomo_profiles.
3. Tener membership activa en aplomo_company_memberships.
4. Abrir http://localhost:5173/?aplomoInternal=1.
5. Iniciar sesiÃ³n.
6. Elegir dispositivo.
7. Guardar captura GPS real.
8. Verificar la fila en aplomo_gps_captures.
