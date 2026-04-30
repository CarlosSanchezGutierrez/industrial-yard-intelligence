# Supabase setup V1 — Aplomo Systems

## Objetivo

Este documento prepara el primer backend real para Aplomo Systems usando Supabase/PostgreSQL.

No conecta todavía el frontend. Solo deja listo el schema base para piloto.

## Archivo SQL

El schema está en:

docs/sql/aplomo_schema_v1.sql

## Qué crea

- companies
- sites
- yards
- zones
- materials
- profiles
- stockpiles
- gps_captures
- evidence_files
- audit_events

## Qué permite

Este modelo permite guardar:

- Empresas.
- Sitios.
- Patios.
- Zonas.
- Materiales.
- Pilas de material.
- Usuarios/perfiles.
- Capturas GPS.
- Evidencia.
- Auditoría.

## Decisión técnica

Se usa PostgreSQL normal con columnas `jsonb` para GeoJSON.

Eso evita depender de PostGIS desde el primer día.

PostGIS puede agregarse después cuando el piloto necesite consultas geoespaciales más avanzadas.

## Orden recomendado

1. Crear proyecto Supabase.
2. Abrir SQL Editor.
3. Pegar `docs/sql/aplomo_schema_v1.sql`.
4. Ejecutar.
5. Confirmar que se crean las tablas.
6. Crear Storage bucket para evidencia.
7. Después conectar frontend con variables de entorno.

## Variables futuras

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

Importante:

La service role key no debe ir en el frontend.

## Siguiente implementación

Después de este schema, lo que sigue es crear un cliente Supabase en la app web y conectar solo una función real:

Crear captura GPS.

No conviene conectar todo al mismo tiempo.
