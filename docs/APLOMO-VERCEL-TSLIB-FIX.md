# Fix Vercel tslib — Aplomo Systems

## Problema

Vercel falló durante el build de `apps/web`.

El error real fue:

Rolldown failed to resolve import "tslib"

El import venía desde:

@supabase/functions-js

## Causa

Después de agregar `@supabase/supabase-js`, una dependencia interna de Supabase necesita `tslib`.

En local puede pasar por resolución/caché/hoisting, pero en Vercel con pnpm y Rolldown el build fue más estricto.

## Solución

Agregar `tslib` como dependencia directa de `apps/web`.

Comando usado:

pnpm --filter @iyi/web add tslib

## Validación

Después del fix deben pasar:

pnpm --filter @iyi/web... build
pnpm typecheck

## Nota

El warning de Vercel sobre Node `>=24.0.0` no fue el error directo.

El error directo fue la falta de resolución de `tslib`.
