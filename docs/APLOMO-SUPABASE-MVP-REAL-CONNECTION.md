# Supabase MVP real — Aplomo Systems

## Objetivo

Conectar la app web al proyecto real de Supabase creado para el MVP.

## Archivos agregados

- apps/web/src/integrations/aplomoSupabaseMvpRepository.ts
- apps/web/src/internal/AplomoSupabaseMvpPanel.tsx
- apps/web/.env.example

## Variables requeridas

Crear apps/web/.env.local con:

VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_PUBLIC_KEY

## Qué lee

- aplomo_devices
- aplomo_latest_device_positions
- aplomo_gps_captures
- aplomo_stockpiles
- aplomo_material_types

## Importante

La anon key puede ir en frontend.

La service role key nunca va en frontend.

## Ver en app

Local:

http://localhost:5173/?aplomoInternal=1

Producción:

https://aplomosystems.com/?aplomoInternal=1
