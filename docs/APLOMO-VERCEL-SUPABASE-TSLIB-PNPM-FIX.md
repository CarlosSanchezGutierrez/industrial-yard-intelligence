# Fix Supabase tslib para Vercel — Aplomo Systems

## Problema

Vercel falló durante el build porque Vite/Rolldown no pudo resolver `tslib` desde `@supabase/functions-js`.

## Causa

`@supabase/supabase-js` trae paquetes internos. Uno de ellos, `@supabase/functions-js`, requiere `tslib`.

Con pnpm estricto y Vercel/Rolldown, esa dependencia debe quedar claramente disponible.

## Solución aplicada

Se agregó:

- `tslib` en workspace root.
- `tslib` en `apps/web`.
- `pnpm.packageExtensions` para forzar `tslib` como dependencia de `@supabase/functions-js`.

## Validación

Deben pasar:

pnpm install
pnpm --filter @iyi/web... build
pnpm typecheck

## Nota

Si Vercel vuelve a fallar con el mismo error, hacer redeploy sin cache en Vercel.
