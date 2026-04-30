# Variables de entorno Supabase — Aplomo Systems

## Objetivo

Preparar la app web para conectarse a Supabase cuando el backend público exista.

Este paso no conecta todavía la app. Solo deja la configuración lista y segura.

## Archivo creado

apps/web/.env.example

## Variables públicas

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Estas variables pueden usarse en frontend.

## Variable prohibida en frontend

SUPABASE_SERVICE_ROLE_KEY

Esa llave nunca debe ponerse en la app web.

## Cómo usarlo después

Cuando ya exista proyecto Supabase real:

1. Copiar `apps/web/.env.example`.
2. Crear `apps/web/.env.local`.
3. Pegar valores reales.
4. No commitear `.env.local`.
5. Probar build.

## Regla

Primero se configura.

Después se conecta una sola función real:

Crear captura GPS.
