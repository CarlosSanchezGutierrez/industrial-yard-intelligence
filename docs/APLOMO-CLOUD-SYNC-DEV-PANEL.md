# Panel interno cloud sync — Aplomo Systems

## Objetivo

Este componente permite probar sincronización cloud con Supabase desde una herramienta interna.

## Archivo principal

apps/web/src/internal/AplomoCloudSyncDevPanel.tsx

## Archivos relacionados

- apps/web/src/integrations/companyRepository.ts
- apps/web/src/integrations/gpsSyncService.ts
- apps/web/src/integrations/gpsCaptureRepository.ts
- apps/web/src/integrations/supabaseClient.ts

## Cómo abrirlo

Abrir la app con:

https://aplomosystems.com/?aplomoInternal=1

## Qué permite

- Ver el modo backend.
- Cargar la empresa demo por slug `cooper-t-smith`.
- Llenar automáticamente el `companyId`.
- Probar una captura GPS contra Supabase.
- Ver el resultado de sincronización.

## Requisito

Primero deben existir variables reales:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Y el schema debe estar ejecutado en Supabase.

## Importante

No aparece en la demo normal.

No afecta el flujo principal.

Es una herramienta interna.
